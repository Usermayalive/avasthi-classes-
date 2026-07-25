import React from 'react';
import { BookOpen, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer({ navigateTo }) {
  return (
    <footer style={{
      background: 'linear-gradient(180deg, var(--primary-dark) 0%, #080c1e 100%)',
      color: '#ffffff',
      padding: '72px 0 36px 0',
      marginTop: '80px',
      borderTop: '4px solid var(--secondary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background visual blob */}
      <div style={{
        position: 'absolute',
        bottom: '-50px',
        left: '-50px',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,111,0,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}></div>

      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 0.8fr 0.8fr 1.2fr',
        gap: '48px',
        marginBottom: '48px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* About Section */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--secondary) 0%, #ff8f00 100%)'
            }}>
              <BookOpen size={18} color="#ffffff" strokeWidth={2.5} />
            </div>
            <h3 style={{ color: '#ffffff', fontSize: '21px', fontFamily: 'var(--font-title)', letterSpacing: '-0.01em' }}>AVASTHI CLASSES</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14.5px', lineHeight: '1.7', fontWeight: '400' }}>
            Empowering aspirants to crack Rajasthan State Competitive Examinations including RAS, REET, Police SI, Patwar & CET. We provide structured lectures, custom PDF notes, and mock exams under expert guidance.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{
            color: '#ffffff',
            marginBottom: '24px',
            fontFamily: 'var(--font-title)',
            fontSize: '16px',
            fontWeight: '600',
            borderBottom: '2px solid rgba(255,255,255,0.08)',
            paddingBottom: '10px',
            letterSpacing: '0.5px'
          }}>EXPLORE</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14.5px' }}>
            <li><a href="#/" onClick={(e) => { e.preventDefault(); navigateTo('#/'); }} style={{ color: 'rgba(255,255,255,0.75)' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>Homepage</a></li>
            <li><a href="#/courses" onClick={(e) => { e.preventDefault(); navigateTo('#/courses'); }} style={{ color: 'rgba(255,255,255,0.75)' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>All Courses</a></li>
            <li><a href="#/pricing" onClick={(e) => { e.preventDefault(); navigateTo('#/pricing'); }} style={{ color: 'rgba(255,255,255,0.75)' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>Fee Plans</a></li>
            <li><a href="#/blog" onClick={(e) => { e.preventDefault(); navigateTo('#/blog'); }} style={{ color: 'rgba(255,255,255,0.75)' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>Study Tips Blog</a></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h4 style={{
            color: '#ffffff',
            marginBottom: '24px',
            fontFamily: 'var(--font-title)',
            fontSize: '16px',
            fontWeight: '600',
            borderBottom: '2px solid rgba(255,255,255,0.08)',
            paddingBottom: '10px',
            letterSpacing: '0.5px'
          }}>SUPPORT</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14.5px' }}>
            <li><a href="#/about" onClick={(e) => { e.preventDefault(); navigateTo('#/about'); }} style={{ color: 'rgba(255,255,255,0.75)' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>About Us</a></li>
            <li><a href="#/contact" onClick={(e) => { e.preventDefault(); navigateTo('#/contact'); }} style={{ color: 'rgba(255,255,255,0.75)' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>Contact Us</a></li>
            <li><a href="#/login" onClick={(e) => { e.preventDefault(); navigateTo('#/login'); }} style={{ color: 'rgba(255,255,255,0.75)' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}>Student Portal</a></li>
            <li><span style={{ color: 'rgba(255,255,255,0.4)', cursor: 'default' }}>Privacy Policy</span></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 style={{
            color: '#ffffff',
            marginBottom: '24px',
            fontFamily: 'var(--font-title)',
            fontSize: '16px',
            fontWeight: '600',
            borderBottom: '2px solid rgba(255,255,255,0.08)',
            paddingBottom: '10px',
            letterSpacing: '0.5px'
          }}>GET IN TOUCH</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <MapPin size={18} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ lineHeight: '1.4' }}>Mohan Nagar, Station Road, Hindaun City, Rajasthan - 322230</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Phone size={18} color="var(--secondary)" style={{ flexShrink: 0 }} />
              <span>+91 99999 88888</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Mail size={18} color="var(--secondary)" style={{ flexShrink: 0 }} />
              <span>support@avasthiclasses.com</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', alignItems: 'center' }}>
              {/* Facebook */}
              <span style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
              </span>
              {/* Youtube */}
              <span style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.528 3.5 12 3.5 12 3.5s-7.528 0-9.388.555A3.002 3.002 0 0 0 .502 6.163C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.472 20.5 12 20.5 12 20.5s7.528 0 9.388-.555a3.002 3.002 0 0 0 2.11-2.108C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </span>
              {/* Instagram */}
              <span style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.color = '#ffffff'} onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '24px',
        textAlign: 'center',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.4)',
        position: 'relative',
        zIndex: 1
      }}>
        <p>&copy; {new Date().getFullYear()} Avasthi Classes. All rights reserved. Built with premium education LMS standards.</p>
      </div>
    </footer>
  );
}
