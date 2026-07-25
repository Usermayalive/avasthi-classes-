import React, { useState, useEffect, useRef } from 'react';
import { Award, CheckCircle, XCircle, RotateCcw, AlertTriangle, ChevronRight, BookOpen, Clock } from 'lucide-react';

export default function QuizPlayer({ quizId, onQuizCompleted }) {
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // indices of chosen options
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPublicQuiz, setIsPublicQuiz] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);

  // Handle countdown logic
  useEffect(() => {
    if (submitted || timeLeft <= 0 || !quiz) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, submitted, quiz]);

  const fetchQuiz = async () => {
    setLoading(true);
    setError('');
    setSubmitted(false);
    setResult(null);
    setCurrentIdx(0);
    setIsPublicQuiz(false);

    try {
      const token = localStorage.getItem('token');
      let res;
      
      if (token) {
        res = await fetch(`/api/courses/quiz/${quizId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (!token || !res.ok) {
        // Fallback to public quiz fetching
        const publicRes = await fetch(`/api/courses/public/quiz/${quizId}`);
        if (!publicRes.ok) {
          throw new Error('This quiz is locked or not found.');
        }
        const publicData = await publicRes.json();
        setQuiz(publicData);
        setAnswers(new Array(publicData.questions.length).fill(null));
        setIsPublicQuiz(true);
        setTimeLeft(publicData.questions.length * 45); // 45 seconds per question
      } else {
        const data = await res.json();
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(null));
        setTimeLeft(data.questions.length * 45);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred loading quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIdx) => {
    if (submitted) return;

    // Save selection
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optIdx;
    setAnswers(newAnswers);

    // Auto advance after 300ms delay to show feedback
    setTimeout(() => {
      if (currentIdx < quiz.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        // Last question, submit test
        handleSubmit(newAnswers);
      }
    }, 300);
  };

  // Called automatically when timer runs out
  const handleAutoSubmit = () => {
    alert("Time is up! Submitting your answers automatically for grading.");
    handleSubmit();
  };

  const handleSubmit = async (answersToSubmit = answers) => {
    setError('');
    setLoading(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const token = localStorage.getItem('token');
      // Replace unselected indices with 0 to prevent grading errors
      const sanitizedAnswers = answersToSubmit.map(a => a === null ? 0 : a);

      let res;
      if (isPublicQuiz || !token) {
        res = await fetch(`/api/courses/public/quiz/${quizId}/attempt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: sanitizedAnswers })
        });
      } else {
        res = await fetch(`/api/courses/quiz/${quizId}/attempt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ answers: sanitizedAnswers })
        });
      }

      if (!res.ok) {
        throw new Error('Failed to submit quiz attempt.');
      }

      const data = await res.json();
      setResult(data);
      setSubmitted(true);
      if (onQuizCompleted) {
        onQuizCompleted(data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to grade quiz.');
    } finally {
      setLoading(false);
    }
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '260px', 
        backgroundColor: '#ffffff', 
        borderRadius: '16px', 
        padding: '40px', 
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div className="loading-spinner"></div>
        <div style={{ marginTop: '20px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14.5px' }}>Assembling quiz papers...</div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div style={{ 
        padding: '40px 32px', 
        backgroundColor: '#ffffff', 
        borderRadius: '16px', 
        border: '1px solid var(--border-color)', 
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--danger-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <AlertTriangle size={30} color="var(--danger)" />
        </div>
        <h4 style={{ color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '750', marginBottom: '10px' }}>Test Locked / Error</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6', maxWidth: '340px', margin: '0 auto 24px auto' }}>{error}</p>
        <button onClick={fetchQuiz} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '13.5px' }}>Try Again</button>
      </div>
    );
  }

  if (submitted && result) {
    const isPassing = result.percentage >= 50;
    return (
      <div className="quiz-card" style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px', borderBottom: '1px solid var(--border-color)', paddingBottom: '32px' }}>
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            backgroundColor: isPassing ? 'var(--success-bg)' : 'var(--danger-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            boxShadow: isPassing ? '0 8px 24px rgba(16, 185, 129, 0.15)' : '0 8px 24px rgba(239, 68, 68, 0.15)'
          }}>
            <Award size={36} color={isPassing ? 'var(--success)' : 'var(--danger)'} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '24px', fontWeight: '800' }}>Quiz Report Sheet</h3>
          <div style={{ 
            fontSize: '44px', 
            fontWeight: '900', 
            color: isPassing ? 'var(--success)' : 'var(--danger)', 
            margin: '12px 0',
            fontFamily: 'var(--font-title)',
            letterSpacing: '-0.02em'
          }}>
            {result.score} <span style={{ fontSize: '20px', color: 'var(--text-muted)', fontWeight: '600' }}>/ {result.totalQuestions}</span>
          </div>
          <div style={{ 
            display: 'inline-flex',
            padding: '6px 16px',
            borderRadius: '30px',
            backgroundColor: isPassing ? 'var(--success-bg)' : 'var(--danger-bg)',
            color: isPassing ? 'var(--success)' : 'var(--danger)',
            fontSize: '13px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {result.percentage}% • {isPassing ? 'PASSED' : 'RETAKE NEEDED'}
          </div>
        </div>

        {/* Detailed Correction list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>Review Corrections</h4>
          {result.details.map((item, idx) => (
            <div key={idx} style={{ 
              padding: '20px', 
              borderRadius: '12px', 
              backgroundColor: item.isCorrect ? 'var(--success-bg)' : 'var(--danger-bg)', 
              border: `1px solid ${item.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}` 
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontWeight: '700', fontSize: '15px', color: 'var(--primary-dark)', marginBottom: '12px' }}>
                <span style={{ 
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: item.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: item.isCorrect ? 'var(--success)' : 'var(--danger)',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>{idx + 1}</span>
                <span style={{ lineHeight: '1.4' }}>{item.questionText}</span>
              </div>
              <div style={{ paddingLeft: '36px', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ color: 'var(--text-muted)' }}>
                  Your Choice: <strong style={{ color: item.isCorrect ? 'var(--success)' : 'var(--danger)' }}>{item.options[item.submittedIndex]}</strong>
                </div>
                {!item.isCorrect && (
                  <div style={{ color: 'var(--text-main)' }}>
                    Correct Answer: <strong style={{ color: 'var(--success)' }}>{item.options[item.correctIndex]}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button onClick={fetchQuiz} className="btn btn-outline" style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', padding: '14px' }}>
          <RotateCcw size={16} />
          <span>Retake Test Module</span>
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];

  return (
    <div className="quiz-card" style={{ animation: 'fadeInUp 0.3s ease-out', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow-lg)' }}>
      {/* Header bar with ticking countdown timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--secondary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>KNOWLEDGE DIAGNOSTIC TEST</span>
          <h4 style={{ fontSize: '16.5px', fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontWeight: '750', marginTop: '2px' }}>{quiz.title}</h4>
        </div>
        
        {/* IIIT Pune style Countdown Timer */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: timeLeft < 30 ? 'var(--danger)' : 'var(--secondary)',
          backgroundColor: timeLeft < 30 ? 'var(--danger-bg)' : 'var(--secondary-glow)',
          padding: '6px 14px',
          borderRadius: '50px',
          fontWeight: '800',
          fontSize: '14px'
        }}>
          <Clock size={16} style={{ animation: timeLeft < 30 ? 'blinkGlow 1.2s infinite ease' : 'none' }} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '14px', borderRadius: '10px', fontSize: '13.5px', marginBottom: '20px', fontWeight: '550' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Bar indicator */}
      <div style={{ marginBottom: '28px' }}>
        <div className="progress-bar-container" style={{ height: '6px' }}>
          <div className="progress-bar-fill" style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}></div>
        </div>
      </div>

      {/* Question Headline */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '18.5px', fontWeight: '700', color: 'var(--primary-dark)', lineHeight: '1.4' }}>
          {currentQuestion.questionText}
        </h3>
      </div>

      {/* Options grid (ticking auto-advances to next question) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {currentQuestion.options.map((opt, oIdx) => {
          const isSelected = answers[currentIdx] === oIdx;
          return (
            <button
              key={oIdx}
              type="button"
              onClick={() => handleSelectOption(oIdx)}
              className={`quiz-option ${isSelected ? 'selected' : ''}`}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: isSelected ? 'var(--primary-glow)' : 'hsl(210, 40%, 99%)',
                color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                <span style={{
                  display: 'inline-flex',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: isSelected ? 'var(--primary)' : 'hsl(210, 40%, 92%)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '11.5px',
                  transition: 'all 0.2s ease'
                }}>
                  {String.fromCharCode(65 + oIdx)}
                </span>
                <span style={{ fontSize: '14.5px', fontWeight: isSelected ? '600' : '500', textAlign: 'left', lineHeight: '1.4' }}>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Skip question info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
        <button
          type="button"
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          className="btn btn-outline"
          disabled={currentIdx === 0}
          style={{ opacity: currentIdx === 0 ? 0.4 : 1, pointerEvents: currentIdx === 0 ? 'none' : 'auto', padding: '10px 24px', borderRadius: '10px', fontSize: '13.5px' }}
        >
          Previous
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600' }}>
          Question {currentIdx + 1} of {quiz.questions.length}
        </span>
      </div>
    </div>
  );
}
