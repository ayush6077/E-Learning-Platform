import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await axios.put('/auth/profile', form);
      updateUser(data);
      showToast('✓ Profile updated!');
    } catch { showToast('Failed to update profile'); }
    setSaving(false);
  };

  const levelXP = (user?.totalXP || 0) % 500;
  const levelProgress = (levelXP / 500) * 100;
  const xpToNext = 500 - levelXP;

  return (
    <div className="profile-page page-enter">
      {toast && <div className="toast toast-success">{toast}</div>}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 800 }}>
        <h1 className="profile-title">Your <span className="text-gradient">Profile</span></h1>

        {/* Profile Card */}
        <div className="profile-hero card">
          <div className="profile-av-big">
            {user?.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (
              <span>{user?.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="profile-hero-info">
            <h2 className="profile-name">{user?.name}</h2>
            <span className="badge badge-purple">{user?.role}</span>
            <p className="profile-bio-text">{user?.bio || 'No bio yet.'}</p>
            <div className="profile-level-section">
              <div className="profile-level-label">
                <span>Level {user?.level || 1}</span>
                <span style={{ color: 'var(--text-3)', fontSize: 13 }}>{xpToNext} XP to Level {(user?.level || 1) + 1}</span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${levelProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="profile-stats">
          {[
            { label: 'Total XP', value: (user?.totalXP || 0).toLocaleString(), icon: '⚡', color: 'var(--accent-4)' },
            { label: 'Current Level', value: user?.level || 1, icon: '🎖', color: 'var(--accent)' },
            { label: 'Study Streak', value: `${user?.streak || 0} days`, icon: '🔥', color: 'var(--accent-2)' },
            { label: 'Badges', value: user?.badges?.length || 0, icon: '🏅', color: 'var(--accent-3)' },
          ].map((s, i) => (
            <div key={i} className="profile-stat card">
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <span className="profile-stat-val" style={{ color: s.color }}>{s.value}</span>
              <span className="profile-stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Badges */}
        {user?.badges?.length > 0 && (
          <div className="profile-section card">
            <h3 className="profile-section-title">🏅 Your Badges</h3>
            <div className="badges-grid">
              {user.badges.map((b, i) => (
                <div key={i} className="badge-item">
                  <span className="badge-item-icon">{b.icon}</span>
                  <span className="badge-item-name">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="profile-section card">
          <h3 className="profile-section-title">Edit Profile</h3>
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="label">Bio</label>
              <textarea className="input" rows={4} value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} placeholder="Tell us about yourself…" style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </form>
        </div>

        <button className="btn btn-secondary" onClick={logout} style={{ marginTop: 8 }}>Sign Out</button>
      </div>
    </div>
  );
}
