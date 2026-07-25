import React, { useState } from 'react';
import { CreditCard, ArrowRight, ShieldCheck, QrCode, Building, AlertCircle, HelpCircle } from 'lucide-react';

export default function PaymentModal({ course, onClose, onSuccess }) {
  const [method, setMethod] = useState('card'); // 'card' | 'upi' | 'netbank'
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bank, setBank] = useState('sbi');
  const [error, setError] = useState('');

  if (!course) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (method === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        setError('Please fill in all card details.');
        return;
      }
      if (cardNumber.length < 16) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
    } else if (method === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g. name@upi).');
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: course.id })
      });

      if (!orderRes.ok) {
        throw new Error('Failed to initiate order on server.');
      }

      const orderData = await orderRes.json();

      // Simulate payment processing time (1.5 seconds)
      setTimeout(async () => {
        const mockPaymentId = 'pay_mock_' + Math.random().toString(36).substr(2, 9);
        
        // Verify payment on Backend
        const verifyRes = await fetch('/api/payments/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            razorpay_order_id: orderData.id,
            razorpay_payment_id: mockPaymentId,
            courseId: course.id
          })
        });

        if (verifyRes.ok) {
          setLoading(false);
          onSuccess(mockPaymentId, orderData.id);
        } else {
          throw new Error('Failed to verify payment with server.');
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Payment processing failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(8, 12, 30, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass" style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '540px',
        boxShadow: '0 30px 60px -15px rgba(8, 12, 30, 0.3)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeInUp 0.3s ease-out'
      }}>
        {/* Razorpay Banner Header */}
        <div style={{
          background: 'linear-gradient(135deg, #091730 0%, #122852 100%)',
          color: '#ffffff',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>SECURE GATEWAY</div>
            <h3 style={{ color: '#ffffff', fontSize: '19px', margin: '4px 0 0 0', fontFamily: 'var(--font-title)', fontWeight: '700' }}>Avasthi Classes LMS</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', backgroundColor: 'rgba(249, 115, 22, 0.15)', padding: '5px 12px', borderRadius: '30px', color: 'var(--secondary-light)', fontWeight: '700', border: '1px solid rgba(249, 115, 22, 0.3)' }}>Razorpay Test</span>
          </div>
        </div>

        {/* Course details & price banner */}
        <div style={{ 
          padding: '20px 32px', 
          borderBottom: '1px solid var(--border-color)', 
          backgroundColor: 'hsl(210, 40%, 99%)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <div style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--primary-dark)' }}>{course.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Instant and complete syllabus unlock</div>
          </div>
          <div style={{ fontSize: '23px', fontWeight: '800', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)' }}>
            ₹{course.price}
          </div>
        </div>

        {/* Loading State Overlay */}
        {loading ? (
          <div style={{ padding: '72px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div className="loading-spinner"></div>
            <h4 style={{ marginTop: '28px', color: 'var(--primary-dark)', fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '700' }}>Verifying Checkout Order</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', textAlign: 'center', marginTop: '10px', maxWidth: '340px', lineHeight: '1.6' }}>
              Setting up secure checkout tunnels. Do not close this panel or refresh the page.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                alignItems: 'center', 
                backgroundColor: 'var(--danger-bg)', 
                color: 'var(--danger)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                padding: '14px 18px', 
                borderRadius: '10px', 
                fontSize: '14px',
                fontWeight: '550'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div>
              <div className="form-label" style={{ marginBottom: '10px' }}>Select Payment Method</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { id: 'card', icon: <CreditCard size={18} />, label: 'Card' },
                  { id: 'upi', icon: <QrCode size={18} />, label: 'UPI ID' },
                  { id: 'netbank', icon: <Building size={18} />, label: 'Netbanking' }
                ].map((item) => {
                  const isSelected = method === item.id;
                  return (
                    <button 
                      key={item.id}
                      type="button" 
                      onClick={() => setMethod(item.id)} 
                      style={{
                        padding: '14px 10px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'var(--primary-glow)' : '#ffffff',
                        color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)',
                        fontWeight: isSelected ? '700' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13.5px',
                        transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
                      }}
                      onMouseOver={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--text-muted)';
                          e.currentTarget.style.backgroundColor = 'hsl(210, 40%, 98%)';
                        }
                      }}
                      onMouseOut={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Render Method Specific Content */}
            {method === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeInUp 0.2s ease-out' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Card Number</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="4111 2222 3333 4444" 
                      className="form-input" 
                      value={cardNumber} 
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g,'').substr(0,16))}
                      style={{ paddingLeft: '44px' }}
                    />
                    <CreditCard size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      className="form-input" 
                      value={cardExpiry} 
                      onChange={e => setCardExpiry(e.target.value.substr(0,5))} 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">CVV</label>
                    <input 
                      type="password" 
                      placeholder="•••" 
                      className="form-input" 
                      value={cardCvv} 
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').substr(0,3))} 
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'upi' && (
              <div className="form-group" style={{ marginBottom: 0, animation: 'fadeInUp 0.2s ease-out' }}>
                <label className="form-label">UPI Address ID</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="username@upi" 
                    className="form-input" 
                    value={upiId} 
                    onChange={e => setUpiId(e.target.value)} 
                    style={{ paddingLeft: '44px' }}
                  />
                  <QrCode size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px', display: 'block', lineHeight: '1.4' }}>
                  Enter your Google Pay, PhonePe, Paytm, or BHIM linked UPI ID.
                </span>
              </div>
            )}

            {method === 'netbank' && (
              <div className="form-group" style={{ marginBottom: 0, animation: 'fadeInUp 0.2s ease-out' }}>
                <label className="form-label">Select Your Bank</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="form-input" 
                    value={bank} 
                    onChange={e => setBank(e.target.value)}
                    style={{ paddingLeft: '44px', appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="sbi">State Bank of India (SBI)</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="pnb">Punjab National Bank (PNB)</option>
                  </select>
                  <Building size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  {/* Select arrow indicator */}
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid var(--text-muted)' }}></div>
                </div>
              </div>
            )}

            {/* Footer with SSL badge & action CTAs */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--success)', fontSize: '13px', fontWeight: '700' }}>
                <ShieldCheck size={18} />
                <span>128-bit SSL Secured Sandbox Checkout</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1, padding: '14px', borderRadius: '10px' }}>Cancel</button>
                <button type="submit" className="btn btn-secondary" style={{ flex: 2, padding: '14px', borderRadius: '10px' }}>
                  <span>Secure Pay ₹{course.price}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
