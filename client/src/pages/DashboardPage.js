import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [progressList, setProgressList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          axios.get('/progress'),
          axios.get('/analytics/student')
        ]);
        setProgressList(pRes.data || []);
        setAnalytics(aRes.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const levelXP = (user?.totalXP || 0) % 500;
  const levelProgress = (levelXP / 500) * 100;
  const currentLevel = user?.level || 1;
  const completed = progressList.filter(p => p.completedAt).length;
  const inProgress = progressList.filter(p => !p.completedAt).length;

  const STAT_CARDS = [
    { label: 'Study Streak', value: `${user?.streak || 0}`, unit: 'days', icon: '🔥', color: 'var(--accent-2)' },
    { label: 'Total XP', value: (user?.totalXP || 0).toLocaleString(), unit: 'points', icon: '⚡', color: 'var(--accent-4)' },
    { label: 'In Progress', value: inProgress, unit: 'courses', icon: '📚', color: 'var(--accent)' },
    { label: 'Completed', value: completed, unit: 'courses', icon: '🏆', color: 'var(--accent-3)' },
  ];

  const COLORS = ['#7c6fff','#ff6b9d','#00e5c9','#ffd93d','#4ade80','#f97316'];

  return (
    <div className="dashboard-page page-enter">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="dash-welcome">
          <div>
            <h1 className="dash-title">Good {getTimeOfDay()}, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋</h1>
            <p className="dash-subtitle">You're on a roll! Keep up the momentum.</p>
          </div>
          <div className="level-card">
            <div className="level-info">
              <span className="level-badge">Level {currentLevel}</span>
              <span className="level-xp">{levelXP} / 500 XP</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${levelProgress}%` }}></div></div>
            <p className="level-hint">{500 - levelXP} XP to Level {currentLevel + 1}</p>
          </div>
        </div>

        <div className="dash-stats">
          {STAT_CARDS.map((s, i) => (
            <div key={i} className="stat-card" style={{ '--accent-clr': s.color }}>
              <div className="stat-top"><span className="stat-icon">{s.icon}</span></div>
              <div className="stat-value-big" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-meta"><span className="stat-unit">{s.unit}</span><span className="stat-label-sm">{s.label}</span></div>
            </div>
          ))}
        </div>

        <div className="dash-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Continue Learning</h2>
            <Link to="/courses" className="btn btn-secondary btn-sm">+ Explore New</Link>
          </div>
          {loading ? (
            <div className="course-grid">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 220 }}></div>)}</div>
          ) : progressList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No courses yet</h3>
              <p>Start your learning journey by enrolling in a course</p>
              <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
            </div>
          ) : (
            <div className="course-grid">
              {progressList.slice(0, 6).map((p, i) => (
                <div key={i} className="enr-card card">
                  <div className="enr-header" style={{ '--clr': COLORS[i % COLORS.length] }}>
                    <span className="enr-cat">{p.course?.category}</span>
                    {p.completedAt && <span className="enr-done">✓ Done</span>}
                  </div>
                  <div className="enr-body">
                    <h3 className="enr-title">{p.course?.title}</h3>
                    <div className="enr-progress-area">
                      <div className="enr-progress-label">
                        <span>Progress</span>
                        <span className="enr-pct">{p.percentComplete || 0}%</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.percentComplete || 0}%` }}></div></div>
                    </div>
                    <div className="enr-footer">
                      <span className="enr-time">⏱ {Math.round((p.timeSpent || 0) / 60)}h studied</span>
                      {!p.completedAt && (
                        <Link to={`/learn/${p.course?._id}/0`} className="btn btn-primary btn-sm">Continue →</Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-section">
          <h2 className="dash-section-title">Quick Actions</h2>
          <div className="quick-actions">
            {[
              { icon: '📊', label: 'Analytics', to: '/performance', color: 'var(--accent)' },
              { icon: '🏆', label: 'Leaderboard', to: '/leaderboard', color: 'var(--accent-4)' },
              { icon: '🔍', label: 'Courses', to: '/courses', color: 'var(--accent-2)' },
              { icon: '👤', label: 'Profile', to: '/profile', color: 'var(--accent-3)' },
            ].map((a, i) => (
              <Link key={i} to={a.to} className="quick-action-btn card">
                <span style={{ fontSize: 32 }}>{a.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
