import React, { useState } from 'react';
import { BookOpen, LogOut, LayoutDashboard, Shield, Menu, X, FileCheck, Award, Bell } from 'lucide-react';

export default function Navbar({ user, onLogout, currentPath, navigateTo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isStudent = user && (user.role === 'subscriber' || user.role === 'premium_student');
  const isAdmin = user && user.role === 'admin';

  // Navigation Links configuration
  const navLinks = [
    { label: 'Home', path: '#/' },
    { label: 'Syllabus & Batches', path: '#/courses' },
    { label: 'Take Test', path: '#/tests', badge: 'FREE' },
    { label: 'Toppers', path: '#/toppers' },
    { label: 'News & Bulletins', path: '#/updates' },
    { label: 'Contact', path: '#/contact' }
  ];

  const handleNavClick = (path) => {
    navigateTo(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 0',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(16px) saturate(180%)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.04)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <a href="#/" onClick={(e) => { e.preventDefault(); handleNavClick('#/'); }} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 800,
          fontSize: '21px',
          fontFamily: 'var(--font-title)',
          color: 'var(--primary-dark)',
          letterSpacing: '-0.02em'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            <BookOpen size={19} color="#ffffff" strokeWidth={2.5} />
          </div>
          <span>AVASTHI <span style={{ color: 'var(--secondary)' }}>CLASSES</span></span>
        </a>

        {/* Desktop Nav Links */}
        <div className="desktop-only" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || 
              (link.path === '#/courses' && currentPath.startsWith('#/course/'));
            return (
              <a 
                key={link.path}
                href={link.path} 
                onClick={(e) => { e.preventDefault(); handleNavClick(link.path); }} 
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-glow)' : 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span style={{
                    fontSize: '9px',
                    fontWeight: '800',
                    backgroundColor: 'var(--secondary)',
                    color: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: '50px',
                    letterSpacing: '0.5px'
                  }}>
                    {link.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>

        {/* Right Section CTAs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {user ? (
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isStudent && (
                <button onClick={() => handleNavClick('#/dashboard')} className="btn btn-outline" style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  borderRadius: '8px'
                }}>
                  <LayoutDashboard size={14} />
                  <span>My LMS</span>
                </button>
              )}

              {isAdmin && (
                <button onClick={() => handleNavClick('#/admin')} className="btn btn-outline" style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  borderRadius: '8px'
                }}>
                  <Shield size={14} />
                  <span>Admin Panel</span>
                </button>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingLeft: '10px',
                borderLeft: '1.5px solid var(--border-color)'
              }}>
                <div style={{ textAlign: 'right', fontSize: '12px' }}>
                  <div style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>{user.name.split(' ')[0]}</div>
                  <div style={{ color: 'var(--secondary)', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase' }}>
                    {user.role === 'admin' ? '⚙ Admin' : 'Student'}
                  </div>
                </div>
                <button 
                  onClick={onLogout} 
                  style={{
                    padding: '6px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444'
                  }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a 
                href="#/login" 
                onClick={(e) => { e.preventDefault(); handleNavClick('#/login'); }} 
                className="btn btn-outline" 
                style={{ padding: '8px 18px', fontSize: '13.5px', borderRadius: '8px' }}
              >
                Login
              </a>
              <a 
                href="#/register" 
                onClick={(e) => { e.preventDefault(); handleNavClick('#/register'); }} 
                className="btn btn-secondary" 
                style={{ padding: '8px 18px', fontSize: '13.5px', borderRadius: '8px' }}
              >
                Register
              </a>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button 
            className="mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              color: 'var(--primary-dark)'
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-only" style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border-color)',
          padding: '16px 20px 24px 20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          animation: 'fadeInDown 0.25s ease forwards'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {navLinks.map((link) => (
              <a 
                key={link.path}
                href={link.path} 
                onClick={(e) => { e.preventDefault(); handleNavClick(link.path); }} 
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: currentPath === link.path ? 'var(--primary)' : 'var(--text-dark)',
                  backgroundColor: currentPath === link.path ? 'var(--primary-glow)' : 'rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    backgroundColor: 'var(--secondary)',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '50px'
                  }}>
                    {link.badge}
                  </span>
                )}
              </a>
            ))}

            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {user ? (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Signed in as <strong>{user.name}</strong> ({user.role})
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleNavClick('#/admin')} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                      <Shield size={16} />
                      <span>Admin Control Panel</span>
                    </button>
                  )}
                  <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="btn btn-outline" style={{ width: '100%', padding: '12px', color: '#ef4444', borderColor: '#fca5a5' }}>
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button onClick={() => handleNavClick('#/login')} className="btn btn-outline" style={{ padding: '12px' }}>Login</button>
                  <button onClick={() => handleNavClick('#/register')} className="btn btn-secondary" style={{ padding: '12px' }}>Register</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
