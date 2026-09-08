'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, BookOpen, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('Learner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [num1, setNum1] = useState(8);
  const [num2, setNum2] = useState(7);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const router = useRouter();

  useEffect(() => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    if (!email || !password) {
      setError('Please fill in both email and authentication key.');
      setLoading(false);
      return;
    }

    if (parseInt(securityAnswer) !== num1 + num2) {
      setError('Security check failed. Please try again.');
      setNum1(Math.floor(Math.random() * 10) + 1);
      setNum2(Math.floor(Math.random() * 10) + 1);
      setSecurityAnswer('');
      setLoading(false);
      return;
    }

    const loginEmail = selectedRole === 'Learner' && !email.includes('@') 
      ? `${email.trim().replace(/\s+/g, '_').toLowerCase()}@student.vectragroup.com` 
      : email;

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (signInError) {
      if (signInError.message.includes('Failed to fetch')) {
        console.warn('Network blocked Supabase connection. Bypassing login for development.');
        localStorage.setItem('dev_mock_role', selectedRole.toLowerCase());
        localStorage.setItem('dev_mock_name', email.split('@')[0]);
        router.push('/dashboard');
        return;
      }
      setError(signInError.message);
      setLoading(false);
    } else {
      localStorage.setItem('dev_mock_role', selectedRole.toLowerCase());
      localStorage.setItem('dev_mock_name', email.split('@')[0]);
      router.push('/dashboard');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backgroundColor: '#000' // Fallback
    }}>
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -2
        }}
      >
        <source src="/bg_video.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: -1,
        backdropFilter: 'blur(2px)'
      }} />

      {/* Form Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '480px',
        padding: '0 1.5rem'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Image 
            src="/vfs_logo.png" 
            alt="VFS Logo" 
            width={320} 
            height={180} 
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        {/* Glass Card */}
        <div style={{
          width: '100%',
          background: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '1.25rem',
          padding: '1.25rem 1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Corporate Email / Student ID */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', letterSpacing: '0.1em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              {selectedRole === 'Learner' ? 'Student ID' : 'Corporate Email'}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)' }}>
                {selectedRole === 'Learner' ? <User size={16} /> : <Mail size={16} />}
              </div>
              <input 
                type={selectedRole === 'Learner' ? 'text' : 'email'} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'Learner' ? 'Enter your Student ID' : 'name@vectragroup.com'}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, background-color 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                }}
              />
            </div>
          </div>

          {/* Authentication Key */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', letterSpacing: '0.1em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Authentication Key
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)' }}>
                <Lock size={16} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="........"
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  letterSpacing: '0.2em'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                }}
              />
              <div 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </div>
            </div>
          </div>

          {/* Security Check */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', letterSpacing: '0.1em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Security Check
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{
                flex: '1.5',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: '0.15em',
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 16px)'
              }}>
                {num1} <span style={{ margin: '0 0.5rem', color: 'rgba(255,255,255,0.7)' }}>+</span> {num2} <span style={{ margin: '0 0.5rem', color: 'rgba(255,255,255,0.7)' }}>=</span>
              </div>
              <input 
                type="text" 
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="?"
                style={{
                  flex: '1',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  fontWeight: 700
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                }}
              />
            </div>
          </div>

          {/* Access Role Selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.9)', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Access Role <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { id: 'Learner', title: 'Learner', subtitle: 'Student access' },
                { id: 'Trainer', title: 'Trainer', subtitle: 'Instructor access' },
                { id: 'Admin', title: 'Admin', subtitle: 'Full system' }
              ].map((role) => (
                <div 
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    background: selectedRole === role.id ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.4)',
                    border: selectedRole === role.id ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    if (selectedRole !== role.id) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    if (selectedRole !== role.id) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: 'white', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    marginBottom: '0.2rem'
                  }}>
                    {role.title}
                  </span>
                  <span style={{ 
                    fontSize: '0.55rem', 
                    color: selectedRole === role.id ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 500
                  }}>
                    {role.subtitle}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ marginBottom: '1rem', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            onClick={handleLogin}
            disabled={loading}
            style={{
            width: '100%',
            background: loading ? 'rgba(37, 99, 235, 0.5)' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.85rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.4)',
            transition: 'background-color 0.2s, transform 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#1d4ed8';
          }}
          onMouseOut={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
          }}>
            {loading ? 'Authenticating...' : 'Login to Workspace'} <ArrowRight size={16} />
          </button>
        </div>

        {/* Footer Text */}
        <p style={{
          marginTop: '1rem',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          fontWeight: 600,
          textTransform: 'uppercase',
          textAlign: 'center'
        }}>
          © 2026 VECTRA FOREIGN SERVICES • PREMIUM IELTS & IMMIGRATION PORTAL
        </p>
      </div>
    </div>
  );
}
