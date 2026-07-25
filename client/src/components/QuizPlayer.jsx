import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, XCircle, RotateCcw, AlertTriangle, ChevronRight, BookOpen } from 'lucide-react';

export default function QuizPlayer({ quizId, onQuizCompleted }) {
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // indices of chosen options
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    setLoading(true);
    setError('');
    setSubmitted(false);
    setResult(null);
    setCurrentIdx(0);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/quiz/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('This quiz is locked. Subscribe to premium to unlock.');
        }
        throw new Error('Failed to load quiz details.');
      }
      const data = await res.json();
      setQuiz(data);
      setAnswers(new Array(data.questions.length).fill(null));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred loading quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIdx) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Validate that all questions are answered
    if (answers.some(a => a === null)) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/quiz/${quizId}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      });

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
        <h4 style={{ color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '750', marginBottom: '10px' }}>Syllabus Module Locked</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6', maxWidth: '340px', margin: '0 auto 24px auto' }}>{error}</p>
        <button onClick={fetchQuiz} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '13.5px' }}>Try Again</button>
      </div>
    );
  }

  if (submitted && result) {
    const isPassing = result.percentage >= 50;
    return (
      <div className="quiz-card">
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
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginTop: '16px', maxWidth: '400px', margin: '16px auto 0 auto', lineHeight: '1.6' }}>
            {result.percentage >= 80 
              ? 'Outstanding score! You have completely mastered this chapter curriculum.' 
              : result.percentage >= 50 
              ? 'Clear pass. Review the revision PDF formula sheets to secure a perfect score.' 
              : 'Score is below qualifying criteria. Review the chapter lecture and retake.'}
          </p>
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
    <div className="quiz-card" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      {/* Header bar progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--secondary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>KNOWLEDGE CHECK</span>
          <h4 style={{ fontSize: '16.5px', fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontWeight: '750', marginTop: '2px' }}>{quiz.title}</h4>
        </div>
        <span style={{ 
          fontSize: '12.5px', 
          color: 'var(--text-muted)', 
          fontWeight: '700',
          backgroundColor: 'hsl(210, 40%, 96%)',
          padding: '4px 12px',
          borderRadius: '20px'
        }}>
          Question {currentIdx + 1} of {quiz.questions.length}
        </span>
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

      {/* Options grid */}
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
              onMouseOver={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--text-muted)';
                  e.currentTarget.style.backgroundColor = 'hsl(210, 40%, 97%)';
                }
              }}
              onMouseOut={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.backgroundColor = 'hsl(210, 40%, 99%)';
                }
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

      {/* Nav Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
        <button
          type="button"
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          className="btn btn-outline"
          disabled={currentIdx === 0}
          style={{ opacity: currentIdx === 0 ? 0.4 : 1, pointerEvents: currentIdx === 0 ? 'none' : 'auto', padding: '10px 24px', borderRadius: '10px', fontSize: '13.5px', borderWidth: '1.5px' }}
        >
          Previous
        </button>

        {currentIdx === quiz.questions.length - 1 ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-secondary"
            style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px' }}
          >
            <span>Finish & Grade</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentIdx(prev => Math.min(quiz.questions.length - 1, prev + 1))}
            className="btn btn-primary"
            style={{ padding: '12px 28px', borderRadius: '10px', fontSize: '14px' }}
          >
            <span>Next Question</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
