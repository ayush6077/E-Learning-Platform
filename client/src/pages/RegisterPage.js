import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orbs"><div className="auth-orb auth-orb-1"></div><div className="auth-orb auth-orb-2"></div></div>
      <div className="auth-card card">
        <div className="auth-logo"><span className="auth-logo-icon">⚡</span><span className="brand-text">EduPulse</span></div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start your learning journey today</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="label">Full Name</label>
            <input type="text" className="input" placeholder="Your name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="label">I am a…</label>
            <div className="role-toggle">
              {['student', 'instructor'].map(r => (
                <button key={r} type="button" className={`role-btn ${form.role === r ? 'active' : ''}`} onClick={() => setForm(p => ({...p, role: r}))}>
                  {r === 'student' ? '🎓 Student' : '👨‍🏫 Instructor'}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
      </div>
    </div>
  );
}
