import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  const fillDemo = (role) => {
    if (role === 'student') setForm({ email: 'student@elearn.dev', password: 'password123' });
    if (role === 'instructor') setForm({ email: 'sarah@elearn.dev', password: 'password123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orbs"><div className="auth-orb auth-orb-1"></div><div className="auth-orb auth-orb-2"></div></div>
      <div className="auth-card card">
        <div className="auth-logo"><span className="auth-logo-icon">⚡</span><span className="brand-text">EduPulse</span></div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Continue your learning journey</p>

        <div className="demo-btns">
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Try demo:</span>
          <button className="demo-btn" onClick={() => fillDemo('student')}>Student</button>
          <button className="demo-btn" onClick={() => fillDemo('instructor')}>Instructor</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register" className="auth-link">Create one</Link></p>
      </div>
    </div>
  );
}
