import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PaymentModal from './components/PaymentModal';
import QuizPlayer from './components/QuizPlayer';
import { 
  Play, Lock, FileText, CheckCircle, HelpCircle, 
  BookOpen, Video, Trash2, Edit3, Plus, UserCheck, 
  DollarSign, GraduationCap, Calendar, ExternalLink, 
  ArrowRight, Shield, Award, Users, FileCheck, Layers
} from 'lucide-react';

export default function App() {
  // Session State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  
  // Navigation State
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');
  
  // App-wide Data State
  const [courses, setCourses] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [activePdfUrl, setActivePdfUrl] = useState(null);

  // Overlay / Pop-up State
  const [paymentCourse, setPaymentCourse] = useState(null);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  
  // Loading indicators
  const [loading, setLoading] = useState(true);

  // Listen to hash router modifications
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setCurrentPath(hash);
      
      // Parse active course ID from hashes like #/course/c-class-9-science
      if (hash.startsWith('#/course/')) {
        const id = hash.replace('#/course/', '');
        setActiveCourseId(id);
      }
      
      // Scroll back to top on page load
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // trigger on load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch initial profile & catalog data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchCourses();
      await fetchBlogs();
      if (token) {
        await verifySession(token);
        await fetchUserProgress();
      }
      setLoading(false);
    };
    initializeData();
  }, [token]);

  // Navigate utility
  const navigateTo = (hash) => {
    window.location.hash = hash;
  };

  // API wrappers
  const verifySession = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token expired/invalid
        handleLogout();
      }
    } catch (e) {
      console.error('Session check failed', e);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (e) {
      console.error('Failed to load courses', e);
    }
  };

  const fetchBlogs = async () => {
    // Seed backend database or load blogs. Express routes don't define custom blog endpoint, so we simulate loading static json blogs seeded in DB
    try {
      // Fetch user mock endpoint (blogs are loaded directly)
      const mockBlogs = [
        {
          id: "blog1",
          title: "How to Crack RAS Prelims: Rajasthan GK Strategy",
          summary: "Rajasthan GK holds around 35-40% weightage in RAS Prelims. Learn the exact topic weightage and reference books to score high.",
          author: "V. K. Avasthi (General Studies)", date: "June 25, 2026",
          image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400"
        },
        {
          id: "blog2",
          title: "REET Child Pedagogy: Tips for Scoring 30/30",
          summary: "BAAL VIKAS is a core section in REET. Master Piaget, Vygotsky theories and teaching methods to secure full marks.",
          author: "P. Avasthi (Pedagogy Director)", date: "June 28, 2026",
          image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400"
        },
        {
          id: "blog3",
          title: "Common Eligibility Test (CET) Prep Strategy",
          summary: "Balancing graduation level and 12th level CET. Focus on Computer, English, and Mental Ability topics.",
          author: "R. Sharma (Mental Ability HOD)", date: "June 20, 2026",
          image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=400"
        },
        {
          id: "blog4",
          title: "Important Milestones in Rajasthan's Integration",
          summary: "Understand the 7 stages of Rajasthan formation between 1948 and 1956, a must-know topic for all state exams.",
          author: "A. Dwivedi (History Faculty)", date: "June 15, 2026",
          image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400"
        }
      ];
      setBlogs(mockBlogs);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserProgress = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/courses/progress/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserProgress(data);
      }
    } catch (e) {
      console.error('Failed to load user progress', e);
    }
  };

  // Auth Operations
  const handleLogin = (authToken, loggedUser) => {
    setToken(authToken);
    setUser(loggedUser);
    localStorage.setItem('token', authToken);
    if (loggedUser.role === 'admin') {
      navigateTo('#/admin');
    } else {
      navigateTo('#/dashboard');
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setUserProgress({});
    localStorage.removeItem('token');
    navigateTo('#/login');
  };

  // Payment Callback
  const handlePaymentSuccess = (paymentId, orderId) => {
    setPaymentCourse(null);
    alert('Payment Received! Your Premium Subscription has been activated. Redirecting to your LMS Dashboard...');
    // Refresh session & progress
    verifySession(token);
    navigateTo('#/dashboard');
  };

  // Progress calculator for course
  const calculateCourseProgress = (courseId, courseData) => {
    if (!courseData || !courseData.chapters) return 0;
    const progress = userProgress[courseId];
    if (!progress) return 0;

    let totalLessons = 0;
    let completedLessons = 0;

    courseData.chapters.forEach(ch => {
      ch.lessons.forEach(les => {
        totalLessons++;
        if (progress[les.id] && progress[les.id].completed) {
          completedLessons++;
        }
      });
    });

    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  };

  /* ========================================================
     PAGES RENDER ROUTES
     ======================================================== */
  
  // 1. Homepage
  const renderHome = () => {
    return (
      <div style={{ backgroundColor: 'var(--bg-main)', overflow: 'hidden' }}>
        {/* ========== HERO SECTION ========== */}
        <section style={{
          background: 'linear-gradient(135deg, var(--primary-dark) 0%, #0c1033 40%, #101545 70%, #171d5e 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 10s ease infinite',
          color: '#ffffff',
          padding: '130px 0 110px 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Dynamic Floating Glow Blobs */}
          <div style={{ 
            position: 'absolute', 
            top: '8%', 
            left: '5%', 
            width: '320px', 
            height: '320px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', 
            filter: 'blur(40px)',
            animation: 'float 7s ease-in-out infinite', 
            pointerEvents: 'none' 
          }}></div>
          <div style={{ 
            position: 'absolute', 
            bottom: '12%', 
            right: '8%', 
            width: '360px', 
            height: '360px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', 
            filter: 'blur(50px)',
            animation: 'floatSlow 9s ease-in-out infinite', 
            pointerEvents: 'none' 
          }}></div>
          
          {/* Dot grid subtle mask overlay */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            opacity: 0.05, 
            backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', 
            backgroundSize: '28px 28px' 
          }}></div>

          <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '960px' }}>
            {/* Tag Badge */}
            <div style={{ animation: 'fadeInUp 0.6s ease forwards', marginBottom: '32px' }}>
              <span style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '8px 24px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '2.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'inline-block' }}></span>
                Rajasthan's Trusted Academy Since 2016
              </span>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: '60px',
              fontWeight: '900',
              lineHeight: '1.15',
              marginBottom: '28px',
              fontFamily: 'var(--font-title)',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              animation: 'fadeInUp 0.8s ease forwards'
            }}>
              Your Gateway to <br />
              <span className="gradient-text" style={{ 
                background: 'linear-gradient(135deg, var(--secondary-light) 0%, #fdba74 50%, #fef08a 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                marginTop: '6px'
              }}>
                Rajasthan Government Jobs
              </span>
            </h1>

            {/* Subtitle description */}
            <p style={{
              fontSize: '19.5px',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: '1.75',
              maxWidth: '720px',
              margin: '0 auto 48px auto',
              animation: 'fadeInUp 1s ease forwards',
              fontWeight: '400'
            }}>
              Expert-led syllabus coaching for <strong style={{ color: 'var(--secondary-light)', fontWeight: '700' }}>RAS, REET, Police SI, Patwar & CET</strong> exams. 
              HD Video lectures, hand-written PDF notes, weekly webinars & mock grading tests.
            </p>

            {/* CTA action buttons */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '72px', animation: 'fadeInUp 1.2s ease forwards' }}>
              <button onClick={() => navigateTo('#/courses')} className="btn btn-secondary" style={{
                padding: '18px 44px',
                fontSize: '16.5px',
                fontWeight: '700',
                borderRadius: '16px'
              }}>
                <span>Explore syllabus Catalog</span>
                <ArrowRight size={18} />
              </button>
              <button onClick={() => navigateTo('#/register')} className="btn btn-outline-white" style={{
                padding: '18px 36px',
                fontSize: '16.5px',
                borderRadius: '16px',
                borderWidth: '2px'
              }}>
                Start Free Demo
              </button>
            </div>

            {/* Stats Dashboard Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
              animation: 'fadeInUp 1.4s ease forwards'
            }}>
              {[
                { num: '10+', label: 'Years Mentoring' },
                { num: '10K+', label: 'Students Guided' },
                { num: '500+', label: 'Final Selections' },
                { num: '98.8%', label: 'Success Rate' }
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px 16px'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--secondary-light)', fontFamily: 'var(--font-title)' }}>{s.num}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== EXAM BADGES MARQUEE ========== */}
        <section style={{ backgroundColor: '#ffffff', padding: '26px 0', borderBottom: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div className="marquee-track" style={{ gap: '20px' }}>
            {[...Array(2)].map((_, setIdx) => (
              <React.Fragment key={setIdx}>
                {[
                  { icon: '🏛️', label: 'RAS Pre & Mains' },
                  { icon: '👩‍🏫', label: 'REET Level 1 & 2' },
                  { icon: '🛡️', label: 'Rajasthan Police SI' },
                  { icon: '👮', label: 'Police Constable' },
                  { icon: '📋', label: 'Patwar Exam' },
                  { icon: '📝', label: 'CET Graduation Level' },
                  { icon: '📘', label: 'CET 12th Level' },
                  { icon: '🏢', label: 'Gram Sevak / VDO' },
                  { icon: '⚖️', label: 'HC LDC' },
                  { icon: '📊', label: 'Junior Accountant' }
                ].map((exam, i) => (
                  <span key={`${setIdx}-${i}`} className="exam-badge">
                    <span style={{ fontSize: '18px' }}>{exam.icon}</span>
                    <span style={{ fontWeight: '600' }}>{exam.label}</span>
                  </span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ========== WHY CHOOSE US — FEATURE CARDS ========== */}
        <section style={{ padding: '120px 0', backgroundColor: 'var(--bg-main)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '72px' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2.5px' }}>WHY AVASTHI CLASSES</span>
              <h2 style={{ fontSize: '42px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginTop: '14px', fontWeight: '800' }}>Everything You Need to Crack State Exams</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '17.5px', maxWidth: '640px', margin: '18px auto 0' }}>
                A highly comprehensive preparation framework tailored by senior state mentors who have guided hundreds of selections.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '28px' }}>
              {[
                { icon: <Video size={28} color="var(--primary)" />, title: 'HD Video Lectures', desc: 'Chapter-wise syllabus explanations by veteran coaching experts, available on-demand.', bg: 'rgba(37,99,235,0.06)' },
                { icon: <FileCheck size={28} color="var(--secondary)" />, title: 'Revision PDF Notes', desc: 'Downloadable hand-written sheets containing memory tricks, timelines, and summaries.', bg: 'rgba(249,115,22,0.06)' },
                { icon: <BookOpen size={28} color="#059669" />, title: 'MCQ Mock Tests', desc: 'Topic-wise sandbox quizzes with instant scorecards, answer review sheets, and grading.', bg: 'rgba(5,150,105,0.06)' },
                { icon: <Users size={28} color="var(--accent-purple)" />, title: 'Live doubt webinars', desc: 'Weekly Zoom classes with coaching directors to resolve tough doubts and paper strategies.', bg: 'var(--accent-purple-glow)' }
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '19px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginBottom: '12px', fontWeight: '750' }}>{f.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.65' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== HOW IT WORKS ========== */}
        <section style={{ padding: '120px 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '72px' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2.5px' }}>GET STARTED IN MINUTES</span>
              <h2 style={{ fontSize: '42px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginTop: '14px', fontWeight: '800' }}>Your Journey to Selection</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '48px', maxWidth: '1000px', margin: '0 auto' }}>
              {[
                { step: '1', title: 'Choose Your Exam Module', desc: 'Select from RAS, REET, SI, Patwar, or CET - each loaded with specialized curriculum.' },
                { step: '2', title: 'Learn & Test Sandboxes', desc: 'Watch explanations, download revision formula notes, and attempt timed MCQ tests.' },
                { step: '3', title: 'Attend Doubt Webinars', desc: 'Interact with coaching directors in live doubt clearing groups to accelerate preparation.' }
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                  <div className="step-number" style={{ margin: '0 auto 24px auto' }}>{s.step}</div>
                  <h3 style={{ fontSize: '20px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginBottom: '12px', fontWeight: '750' }}>{s.title}</h3>
                  <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: '1.65' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== COURSES SHOWCASE ========== */}
        <section style={{ padding: '120px 0', backgroundColor: 'var(--bg-main)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '56px' }}>
              <div>
                <span style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2.5px' }}>OUR SHOWCASE</span>
                <h2 style={{ fontSize: '42px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginTop: '12px', fontWeight: '800' }}>Syllabus Packages</h2>
              </div>
              <button onClick={() => navigateTo('#/courses')} className="btn btn-outline" style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '14px', borderWidth: '1.5px' }}>
                <span>All Syllabus Packages</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="course-grid">
              {courses.slice(0, 3).map(course => (
                <div key={course.id} className="course-card">
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img src={course.thumbnail} alt={course.title} className="course-thumb" style={{ transition: 'transform 0.4s ease' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                    <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: 'var(--secondary)', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Coaching Module
                    </div>
                  </div>
                  <div className="course-info">
                    <h3 className="course-title" style={{ fontSize: '18px', fontWeight: '750' }}>{course.title}</h3>
                    <p className="course-desc">{course.description}</p>
                    <div className="course-footer">
                      <span className="course-price">₹{course.price}</span>
                      <button onClick={() => navigateTo(`#/course/${course.id}`)} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '8px' }}>
                        <span>Syllabus details</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== TESTIMONIALS ========== */}
        <section style={{ padding: '120px 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--border-color)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '72px' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2.5px' }}>TOPPERS SUCCESS</span>
              <h2 style={{ fontSize: '42px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginTop: '14px', fontWeight: '800' }}>Toppers From Avasthi Classes</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '17px', marginTop: '12px' }}>Real results logged from previous competitive exam cycles.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
              {[
                { initials: 'RM', name: 'Rahul Mishra', result: 'RAS 2025 — Rank 42', text: 'The history and geography lecture maps are exceptionally accurate. The handwritten formula sheets let me revise RAS topics efficiently in the last sprint.', color: 'var(--primary)' },
                { initials: 'SG', name: 'Sneha Gupta', result: 'REET Level 2 — Selected', text: 'Child development and pedagogy notes are a masterpiece. The interactive quiz player gave me immediate grading and analysis reports.', color: '#059669' },
                { initials: 'AD', name: 'Amit Dwivedi', result: 'Police SI — Selected', text: 'Outstanding GK lectures and Zoom doubt webinars. The mock PDF worksheets match the difficulty metrics of actual state tests.', color: 'var(--accent-purple)' }
              ].map((t, i) => (
                <div key={i} className="testimonial-card">
                  <span className="quote-mark">"</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`,
                      color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', fontSize: '18px', fontFamily: 'var(--font-title)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>{t.initials}</div>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--primary-dark)', fontSize: '16px' }}>{t.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: '700', marginTop: '2px' }}>{t.result}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: '1.7', fontStyle: 'italic' }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '20px' }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: '#f59e0b', fontSize: '16px' }}>★</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CTA BANNER ========== */}
        <section style={{ padding: '0 0 120px 0', backgroundColor: 'var(--bg-main)' }}>
          <div className="container">
            <div className="cta-banner">
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h2 style={{ fontSize: '42px', fontWeight: '900', fontFamily: 'var(--font-title)', marginBottom: '18px', color: '#ffffff' }}>
                  Ready to Secure Your Selection?
                </h2>
                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', marginBottom: '40px', maxWidth: '580px', margin: '0 auto 40px auto', lineHeight: '1.65' }}>
                  Join thousands of successful state aspirants today. Log in and unlock free chapters in less than two minutes.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <button onClick={() => navigateTo('#/register')} className="btn btn-secondary" style={{
                    padding: '18px 44px',
                    fontSize: '16.5px',
                    fontWeight: '700',
                    borderRadius: '16px'
                  }}>
                    <span>Sign Up Free Demo</span>
                    <ArrowRight size={18} />
                  </button>
                  <button onClick={() => navigateTo('#/pricing')} className="btn btn-outline-white" style={{
                    padding: '18px 36px',
                    fontSize: '16.5px',
                    borderRadius: '16px',
                    borderWidth: '2px'
                  }}>
                    View Fee Plans
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  // 2. About Us
  const renderAbout = () => {
    return (
      <div className="container" style={{ padding: '80px 28px', maxWidth: '840px', animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>OUR STORY</span>
          <h2 style={{ fontSize: '38px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginTop: '8px', fontWeight: '800' }}>About Avasthi Classes</h2>
        </div>
        
        <div className="glass" style={{ padding: '40px', borderRadius: '20px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
          <p style={{ fontSize: '16.5px', color: 'var(--text-main)', lineHeight: '1.85', marginBottom: '24px' }}>
            Founded in 2016, <strong>Avasthi Classes</strong> is dedicated to delivering quality coaching for Rajasthan State Competitive Examinations. Our coaching centre in Hindaun City has successfully guided hundreds of aspirants to crack RAS, REET, Police SI, Patwar & CET exams.
          </p>
          <p style={{ fontSize: '16.5px', color: 'var(--text-main)', lineHeight: '1.85', marginBottom: '24px' }}>
            To adapt to modern classrooms, our Online LMS Platform combines premium digital content—lectures, curated formula sheets, PDF worksheets, and MCQ quizzes—with structured offline-like live doubt clearing webinars.
          </p>
          <div style={{
            background: 'linear-gradient(90deg, #fff7ed 0%, #fffbf5 100%)',
            padding: '28px',
            borderRadius: '16px',
            borderLeft: '4px solid var(--secondary)',
            marginTop: '36px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--secondary-dark)', marginBottom: '10px', fontSize: '18px', fontWeight: '750' }}>Our Mission</h4>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
              To deliver highly organized, exam-focused, and competitive level coaching packages for Rajasthan state exams at highly affordable prices, removing barriers for self-studying aspirants.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 3. Contact Us
  const renderContact = () => {
    return (
      <div className="container" style={{ padding: '80px 28px', maxWidth: '640px', animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>SUPPORT CENTER</span>
          <h2 style={{ fontSize: '38px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginTop: '8px', fontWeight: '800' }}>Get in Touch</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '15px', lineHeight: '1.6' }}>
            Have questions about syllabus modules, pricing packages, or study handouts? Drop your details and our team will follow up.
          </p>
        </div>

        <form onSubmit={e => { e.preventDefault(); alert('Query submitted. Our team will contact you in 24 hours.'); }} className="glass" style={{
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)'
        }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="Enter name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="name@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Your Inquiry Message</label>
            <textarea className="form-input" rows="4" placeholder="How can we help you?" required style={{ resize: 'vertical' }}></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '15px' }}>Send Inquiry Message</button>
        </form>
      </div>
    );
  };

  // 4. Courses Catalog listing
  const renderCoursesCatalog = () => {
    return (
      <div className="container" style={{ padding: '80px 28px', animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>SYLLABUS FILES</span>
          <h2 style={{ fontSize: '38px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginTop: '8px', fontWeight: '800' }}>Course Catalog</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15.5px', marginTop: '10px' }}>Choose your exam preparation module and start learning immediately.</p>
        </div>

        <div className="course-grid">
          {courses.map(course => (
            <div key={course.id} className="course-card">
              <div style={{ overflow: 'hidden', position: 'relative' }}>
                <img src={course.thumbnail} alt={course.title} className="course-thumb" style={{ transition: 'transform 0.4s ease' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: 'var(--secondary)', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Coaching Package
                </div>
              </div>
              <div className="course-info">
                <h3 className="course-title" style={{ fontSize: '18px', fontWeight: '750' }}>{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                <div className="course-footer">
                  <span className="course-price">₹{course.price}</span>
                  <button onClick={() => navigateTo(`#/course/${course.id}`)} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '8px' }}>
                    <span>Syllabus details</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 5. Course Detail Page
  const [courseDetail, setCourseDetail] = useState(null);
  const [activeAccordionIndex, setActiveAccordionIndex] = useState(0);

  useEffect(() => {
    if (activeCourseId && currentPath.startsWith('#/course/')) {
      fetchCourseDetail(activeCourseId);
    }
  }, [activeCourseId, currentPath, user]); // trigger when user changes role to upgrade syllabus locks immediately

  const fetchCourseDetail = async (id) => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/courses/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCourseDetail(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLessonAction = (lesson, courseId) => {
    if (!user) {
      alert('Please register/login to view lessons.');
      navigateTo('#/login');
      return;
    }

    if (lesson.isLocked) {
      setPaymentCourse(courseDetail);
      return;
    }

    // Redirect to Course Player in Dashboard
    navigateTo(`#/dashboard/player/${courseId}`);
  };

  const renderCourseDetail = () => {
    if (!courseDetail) return <div className="container" style={{ padding: '120px 28px', textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div><div style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Loading Course Syllabus...</div></div>;

    const isEnrolled = user && (user.role === 'premium_student' || user.role === 'admin');

    return (
      <div className="container" style={{ padding: '80px 28px', animation: 'fadeInUp 0.4s ease' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 0.75fr',
          gap: '48px',
          alignItems: 'start'
        }}>
          {/* Left Block - Title & Syllabus Accordion */}
          <div>
            <span style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>SYLLABUS DETAILED SHEET</span>
            <h2 style={{ fontSize: '38px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginTop: '8px', marginBottom: '16px', fontWeight: '800' }}>{courseDetail.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '44px', fontSize: '16px', lineHeight: '1.75' }}>{courseDetail.description}</p>
            
            <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '22px', fontWeight: '750', marginBottom: '8px' }}>Course Syllabus</h3>
            
            {/* Chapters Accordion */}
            <div className="accordion">
              {courseDetail.chapters.map((chapter, index) => {
                const isOpen = activeAccordionIndex === index;
                return (
                  <div key={chapter.id} className="accordion-item" style={{ borderBottom: index === courseDetail.chapters.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                    <button onClick={() => setActiveAccordionIndex(isOpen ? -1 : index)} className="accordion-trigger" style={{ backgroundColor: isOpen ? 'hsl(210, 40%, 98.5%)' : 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: chapter.isLocked ? 'hsl(210, 40%, 93%)' : 'rgba(16, 185, 129, 0.12)'
                        }}>
                          {chapter.isLocked ? <Lock size={15} color="var(--text-muted)" /> : <CheckCircle size={15} color="var(--success)" />}
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--primary-dark)', fontSize: '16.5px' }}>{chapter.title}</span>
                      </div>
                      <span style={{ 
                        fontSize: '11.5px', 
                        color: chapter.isLocked ? 'var(--text-muted)' : 'var(--success)', 
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        backgroundColor: chapter.isLocked ? 'hsl(210, 20%, 90%)' : 'var(--success-bg)',
                        padding: '4px 12px',
                        borderRadius: '20px'
                      }}>
                        {chapter.isLocked ? 'Premium' : 'Free Demo'}
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div className="accordion-content">
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>{chapter.description}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {chapter.lessons.map(lesson => (
                            <div key={lesson.id} className="lesson-row">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ color: 'var(--primary-light)' }}>
                                  {lesson.type === 'video' ? <Video size={16} /> : lesson.type === 'pdf' ? <FileText size={16} /> : <HelpCircle size={16} />}
                                </div>
                                <span style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-main)' }}>{lesson.title}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '500' }}>{lesson.duration || ''}</span>
                                {lesson.isLocked ? (
                                  <button onClick={() => handleLessonAction(lesson, courseDetail.id)} style={{
                                    border: 'none', background: 'none', cursor: 'pointer', color: 'var(--secondary)', display: 'flex', padding: '6px'
                                  }}>
                                    <Lock size={15} />
                                  </button>
                                ) : (
                                  <button onClick={() => handleLessonAction(lesson, courseDetail.id)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px' }}>
                                    <span>Access</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Card - Price tag CTA */}
          <div className="glass" style={{
            position: 'sticky',
            top: '100px',
            padding: '36px',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-premium)',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            animation: 'fadeInUp 0.6s ease'
          }}>
            <img src={courseDetail.thumbnail} alt={courseDetail.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '14px', marginBottom: '24px', border: '1px solid var(--border-color)' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '14.5px', color: 'var(--text-muted)', fontWeight: '550' }}>Package Price:</span>
              <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)' }}>₹{courseDetail.price}</span>
            </div>

            {isEnrolled ? (
              <button onClick={() => navigateTo(`#/dashboard/player/${courseDetail.id}`)} className="btn btn-secondary" style={{ width: '100%', padding: '16px', borderRadius: '12px' }}>
                <span>Launch LMS Player</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <button onClick={() => {
                  if (!user) {
                    alert('Please register/login to buy courses.');
                    navigateTo('#/login');
                  } else {
                    setPaymentCourse(courseDetail);
                  }
                }} className="btn btn-secondary" style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: '15.5px' }}>
                  Buy Full Syllabus Now
                </button>
                <button onClick={() => {
                  if (!user) {
                    navigateTo('#/register');
                  } else {
                    navigateTo(`#/dashboard/player/${courseDetail.id}`);
                  }
                }} className="btn btn-outline" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14.5px', borderWidth: '1.5px' }}>
                  Try Free Chapter 1
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px', fontSize: '13.5px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span> 
                <span><strong>Interactive Player:</strong> Progress auto-saver</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>
                <span><strong>Download DPPs:</strong> Solved PDF worksheets</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>
                <span><strong>MCQ grading:</strong> Immediate scorecard reports</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>
                <span><strong>Live doubt webinars:</strong> Q&A links included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 6. Pricing List
  const renderPricing = () => {
    const PricingFeature = ({ text, included = true }) => (
      <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: included ? 'var(--text-main)' : 'var(--text-muted)' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
          backgroundColor: included ? 'rgba(16, 185, 129, 0.12)' : 'hsl(210, 20%, 92%)',
          color: included ? 'var(--success)' : 'var(--text-muted)', fontSize: '11px', fontWeight: '800'
        }}>{included ? '✓' : '✗'}</span>
        <span style={{ textDecoration: included ? 'none' : 'line-through' }}>{text}</span>
      </li>
    );

    return (
      <div className="container" style={{ padding: '80px 28px', animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>FEE STRUCTURE</span>
          <h2 style={{ fontSize: '38px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginTop: '8px', fontWeight: '800' }}>Transparent Pricing Plans</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15.5px', marginTop: '10px' }}>Invest in your academic success. All options include mock sandbox payments.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: '28px', alignItems: 'stretch', maxWidth: '1040px', margin: '0 auto' }}>
          {/* Monthly plan */}
          <div className="glass" style={{ padding: '36px', borderRadius: '20px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '20px', fontWeight: '750' }}>Monthly Pass</h3>
            <div style={{ margin: '18px 0 8px 0' }}>
              <span style={{ fontSize: '40px', fontWeight: '900', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)' }}>₹999</span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '4px' }}>/ month</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: '1.6' }}>Ideal for short-term focused preparation sprints before exam dates.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px', flexGrow: 1, padding: 0 }}>
              <PricingFeature text="Full video syllabus access" />
              <PricingFeature text="PDF Handouts & DPP downloads" />
              <PricingFeature text="Chapter grading test questions" />
              <PricingFeature text="Zoom live doubt webinar links" included={false} />
            </ul>
            <button onClick={() => navigateTo('#/courses')} className="btn btn-outline" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14.5px' }}>Enroll Course</button>
          </div>

          {/* Yearly plan — Recommended */}
          <div className="glass" style={{ 
            padding: '40px 36px', borderRadius: '24px', display: 'flex', flexDirection: 'column', 
            border: '2.5px solid var(--secondary)', backgroundColor: '#ffffff',
            transform: 'scale(1.04)', boxShadow: 'var(--shadow-premium)', position: 'relative'
          }}>
            <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--secondary) 0%, hsl(15, 90%, 48%) 100%)', color: '#ffffff', fontSize: '11px', fontWeight: '800', padding: '5px 18px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recommended</span>
            <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '22px', fontWeight: '800', marginTop: '4px' }}>Full Year Exam Pass</h3>
            <div style={{ margin: '18px 0 8px 0' }}>
              <span style={{ fontSize: '44px', fontWeight: '900', color: 'var(--secondary)', fontFamily: 'var(--font-title)' }}>₹4,999</span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '4px' }}>/ year</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: '1.6' }}>Complete curriculum syllabus for all Rajasthan state exams.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px', flexGrow: 1, padding: 0 }}>
              <PricingFeature text="Full video syllabus access" />
              <PricingFeature text="PDF Handouts & DPP downloads" />
              <PricingFeature text="Chapter grading test questions" />
              <PricingFeature text={<strong>Live Doubt webinars (Zoom/Meet)</strong>} />
              <PricingFeature text="Prev Year Exam Papers solutions" />
            </ul>
            <button onClick={() => navigateTo('#/courses')} className="btn btn-secondary" style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: '15px' }}>Enroll Course</button>
          </div>

          {/* Lifetime plan */}
          <div className="glass" style={{ padding: '36px', borderRadius: '20px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '20px', fontWeight: '750' }}>Lifetime Access</h3>
            <div style={{ margin: '18px 0 8px 0' }}>
              <span style={{ fontSize: '40px', fontWeight: '900', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)' }}>₹7,999</span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '4px' }}>one-time</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: '1.6' }}>One-time payment. Full access to present & future exam courses.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px', flexGrow: 1, padding: 0 }}>
              <PricingFeature text="Access to RAS, REET, Police & CET courses" />
              <PricingFeature text="PDF Handouts & DPP downloads" />
              <PricingFeature text="Chapter grading test questions" />
              <PricingFeature text="Live Doubt webinars (Zoom/Meet)" />
              <PricingFeature text="Free revisions & future uploads" />
            </ul>
            <button onClick={() => navigateTo('#/courses')} className="btn btn-outline" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14.5px' }}>Enroll Course</button>
          </div>
        </div>
      </div>
    );
  };

  // 7. Study Tips Blog listing & reading
  const [selectedBlog, setSelectedBlog] = useState(null);
  const renderBlog = () => {
    if (selectedBlog) {
      return (
        <div className="container" style={{ padding: '60px 24px', maxWidth: '800px' }}>
          <button onClick={() => setSelectedBlog(null)} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px', marginBottom: '20px' }}>← Back to Articles</button>
          <img src={selectedBlog.image} alt={selectedBlog.title} style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: '12px', marginBottom: '24px' }} />
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            <span>By {selectedBlog.author}</span>
            <span>•</span>
            <span>{selectedBlog.date}</span>
          </div>
          <h2 style={{ fontSize: '32px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginBottom: '20px', lineHeight: '1.3' }}>{selectedBlog.title}</h2>
          <div style={{ fontSize: '16px', color: 'var(--text-main)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
            {selectedBlog.content || 'Content not seeded.'}
          </div>
        </div>
      );
    }

    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)' }}>Study Tips & Exam Prep Blog</h2>
          <p style={{ color: 'var(--text-muted)' }}>Proven strategies and advice to crack Rajasthan state competitive exams.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {blogs.map(blog => (
            <div key={blog.id} className="course-card" style={{ cursor: 'pointer' }} onClick={() => {
              // Full blog has body content. We find the one seeded inside blogs array or hardcode
              const fullData = dbBlogsFull[blog.id] || blog;
              setSelectedBlog(fullData);
            }}>
              <img src={blog.image} alt={blog.title} className="course-thumb" />
              <div className="course-info" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span>{blog.date}</span>
                  <span>{blog.author.split(' ')[0]}</span>
                </div>
                <h3 style={{ fontSize: '16px', color: 'var(--primary-dark)', marginBottom: '10px', fontFamily: 'var(--font-title)' }}>{blog.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{blog.summary}</p>
                <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Read Article</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Static Full Blog Data matching seeded ones in db.js
  const dbBlogsFull = {
    blog1: {
      id: "blog1",
      title: "How to Crack RAS Prelims: Rajasthan GK Strategy",
      author: "V. K. Avasthi (Senior General Studies Faculty)",
      date: "June 25, 2026",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400",
      content: "Cracking the RAS (Rajasthan Administrative Services) exam requires a solid grip on Rajasthan General Knowledge (GK). Out of 150 questions in the Prelims paper, about 50-60 questions are directly related to Rajasthan's history, art, culture, geography, polity, and economy.\n\nFocus first on Rajasthan's Art and Culture, as it has the highest consistency in exam questions—memorize major forts, temples, folk deities, and festivals. For geography, map-based study is extremely effective for rivers, minerals, and physical divisions. Keep revising from standard textbooks and take mock tests weekly. Remember, consistency is the key to securing a top rank in state services!"
    },
    blog2: {
      id: "blog2",
      title: "REET Child Pedagogy: Tips for Scoring 30/30",
      author: "P. Avasthi (CD & Pedagogy Director)",
      date: "June 28, 2026",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400",
      content: "Baal Vikas (Child Development and Pedagogy) is one of the most scoring sections in the REET exam. To score 30 out of 30, you need to understand the practical application of child development theories.\n\nPay special attention to Piaget's stages of cognitive development, Kohlberg's moral development, and Vygotsky's socio-cultural theory. Practice situational questions where you act as a facilitator in an inclusive classroom. Additionally, ensure you are well-versed in the Right to Education (RTE) Act 2009 and National Curriculum Framework (NCF) 2005, as multiple direct questions are asked from these acts every year."
    },
    blog3: {
      id: "blog3",
      title: "Common Eligibility Test (CET) Prep Strategy",
      author: "R. Sharma (General Mental Ability HOD)",
      date: "June 20, 2026",
      image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=400",
      content: "The Rajasthan CET has become a mandatory qualifying gateway for multiple state services like Junior Accountant, LDC, Patwar, and Police Constable. The syllabus is massive, covering India and Rajasthan history, polity, geography, along with General English, Hindi, Computers, and Mental Ability.\n\nThe best strategy is to first master the core scoring subjects: Mental Ability, Computers, and Hindi/English. These sections have defined syllabi and high accuracy rates. Devote 2 hours daily to Rajasthan GK, focusing on economic surveys and current affairs. Regular practice of mock papers will help you easily clear the qualifying cutoff."
    },
    blog4: {
      id: "blog4",
      title: "Important Milestones in Rajasthan's Integration",
      author: "A. Dwivedi (History Senior Faculty)",
      date: "June 15, 2026",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400",
      content: "The integration of Rajasthan took place in seven distinct stages from 18 March 1948 to 1 November 1956. This is a highly critical topic for RAS, REET, Patwar, and Constable exams.\n\nYou must memorize the dates of each stage, the princely states merged, the names of prime ministers/chief ministers appointed, and the Rajpramukhs. For example, the Matsya Union was the first stage formed on 18 March 1948, comprising Alwar, Bharatpur, Dholpur, and Karauli. The final state of modern Rajasthan was established on 1 November 1956 under the recommendation of the State Reorganization Commission headed by Fazal Ali. Use timelines and maps to memorize this sequence easily."
    }
  };

  // 8. Register Page
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [authError, setAuthError] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, phone: regPhone, password: regPass })
      });
      const data = await res.json();
      if (res.ok) {
        handleLogin(data.token, data.user);
      } else {
        setAuthError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('Connection error.');
    }
  };

  const renderRegister = () => {
    return (
      <div className="container" style={{ padding: '80px 28px', maxWidth: '480px', animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>NEW STUDENT</span>
          <h2 style={{ fontSize: '32px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginTop: '8px', fontWeight: '800' }}>Create Student Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginTop: '8px' }}>Register to view free chapters immediately.</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="glass" style={{
          backgroundColor: '#ffffff',
          padding: '36px',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)'
        }}>
          {authError && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', fontWeight: '500' }}>
              {authError}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Student Name</label>
            <input type="text" className="form-input" placeholder="Rahul Sharma" required value={regName} onChange={e => setRegName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="name@example.com" required value={regEmail} onChange={e => setRegEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" placeholder="+91 98765 43210" required value={regPhone} onChange={e => setRegPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Choose Password</label>
            <input type="password" className="form-input" placeholder="••••••••" required value={regPass} onChange={e => setRegPass(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '15px' }}>Sign Up & Log In</button>
          
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Already have an account? <a href="#/login" onClick={(e) => { e.preventDefault(); navigateTo('#/login'); }} style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Login here</a>
          </div>
        </form>
      </div>
    );
  };

  // 9. Login Page
  const [logEmail, setLogEmail] = useState('');
  const [logPass, setLogPass] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: logEmail, password: logPass })
      });
      const data = await res.json();
      if (res.ok) {
        handleLogin(data.token, data.user);
      } else {
        setAuthError(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('Connection error.');
    }
  };

  const renderLogin = () => {
    return (
      <div className="container" style={{ padding: '80px 28px', maxWidth: '480px', animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>WELCOME BACK</span>
          <h2 style={{ fontSize: '32px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', marginTop: '8px', fontWeight: '800' }}>Student Login Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginTop: '8px' }}>Log in to access your video playlist and quizzes.</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="glass" style={{
          backgroundColor: '#ffffff',
          padding: '36px',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)'
        }}>
          {authError && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', fontWeight: '500' }}>
              {authError}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="name@example.com" required value={logEmail} onChange={e => setLogEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••" required value={logPass} onChange={e => setLogPass(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '15px' }}>Sign In</button>
          
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13.5px', color: 'var(--text-muted)' }}>
            New student? <a href="#/register" onClick={(e) => { e.preventDefault(); navigateTo('#/register'); }} style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Create account</a>
          </div>
          <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '11.5px', color: 'var(--text-muted)', backgroundColor: 'hsl(210, 40%, 97%)', padding: '10px', borderRadius: '8px' }}>
            Demo: student (rahul@gmail.com / student123)<br />
            Demo: admin (admin@avasthiclasses.com / admin123)
          </div>
        </form>
      </div>
    );
  };


  /* ========================================================
     STUDENT LMS DASHBOARD CONTROLLERS
     ======================================================== */
  const renderDashboardLayout = (contentNode, activeTab) => {
    if (!user) {
      navigateTo('#/login');
      return null;
    }

    const isFree = user.role === 'subscriber';
    const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    const SidebarBtn = ({ tab, icon, label, onClick }) => (
      <button onClick={onClick} className="btn" style={{
        justifyContent: 'flex-start', padding: '11px 14px', fontSize: '14px', borderRadius: '10px', boxShadow: 'none',
        backgroundColor: activeTab === tab ? 'rgba(26,35,126,0.07)' : 'transparent',
        color: activeTab === tab ? 'var(--primary)' : 'var(--text-main)',
        fontWeight: activeTab === tab ? '700' : '500',
        borderLeft: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
        transition: 'all 0.2s ease'
      }}>
        {icon}
        <span>{label}</span>
      </button>
    );

    return (
      <div className="container" style={{ padding: '40px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '36px', alignItems: 'start' }}>
          
          {/* Left Sidebar */}
          <div className="glass" style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '28px 20px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: '90px'
          }}>
            <div style={{
              padding: '16px 12px',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: '800', fontSize: '18px', fontFamily: 'var(--font-title)'
              }}>{initials}</div>
              <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '15.5px', fontWeight: '750' }}>{user.name}</h4>
              <span style={{ 
                fontSize: '10.5px', 
                color: isFree ? 'var(--text-muted)' : '#fff', 
                fontWeight: '800', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                backgroundColor: isFree ? 'hsl(210, 20%, 92%)' : 'var(--secondary)',
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                {isFree ? 'Free Account' : '★ Premium Student'}
              </span>
            </div>

            <SidebarBtn tab="overview" icon={<GraduationCap size={16} />} label="My Enrolled Courses" onClick={() => navigateTo('#/dashboard')} />
            <SidebarBtn tab="quizzes" icon={<Award size={16} />} label="Tests & Results" onClick={() => navigateTo('#/dashboard/quizzes')} />
            <SidebarBtn tab="profile" icon={<User size={16} />} label="My Profile" onClick={() => navigateTo('#/dashboard/profile')} />
            <SidebarBtn tab="payments" icon={<DollarSign size={16} />} label="Payment Invoices" onClick={() => navigateTo('#/dashboard/payments')} />

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '8px' }}>
              <button onClick={handleLogout} className="btn" style={{
                justifyContent: 'flex-start', padding: '11px 14px', fontSize: '14px', borderRadius: '10px', boxShadow: 'none',
                backgroundColor: 'transparent', color: '#dc2626', fontWeight: '500', width: '100%'
              }}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Free User Upgrade Banner */}
            {isFree && (
              <div className="glass" style={{
                background: 'linear-gradient(90deg, #fff7ed 0%, #ffedd5 100%)',
                border: '1px solid #fed7aa',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px'
              }}>
                <div>
                  <h4 style={{ color: 'var(--secondary-dark)', fontFamily: 'var(--font-title)', fontSize: '17px', fontWeight: '750' }}>Unlock All Subjects & Doubt Sessions</h4>
                  <p style={{ color: '#c2410c', fontSize: '13.5px', marginTop: '6px', lineHeight: '1.5' }}>
                    You are currently using the Free Demo package. Get full chapters, PDF notes & live Zoom webinars.
                  </p>
                </div>
                <button onClick={() => navigateTo('#/pricing')} className="btn btn-secondary" style={{ padding: '10px 24px', fontSize: '13px', borderRadius: '10px', flexShrink: 0 }}>
                  Upgrade Now
                </button>
              </div>
            )}

            {contentNode}
          </div>

        </div>
      </div>
    );
  };

  // Student Courses Catalog overview
  const renderDashboardOverview = () => {
    return renderDashboardLayout(
      <div>
        <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '20px', marginBottom: '16px' }}>Enrolled Courses</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {courses.map(course => {
            const completion = calculateCourseProgress(course.id, course);
            return (
              <div key={course.id} className="glass" style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                <div style={{ padding: '16px' }}>
                  <h4 style={{ fontSize: '15px', color: 'var(--primary-dark)' }}>{course.title}</h4>
                  
                  {/* Progress percentage bar */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>Syllabus Completed</span>
                      <strong>{completion}%</strong>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${completion}%` }}></div>
                    </div>
                  </div>

                  <button onClick={() => navigateTo(`#/dashboard/player/${course.id}`)} className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '10px', fontSize: '13px', borderRadius: '6px' }}>
                    <span>Launch Learning Player</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>,
      'overview'
    );
  };

  // Student profile settings
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName, phone: profilePhone, password: profilePassword })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setProfilePassword('');
        setProfileMsg('Profile settings updated successfully!');
      } else {
        setProfileMsg('Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      setProfileMsg('Failed to update details.');
    }
  };

  const renderDashboardProfile = () => {
    return renderDashboardLayout(
      <div>
        <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '20px', marginBottom: '16px' }}>My Account Settings</h3>
        
        <form onSubmit={handleProfileSubmit} className="glass" style={{
          backgroundColor: '#ffffff',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          maxWidth: '500px'
        }}>
          {profileMsg && (
            <div style={{ backgroundColor: profileMsg.startsWith('Error') ? '#fef2f2' : '#f0fdf4', color: profileMsg.startsWith('Error') ? '#dc2626' : '#16a34a', border: `1px solid ${profileMsg.startsWith('Error') ? '#fee2e2' : '#bbf7d0'}`, padding: '10px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
              {profileMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={profileName} onChange={e => setProfileName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address (Cannot change)</label>
            <input type="email" className="form-input" value={user.email} disabled style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Update Password (Leave blank to keep current)</label>
            <input type="password" className="form-input" placeholder="New Password" value={profilePassword} onChange={e => setProfilePassword(e.target.value)} />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '13px', borderRadius: '6px' }}>Save Changes</button>
        </form>
      </div>,
      'profile'
    );
  };

  // Student invoices
  const [invoices, setInvoices] = useState([]);
  useEffect(() => {
    if (token && currentPath === '#/dashboard/payments') {
      fetchInvoices();
    }
  }, [token, currentPath]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/payments/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderDashboardPayments = () => {
    return renderDashboardLayout(
      <div>
        <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '20px', marginBottom: '16px' }}>Payment History</h3>
        
        {invoices.length === 0 ? (
          <div className="glass" style={{ padding: '30px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', textAlignment: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No invoices found. Try enrolling into a paid package.</p>
          </div>
        ) : (
          <div className="glass" style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlignment: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px' }}>Transaction ID</th>
                  <th style={{ padding: '16px' }}>Course Title</th>
                  <th style={{ padding: '16px' }}>Amount</th>
                  <th style={{ padding: '16px' }}>Date</th>
                  <th style={{ padding: '16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: 'bold' }}>{invoice.payment_id}</td>
                    <td style={{ padding: '16px' }}>{invoice.course_title}</td>
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>₹{invoice.amount}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{new Date(invoice.date).toLocaleDateString()}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>CAPTURED</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>,
      'payments'
    );
  };

  // Student Quiz attempts list
  const [attempts, setAttempts] = useState([]);
  useEffect(() => {
    if (token && currentPath === '#/dashboard/quizzes') {
      fetchAttempts();
    }
  }, [token, currentPath]);

  const fetchAttempts = async () => {
    try {
      const res = await fetch('/api/courses/quiz-attempts/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttempts(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderDashboardQuizzes = () => {
    return renderDashboardLayout(
      <div>
        <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '20px', marginBottom: '16px' }}>Quiz Grade Sheets</h3>
        
        {attempts.length === 0 ? (
          <div className="glass" style={{ padding: '30px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', textAlignment: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No quiz attempts logged. Start viewing course chapters to trigger quizzes.</p>
          </div>
        ) : (
          <div className="glass" style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlignment: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px' }}>Quiz Title</th>
                  <th style={{ padding: '16px' }}>Course</th>
                  <th style={{ padding: '16px' }}>Score</th>
                  <th style={{ padding: '16px' }}>Percentage</th>
                  <th style={{ padding: '16px' }}>Attempted At</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map(att => {
                  const percentage = Math.round((att.score / att.totalQuestions) * 100);
                  const isPass = percentage >= 50;
                  return (
                    <tr key={att.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>{att.quiz_title}</td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{att.course_title}</td>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>{att.score} / {att.totalQuestions}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          backgroundColor: isPass ? '#dcfce7' : '#fee2e2',
                          color: isPass ? '#166534' : '#991b1b',
                          padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'
                        }}>{percentage}% {isPass ? 'Pass' : 'Failed'}</span>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{new Date(att.attemptedAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>,
      'quizzes'
    );
  };


  /* ========================================================
     LMS VIDEO PLAYER WITH CURRICULUM ACCORDION
     ======================================================== */
  const [playerCourse, setPlayerCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [doubtSessions, setDoubtSessions] = useState([]);
  const [activePlayerAccordion, setActivePlayerAccordion] = useState(0);

  // Video progress state variables
  const videoRef = useRef(null);
  const lastProgressLogged = useRef(0);
  const watchTimer = useRef(null);

  // Parse course details from dashboard path
  useEffect(() => {
    if (currentPath.startsWith('#/dashboard/player/')) {
      const match = currentPath.split('#/dashboard/player/');
      if (match[1]) {
        loadPlayerCourse(match[1]);
        loadDoubtSessions();
      }
    } else {
      // Clear timers if navigating away
      if (watchTimer.current) {
        clearInterval(watchTimer.current);
      }
    }
    
    return () => {
      if (watchTimer.current) {
        clearInterval(watchTimer.current);
      }
    };
  }, [currentPath, userProgress]);

  const loadPlayerCourse = async (id) => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlayerCourse(data);
        
        // Auto select first video lesson if none selected
        if (!selectedLesson) {
          let firstLes = null;
          data.chapters.forEach(ch => {
            if (!firstLes && ch.lessons.length > 0) {
              const videoLes = ch.lessons.find(l => l.type === 'video');
              if (videoLes) firstLes = videoLes;
            }
          });
          if (firstLes) {
            setSelectedLesson(firstLes);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadDoubtSessions = async () => {
    try {
      const res = await fetch('/api/courses/doubt/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDoubtSessions(data.sessions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Video progress triggers: updates watch time every 5 seconds to mock watched minutes
  // We use a simulated timer interval. In a real YouTube embed we can track postMessage, 
  // but for local sandbox demo robustness, when a video page is loaded, we auto-increment 
  // watchedPercentage in state and sync with backend to demonstrate 90% auto-complete and dashboard updates!
  useEffect(() => {
    if (selectedLesson && selectedLesson.type === 'video' && playerCourse) {
      // Clear existing simulator
      if (watchTimer.current) clearInterval(watchTimer.current);
      
      const courseId = playerCourse.id;
      const lessonId = selectedLesson.id;

      // Read current progress
      const courseProg = userProgress[courseId] || {};
      const lessonProg = courseProg[lessonId] || { watchedPercentage: 0 };
      let currentPercent = lessonProg.watchedPercentage;

      // Start simulator interval
      watchTimer.current = setInterval(async () => {
        if (currentPercent < 100) {
          currentPercent = Math.min(100, currentPercent + 10); // increment by 10%
          
          try {
            const res = await fetch(`/api/courses/${courseId}/progress`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ lessonId, watchedPercentage: currentPercent })
            });
            if (res.ok) {
              // Silently refresh progress state map in parent
              fetchUserProgress();
            }
          } catch (e) {
            console.error('Failed to log video watch progress', e);
          }
        }
      }, 4000); // ticks every 4 seconds for immediate visualization
    }

    return () => {
      if (watchTimer.current) clearInterval(watchTimer.current);
    };
  }, [selectedLesson, playerCourse]);

  const selectPlayerLesson = (lesson, chapter) => {
    if (lesson.isLocked) {
      setUpgradeMessage(`This is premium content. Subscribe now to unlock all chapters.`);
      setPaymentCourse(playerCourse);
      return;
    }
    
    setSelectedLesson(lesson);
    setActiveQuizId(null);
    setActivePdfUrl(null);
    setUpgradeMessage('');
  };

  const renderLmsPlayer = () => {
    if (!playerCourse) return <div className="container" style={{ padding: '80px', textAlignment: 'center' }}>Loading player workspace...</div>;

    const isFree = user && user.role === 'subscriber';

    return (
      <div className="player-layout">
        
        {/* Left column - player pane */}
        <div style={{ backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
          
          {/* Main Media display frame */}
          <div className="video-section">
            
            {/* If lesson is a video */}
            {selectedLesson && selectedLesson.type === 'video' && (
              <div className="video-container">
                <iframe
                  className="video-iframe"
                  src={selectedLesson.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                  title={selectedLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                
                {/* Watch simulation ticker layout */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#ffffff',
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  zIndex: 2,
                  pointerEvents: 'none'
                }}>
                  Progress: {userProgress[playerCourse.id]?.[selectedLesson.id]?.watchedPercentage || 0}% 
                  {userProgress[playerCourse.id]?.[selectedLesson.id]?.completed ? ' (Completed ✓)' : ' (Auto-marking as Complete at 90%)'}
                </div>
              </div>
            )}

            {/* If lesson is a PDF notes file */}
            {selectedLesson && selectedLesson.type === 'pdf' && (
              <div style={{
                height: '450px',
                backgroundColor: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                padding: '30px',
                textAlign: 'center'
              }}>
                <FileText size={64} color="var(--secondary)" style={{ marginBottom: '16px' }} />
                <h4 style={{ color: '#ffffff', fontFamily: 'var(--font-title)' }}>{selectedLesson.title}</h4>
                <p style={{ color: 'var(--text-muted-dark)', fontSize: '13px', marginTop: '8px', maxWidth: '380px' }}>
                  Handwritten PDF study notes and DPP assignments configured for local offline reading.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <a href={selectedLesson.pdfUrl} download className="btn btn-secondary" style={{ padding: '8px 24px', fontSize: '13px' }}>
                    Download PDF File
                  </a>
                  <button onClick={() => {
                    // Instantly trigger progress update for PDF viewing
                    fetch(`/api/courses/${playerCourse.id}/progress`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ lessonId: selectedLesson.id, watchedPercentage: 100 })
                    }).then(() => fetchUserProgress());
                  }} className="btn btn-outline-white" style={{ padding: '8px 20px', fontSize: '13px' }}>
                    Mark Notes as Read
                  </button>
                </div>
              </div>
            )}

            {/* If lesson is a quiz */}
            {selectedLesson && selectedLesson.type === 'quiz' && (
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', minHeight: '450px' }}>
                <QuizPlayer quizId={selectedLesson.quizId} onQuizCompleted={() => {
                  // Mark quiz lesson as 100% complete
                  fetch(`/api/courses/${playerCourse.id}/progress`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ lessonId: selectedLesson.id, watchedPercentage: 100 })
                  }).then(() => fetchUserProgress());
                }} />
              </div>
            )}

            {/* No selection default fallback */}
            {!selectedLesson && (
              <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                Select a lesson from curriculum drawer to begin.
              </div>
            )}
          </div>

          {/* Details & Live Doubt Session panels */}
          <div className="player-details">
            <h3 style={{ fontSize: '20px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)' }}>
              {selectedLesson ? selectedLesson.title : playerCourse.title}
            </h3>
            
            {/* Live sessions links */}
            {doubtSessions.length > 0 && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: 'rgba(26, 35, 126, 0.03)',
                borderRadius: '8px',
                border: '1px solid #bfdbfe'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Calendar size={18} color="var(--primary)" />
                  <strong style={{ color: 'var(--primary-dark)', fontSize: '14px' }}>Live Doubt Clearing Sessions (Unlocked)</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {doubtSessions.map(session => (
                    <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>{session.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>{session.date} • {session.time}</div>
                      </div>
                      <a href={session.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '4px', display: 'flex', gap: '4px' }}>
                        <span>Join Meet</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Locked Webinar panel for Free users */}
            {isFree && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#fff7ed',
                borderRadius: '8px',
                border: '1px solid #fed7aa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--secondary-dark)', fontSize: '14px' }}>Zoom Live Doubt sessions (Locked)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Weekly interactive webinar calls. Unlocks for Gold & premium students.</div>
                </div>
                <button onClick={() => setPaymentCourse(playerCourse)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '4px' }}>
                  Unlock Plan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Syllabus sidebar */}
        <div className="syllabus-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '15px' }}>Course Syllabus</h4>
            <button onClick={() => navigateTo('#/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>← Dashboard</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {playerCourse.chapters.map((chapter, index) => {
              const isOpen = activePlayerAccordion === index;
              return (
                <div key={chapter.id} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden'
                }}>
                  {/* Trigger head */}
                  <button onClick={() => setActivePlayerAccordion(isOpen ? -1 : index)} style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    color: 'var(--primary-dark)',
                    backgroundColor: isOpen ? 'rgba(26, 35, 126, 0.02)' : '#ffffff'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {chapter.isLocked ? <Lock size={14} color="var(--text-muted)" /> : <CheckCircle size={14} color="#16a34a" />}
                      <span>{chapter.title.split(':')[0]}</span>
                    </div>
                    <span>{isOpen ? '▲' : '▼'}</span>
                  </button>

                  {/* Lessons list */}
                  {isOpen && (
                    <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-color)', backgroundColor: '#fafbfc' }}>
                      {chapter.lessons.map(les => {
                        const isSelected = selectedLesson && selectedLesson.id === les.id;
                        const progress = userProgress[playerCourse.id]?.[les.id];
                        const isCompleted = progress ? progress.completed : false;

                        return (
                          <button
                            key={les.id}
                            onClick={() => selectPlayerLesson(les, chapter)}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: isSelected ? '1px solid var(--primary-light)' : '1px solid transparent',
                              backgroundColor: isSelected ? 'rgba(63, 81, 181, 0.05)' : 'transparent',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '4px',
                              fontSize: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)', fontWeight: isSelected ? 'bold' : 'normal' }}>
                              {les.type === 'video' ? <Video size={14} /> : les.type === 'pdf' ? <FileText size={14} /> : <HelpCircle size={14} />}
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                {les.title}
                              </span>
                            </div>
                            
                            {les.isLocked ? (
                              <Lock size={12} color="var(--text-muted)" />
                            ) : isCompleted ? (
                              <CheckCircle size={12} color="#16a34a" />
                            ) : (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{progress ? `${progress.watchedPercentage}%` : '0%'}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

      </div>
    );
  };


  /* ========================================================
     ADMIN PANEL BACKEND CRM & SYLLABUS BUILDER
     ======================================================== */
  const [adminStats, setAdminStats] = useState({});
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminPayments, setAdminPayments] = useState([]);
  const [adminSessions, setAdminSessions] = useState([]);
  const [adminQuizzes, setAdminQuizzes] = useState([]);
  
  // Filtering variables
  const [userFilter, setUserFilter] = useState(''); // '' | 'subscriber' | 'premium_student'
  
  // CRUD editing modals triggers
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseFormTitle, setCourseFormTitle] = useState('');
  const [courseFormDesc, setCourseFormDesc] = useState('');
  const [courseFormPrice, setCourseFormPrice] = useState(1999);
  
  // Doubt Session forms
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionUrl, setSessionUrl] = useState('');
  const [sessionDate, setSessionDate] = useState('Every Wednesday');
  const [sessionTime, setSessionTime] = useState('5:00 PM IST');

  // Trigger admin endpoints load
  const loadAdminWorkspace = async () => {
    if (!token || user?.role !== 'admin') return;
    try {
      const authHeader = { 'Authorization': `Bearer ${token}` };
      
      // Stats
      const statsRes = await fetch('/api/admin/stats', { headers: authHeader });
      if (statsRes.ok) setAdminStats(await statsRes.json());

      // Payments
      const payRes = await fetch('/api/admin/payments', { headers: authHeader });
      if (payRes.ok) setAdminPayments(await payRes.json());

      // Users
      const usersUrl = userFilter ? `/api/admin/users?role=${userFilter}` : '/api/admin/users';
      const usersRes = await fetch(usersUrl, { headers: authHeader });
      if (usersRes.ok) setAdminUsers(await usersRes.json());

      // Doubt sessions
      const sessRes = await fetch('/api/admin/doubt-sessions', { headers: authHeader });
      if (sessRes.ok) setAdminSessions(await sessRes.json());

      // Quizzes
      const quizRes = await fetch('/api/admin/quizzes', { headers: authHeader });
      if (quizRes.ok) setAdminQuizzes(await quizRes.json());

    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentPath.startsWith('#/admin') && user?.role === 'admin') {
      loadAdminWorkspace();
    }
  }, [currentPath, userFilter]);

  // Admin CRUD helper - create course
  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: courseFormTitle,
          description: courseFormDesc,
          price: Number(courseFormPrice)
        })
      });
      if (res.ok) {
        alert('New course created successfully! Fetching catalog...');
        setShowCourseForm(false);
        setCourseFormTitle('');
        setCourseFormDesc('');
        fetchCourses(); // refresh public courses list
        loadAdminWorkspace(); // refresh admin view
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin CRUD helper - delete course
  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course packages? This action is irreversible.')) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Course package deleted.');
        fetchCourses();
        loadAdminWorkspace();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin CRUD helper - create live doubt session Zoom links
  const handleCreateSessionSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/doubt-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: sessionTitle,
          url: sessionUrl,
          date: sessionDate,
          time: sessionTime
        })
      });
      if (res.ok) {
        alert('Zoom webinar link added successfully!');
        setShowSessionForm(false);
        setSessionTitle('');
        setSessionUrl('');
        loadAdminWorkspace();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin CRUD helper - delete doubt session
  const handleDeleteSession = async (sessId) => {
    try {
      const res = await fetch(`/api/admin/doubt-sessions/${sessId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadAdminWorkspace();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderAdminLayout = (contentNode, activeTab) => {
    if (!user || user.role !== 'admin') {
      navigateTo('#/login');
      return null;
    }

    const AdminSidebarBtn = ({ tab, icon, label, onClick }) => (
      <button onClick={onClick} className="btn" style={{
        justifyContent: 'flex-start', padding: '11px 14px', fontSize: '14px', borderRadius: '10px', boxShadow: 'none',
        backgroundColor: activeTab === tab ? 'rgba(26,35,126,0.07)' : 'transparent',
        color: activeTab === tab ? 'var(--primary)' : 'var(--text-main)',
        fontWeight: activeTab === tab ? '700' : '500',
        borderLeft: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
        transition: 'all 0.2s ease'
      }}>
        {icon}
        <span>{label}</span>
      </button>
    );

    return (
      <div className="container" style={{ padding: '40px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '36px', alignItems: 'start' }}>
          
          {/* Sidebar */}
          <div className="glass" style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '28px 20px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: '90px'
          }}>
            <div style={{
              padding: '16px 12px',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--secondary) 0%, hsl(15, 90%, 48%) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', boxShadow: 'var(--shadow-sm)'
              }}>
                <Shield size={24} />
              </div>
              <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '15.5px', fontWeight: '750' }}>Admin Workspace</h4>
              <span style={{ 
                fontSize: '10.5px', 
                color: 'var(--primary)', 
                fontWeight: '800', 
                textTransform: 'uppercase', 
                letterSpacing: '1px',
                backgroundColor: 'rgba(26,35,126,0.06)',
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                Avasthi Coaching CRM
              </span>
            </div>

            <AdminSidebarBtn tab="stats" icon={<Layers size={16} />} label="General Stats" onClick={() => navigateTo('#/admin')} />
            <AdminSidebarBtn tab="courses" icon={<BookOpen size={16} />} label="Syllabus Builder" onClick={() => navigateTo('#/admin/courses')} />
            <AdminSidebarBtn tab="users" icon={<Users size={16} />} label="Registered Students" onClick={() => navigateTo('#/admin/users')} />
            <AdminSidebarBtn tab="payments" icon={<DollarSign size={16} />} label="Transaction Invoices" onClick={() => navigateTo('#/admin/payments')} />
            <AdminSidebarBtn tab="sessions" icon={<Calendar size={16} />} label="Zoom Q&A Links" onClick={() => navigateTo('#/admin/sessions')} />

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '8px' }}>
              <button onClick={handleLogout} className="btn" style={{
                justifyContent: 'flex-start', padding: '11px 14px', fontSize: '14px', borderRadius: '10px', boxShadow: 'none',
                backgroundColor: 'transparent', color: '#dc2626', fontWeight: '500', width: '100%'
              }}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {contentNode}
          </div>

        </div>
      </div>
    );
  };

  // Admin Dashboard stats view
  const renderAdminStats = () => {
    return renderAdminLayout(
      <div>
        <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '22px', fontWeight: '750', marginBottom: '20px' }}>Dashboard Overview</h3>
        
        {/* Metric Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          
          <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Total Students</span>
              <div style={{ color: 'var(--primary-light)' }}><Users size={20} /></div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary-dark)', marginTop: '10px', fontFamily: 'var(--font-title)' }}>
              {adminStats.totalUsers || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '500' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>{adminStats.paidStudents || 0}</span> Paid • {adminStats.freeStudents || 0} Demo Free
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Total Revenue</span>
              <div style={{ color: 'var(--secondary)' }}><DollarSign size={20} /></div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--secondary)', marginTop: '10px', fontFamily: 'var(--font-title)' }}>
              ₹{adminStats.totalRevenue || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '500' }}>
              From sandbox Razorpay checkouts
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Active Courses</span>
              <div style={{ color: 'var(--primary-light)' }}><BookOpen size={20} /></div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary-dark)', marginTop: '10px', fontFamily: 'var(--font-title)' }}>
              {adminStats.totalCourses || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '500' }}>
              Exam Preparation Packages
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Quiz Submissions</span>
              <div style={{ color: 'var(--primary-light)' }}><FileCheck size={20} /></div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary-dark)', marginTop: '10px', fontFamily: 'var(--font-title)' }}>
              {adminStats.quizAttempts || 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '500' }}>
              MCQ grading responses logged
            </div>
          </div>

        </div>

        {/* Mini Table Payments */}
        <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '17px', fontWeight: '750', marginBottom: '16px' }}>Recent Sandbox Payments</h4>
        <div className="glass" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlignment: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Student Email</th>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Course Title</th>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Amount</th>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Payment ID</th>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {adminPayments.slice(0, 5).map(pay => (
                <tr key={pay.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>{pay.userName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{pay.userEmail}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: 'var(--text-main)' }}>{pay.course_title}</td>
                  <td style={{ padding: '14px 20px', fontWeight: '750', color: 'var(--secondary)' }}>₹{pay.amount}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: 'var(--text-main)', fontSize: '12.5px' }}>{pay.payment_id}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{new Date(pay.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>,
      'stats'
    );
  };

  // Admin Courses management Builder
  const renderAdminCourses = () => {
    return renderAdminLayout(
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '20px', fontWeight: '750' }}>Manage Course Packages</h3>
          <button onClick={() => setShowCourseForm(true)} className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '13.5px', borderRadius: '10px', display: 'flex', gap: '6px' }}>
            <Plus size={16} />
            <span>Create Course</span>
          </button>
        </div>

        {showCourseForm && (
          <form onSubmit={handleCreateCourseSubmit} className="glass animate-fade-in" style={{
            backgroundColor: '#ffffff',
            padding: '28px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', marginBottom: '20px', fontWeight: '750' }}>Create New Competitive Course Package</h4>
            <div className="form-group">
              <label className="form-label">Course Title</label>
              <input type="text" className="form-input" placeholder="RAS General Studies - Full Year" required value={courseFormTitle} onChange={e => setCourseFormTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Short Description</label>
              <textarea className="form-input" rows="3" placeholder="Syllabus overview and curriculum breakdown..." required value={courseFormDesc} onChange={e => setCourseFormDesc(e.target.value)}></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Fee Amount (₹)</label>
              <input type="number" className="form-input" placeholder="1999" required value={courseFormPrice} onChange={e => setCourseFormPrice(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={() => setShowCourseForm(false)} className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '13.5px', borderRadius: '10px' }}>Cancel</button>
              <button type="submit" className="btn btn-secondary" style={{ padding: '10px 24px', fontSize: '13.5px', borderRadius: '10px' }}>Save Course Package</button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {courses.map(course => (
            <div key={course.id} className="glass" style={{
              backgroundColor: '#ffffff',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <h4 style={{ fontSize: '16.5px', color: 'var(--primary-dark)', fontWeight: '700' }}>{course.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '6px', lineHeight: '1.5' }}>{course.description.substr(0,140)}...</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--secondary)', backgroundColor: 'var(--secondary-bg)', padding: '3px 10px', borderRadius: '20px' }}>
                    Fee: ₹{course.price}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '850', color: 'var(--primary)', backgroundColor: 'rgba(26,35,126,0.06)', padding: '3px 10px', borderRadius: '20px' }}>
                    {course.chapterCount || 0} Chapters configured
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => navigateTo(`#/course/${course.id}`)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '12.5px', borderRadius: '8px' }}>
                  Syllabus details
                </button>
                <button onClick={() => handleDeleteCourse(course.id)} className="btn" style={{
                  padding: '10px', borderRadius: '10px', border: '1px solid #fee2e2', backgroundColor: '#fef2f2', color: '#ef4444', boxShadow: 'none', display: 'flex', alignItems: 'center'
                }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>,
      'courses'
    );
  };

  // Admin student user listings
  const renderAdminUsers = () => {
    return renderAdminLayout(
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '20px', fontWeight: '750' }}>Registered Students CRM</h3>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setUserFilter('')} className="btn" style={{
              padding: '8px 14px', fontSize: '12.5px', borderRadius: '8px', boxShadow: 'none',
              backgroundColor: userFilter === '' ? 'var(--primary)' : '#ffffff',
              color: userFilter === '' ? '#ffffff' : 'var(--text-main)',
              border: '1px solid var(--border-color)',
              fontWeight: '600'
            }}>All ({adminStats.totalUsers || 0})</button>
            <button onClick={() => setUserFilter('premium_student')} className="btn" style={{
              padding: '8px 14px', fontSize: '12.5px', borderRadius: '8px', boxShadow: 'none',
              backgroundColor: userFilter === 'premium_student' ? 'var(--primary)' : '#ffffff',
              color: userFilter === 'premium_student' ? '#ffffff' : 'var(--text-main)',
              border: '1px solid var(--border-color)',
              fontWeight: '600'
            }}>Premium ({adminStats.paidStudents || 0})</button>
            <button onClick={() => setUserFilter('subscriber')} className="btn" style={{
              padding: '8px 14px', fontSize: '12.5px', borderRadius: '8px', boxShadow: 'none',
              backgroundColor: userFilter === 'subscriber' ? 'var(--primary)' : '#ffffff',
              color: userFilter === 'subscriber' ? '#ffffff' : 'var(--text-main)',
              border: '1px solid var(--border-color)',
              fontWeight: '600'
            }}>Free Demo ({adminStats.freeStudents || 0})</button>
          </div>
        </div>

        <div className="glass" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlignment: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Student Details</th>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Contact Phone</th>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Role status</th>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>{student.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{student.email}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: 'var(--text-main)' }}>{student.phone || 'N/A'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      backgroundColor: student.role === 'premium_student' ? '#ffe8cc' : student.role === 'admin' ? '#e2e8f0' : '#e2f0fd',
                      color: student.role === 'premium_student' ? '#d9480f' : student.role === 'admin' ? '#475569' : '#0284c7',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>{student.role === 'premium_student' ? 'Premium Student' : student.role === 'admin' ? 'Admin Staff' : 'Free Demo Subscriber'}</span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{new Date(student.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>,
      'users'
    );
  };

  // Admin Invoices lookup list
  const renderAdminPayments = () => {
    return renderAdminLayout(
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '20px', fontWeight: '750', marginBottom: '24px' }}>All Platform Transactions</h3>
        <div className="glass" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlignment: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Student details</th>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Course package</th>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Receipt details</th>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Amount</th>
                <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--primary-dark)' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {adminPayments.map(pay => (
                <tr key={pay.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>{pay.userName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{pay.userEmail}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: 'var(--text-main)' }}>{pay.course_title}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-main)' }}>Order: <strong style={{ fontFamily: 'monospace' }}>{pay.order_id}</strong></div>
                    <div style={{ fontSize: '12px', marginTop: '2px', color: 'var(--text-muted)' }}>Payment ID: <strong style={{ fontFamily: 'monospace' }}>{pay.payment_id}</strong></div>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '800', color: 'var(--secondary)' }}>₹{pay.amount}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{new Date(pay.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>,
      'payments'
    );
  };

  // Admin Doubt Session Zoom scheduling builder
  const renderAdminSessions = () => {
    return renderAdminLayout(
      <div style={{ animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', fontSize: '20px', fontWeight: '750' }}>Zoom / Meet Live Webinars</h3>
          <button onClick={() => setShowSessionForm(true)} className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '13.5px', borderRadius: '10px', display: 'flex', gap: '6px' }}>
            <Plus size={16} />
            <span>Create Session</span>
          </button>
        </div>

        {showSessionForm && (
          <form onSubmit={handleCreateSessionSubmit} className="glass animate-fade-in" style={{
            backgroundColor: '#ffffff',
            padding: '28px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary-dark)', marginBottom: '20px', fontWeight: '750' }}>Schedule Live Class</h4>
            <div className="form-group">
              <label className="form-label">Session Title</label>
              <input type="text" className="form-input" placeholder="Class 10 Math doubt clearance" required value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Meet / Zoom URL</label>
              <input type="url" className="form-input" placeholder="https://zoom.us/j/999888..." required value={sessionUrl} onChange={e => setSessionUrl(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Date (e.g. Every Monday)</label>
                <input type="text" className="form-input" placeholder="Every Monday" required value={sessionDate} onChange={e => setSessionDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Time (e.g. 5:00 PM IST)</label>
                <input type="text" className="form-input" placeholder="5:00 PM IST" required value={sessionTime} onChange={e => setSessionTime(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={() => setShowSessionForm(false)} className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '13.5px', borderRadius: '10px' }}>Cancel</button>
              <button type="submit" className="btn btn-secondary" style={{ padding: '10px 24px', fontSize: '13.5px', borderRadius: '10px' }}>Save Session Schedule</button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {adminSessions.map(session => (
            <div key={session.id} className="glass" style={{
              backgroundColor: '#ffffff',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <h4 style={{ fontSize: '16.5px', color: 'var(--primary-dark)', fontWeight: '700' }}>{session.title}</h4>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                  <span>📅 {session.date}</span>
                  <span>⏰ {session.time}</span>
                </div>
                <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--primary-light)' }}>
                  URL: <a href={session.url} target="_blank" rel="noreferrer" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{session.url}</a>
                </div>
              </div>
              <button onClick={() => handleDeleteSession(session.id)} className="btn" style={{
                padding: '10px', borderRadius: '10px', border: '1px solid #fee2e2', backgroundColor: '#fef2f2', color: '#ef4444', boxShadow: 'none', display: 'flex', alignItems: 'center'
              }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>,
      'sessions'
    );
  };


  /* ========================================================
     MASTER ROUTER / VIEW SWITCHER
     ======================================================== */
  const renderCurrentView = () => {
    // Public paths
    if (currentPath === '#/') return renderHome();
    if (currentPath === '#/about') return renderAbout();
    if (currentPath === '#/contact') return renderContact();
    if (currentPath === '#/courses') return renderCoursesCatalog();
    if (currentPath.startsWith('#/course/')) return renderCourseDetail();
    if (currentPath === '#/pricing') return renderPricing();
    if (currentPath === '#/blog') return renderBlog();
    if (currentPath === '#/login') return renderLogin();
    if (currentPath === '#/register') return renderRegister();

    // Student Dashboard paths
    if (currentPath === '#/dashboard') return renderDashboardOverview();
    if (currentPath === '#/dashboard/profile') return renderDashboardProfile();
    if (currentPath === '#/dashboard/payments') return renderDashboardPayments();
    if (currentPath === '#/dashboard/quizzes') return renderDashboardQuizzes();
    if (currentPath.startsWith('#/dashboard/player/')) return renderLmsPlayer();

    // Admin paths
    if (currentPath === '#/admin') return renderAdminStats();
    if (currentPath === '#/admin/courses') return renderAdminCourses();
    if (currentPath === '#/admin/users') return renderAdminUsers();
    if (currentPath === '#/admin/payments') return renderAdminPayments();
    if (currentPath === '#/admin/sessions') return renderAdminSessions();

    // Catch all fallback
    return renderHome();
  };

  return (
    <div className="app-container">
      {/* Dynamic Navigation Header */}
      <Navbar user={user} onLogout={handleLogout} currentPath={currentPath} navigateTo={navigateTo} />
      
      {/* Master Content Router */}
      <main className="main-content" style={{ minHeight: 'calc(100vh - 350px)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div className="loading-spinner"></div>
            <div style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>Connecting to Avasthi Classes network...</div>
          </div>
        ) : (
          renderCurrentView()
        )}
      </main>

      {/* Dynamic Payment Wall Razorpay Simulation Modal */}
      {paymentCourse && (
        <PaymentModal 
          course={paymentCourse} 
          onClose={() => setPaymentCourse(null)} 
          onSuccess={handlePaymentSuccess} 
        />
      )}

      {/* Public Footer */}
      <Footer navigateTo={navigateTo} />
    </div>
  );
}
