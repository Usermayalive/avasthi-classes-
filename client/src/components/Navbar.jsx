import React from 'react';
import { BookOpen, LogOut, LayoutDashboard, Shield } from 'lucide-react';

export default function Navbar({ user, onLogout, currentPath, navigateTo }) {
  const isStudent = user && (user.role === 'subscriber' || user.role === 'premium_student');
  const isAdmin = user && user.role === 'admin';

  // Navigation Links configuration
  const navLinks = [
    { label: 'Home', path: '#/' },
    { label: 'Courses', path: '#/courses' },
    { label: 'Pricing', path: '#/pricing' },
    { label: 'Study Tips', path: '#/blog' },
    { label: 'About Us', path: '#/about' },
    { label: 'Contact', path: '#/contact' }
  ];

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '14px 0',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(16px) saturate(180%)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <a href="#/" onClick={(e) => { e.preventDefault(); navigateTo('#/'); }} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 800,
          fontSize: '23px',
          fontFamily: 'var(--font-title)',
          color: 'var(--primary-dark)',
          letterSpacing: '-0.02em',
          transition: 'transform 0.2s ease'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            <BookOpen size={20} color="#ffffff" strokeWidth={2.5} />
          </div>
          <span>AVASTHI <span style={{ color: 'var(--secondary)' }}>CLASSES</span></span>
        </a>

        {/* Desktop Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || 
              (link.path === '#/courses' && currentPath.startsWith('#/course/'));
            return (
              <a 
                key={link.path}
                href={link.path} 
                onClick={(e) => { e.preventDefault(); navigateTo(link.path); }} 
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14.5px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-glow)' : 'transparent',
                  transition: 'all 0.25s ease'
                }}
                onMouseOver={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--primary)';
                    e.currentTarget.style.backgroundColor = 'rgba(26, 35, 126, 0.03)';
                  }
                }}
                onMouseOut={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Session CTAs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          {user ? (
            <>
              {isStudent && (
                <button onClick={() => navigateTo('#/dashboard')} className="btn btn-outline" style={{
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderWidth: '1.5px'
                }}>
                  <LayoutDashboard size={15} />
                  <span>My LMS</span>
                </button>
              )}

              {isAdmin && (
                <button onClick={() => navigateTo('#/admin')} className="btn btn-outline" style={{
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderWidth: '1.5px'
                }}>
                  <Shield size={15} />
                  <span>Admin Panel</span>
                </button>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingLeft: '14px',
                borderLeft: '1.5px solid var(--border-color)'
              }}>
                <div style={{
                  textAlign: 'right',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  lineHeight: '1.25'
                }}>
                  <div style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>{user.name.split(' ')[0]}</div>
                  <div style={{
                    color: user.role === 'premium_student' ? 'var(--secondary)' : 'var(--text-muted)',
                    fontSize: '9.5px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginTop: '2px'
                  }}>
                    {user.role === 'premium_student' ? '★ Premium' : user.role === 'admin' ? '⚙ Admin' : 'Free Demo'}
                  </div>
                </div>
                <button 
                  onClick={onLogout} 
                  style={{
                    padding: '8px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }} 
                  onMouseOver={e => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <a 
                href="#/login" 
                onClick={(e) => { e.preventDefault(); navigateTo('#/login'); }} 
                className="btn btn-outline" 
                style={{
                  padding: '10px 22px',
                  fontSize: '14px',
                  borderRadius: '10px',
                  borderWidth: '1.5px'
                }}
              >
                Login
              </a>
              <a 
                href="#/register" 
                onClick={(e) => { e.preventDefault(); navigateTo('#/register'); }} 
                className="btn btn-secondary" 
                style={{
                  padding: '10px 22px',
                  fontSize: '14px',
                  borderRadius: '10px'
                }}
              >
                Register
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
