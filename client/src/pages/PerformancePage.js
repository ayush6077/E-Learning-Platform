import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './PerformancePage.css';

const COLORS = ['#7c6fff', '#ff6b9d', '#00e5c9', '#ffd93d', '#4ade80'];

// Demo data fallback
const generateDemoData = () => Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
  studyTime: Math.floor(Math.random() * 120 + 20),
  lessonsCompleted: Math.floor(Math.random() * 5),
  avgQuizScore: Math.floor(Math.random() * 30 + 70),
  xpEarned: Math.floor(Math.random() * 200 + 50),
}));

export default function PerformancePage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`/performance/analytics?days=${range}`);
        setAnalytics(data);
      } catch {
        setAnalytics({
          summary: { totalTime: 1840, totalXP: user?.xp || 2840, avgScore: 87, completedCourses: 3, activeCourses: 2, weeklyStudyTime: 420, streak: user?.streak || 14, level: Math.floor((user?.xp || 0) / 1000) + 1, xp: user?.xp || 2840 },
          dailyData: generateDemoData(),
          enrollments: [
            { courseTitle: 'React & Next.js Mastery', category: 'Web Dev', progress: 75, timeSpent: 480, completed: false },
            { courseTitle: 'AI Fundamentals', category: 'AI/ML', progress: 45, timeSpent: 320, completed: false },
            { courseTitle: 'TypeScript Deep Dive', category: 'Programming', progress: 100, timeSpent: 240, completed: true },
          ]
        });
      }
      setLoading(false);
    };
    load();
  }, [range, user]);

  if (loading) return <div className="loading-screen"><div className="pulse-loader"></div></div>;

  const { summary, dailyData, enrollments } = analytics;

  const formattedDaily = (dailyData || generateDemoData()).map(d => ({
    ...d,
    date: typeof d.date === 'string' ? d.date : new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
  }));

  const skillData = [
    { name: 'Problem Solving', value: 85, fill: '#7c6fff' },
    { name: 'Code Quality', value: 78, fill: '#ff6b9d' },
    { name: 'Speed', value: 92, fill: '#00e5c9' },
    { name: 'Consistency', value: summary.streak > 7 ? 90 : 60, fill: '#ffd93d' },
  ];

  const categoryData = enrollments.reduce((acc, e) => {
    const existing = acc.find(a => a.name === e.category);
    if (existing) existing.value += e.timeSpent;
    else acc.push({ name: e.category || 'Other', value: e.timeSpent || 0 });
    return acc;
  }, []);

  return (
    <div className="performance-page page-enter">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="perf-header">
          <div>
            <h1 className="perf-title">Performance <span className="text-gradient">Analytics</span></h1>
            <p className="perf-subtitle">Track your progress and identify growth opportunities</p>
          </div>
          <div className="range-selector">
            {[7, 14, 30, 90].map(d => (
              <button key={d} className={`range-btn ${range === d ? 'active' : ''}`} onClick={() => setRange(d)}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="perf-summary-grid">
          {[
            { label: 'Study Hours', value: `${Math.round(summary.totalTime / 60)}h`, sub: `${summary.totalTime} min total`, icon: '⏱', color: '#7c6fff' },
            { label: 'XP Earned', value: summary.totalXP?.toLocaleString(), sub: `Level ${summary.level}`, icon: '⚡', color: '#ffd93d' },
            { label: 'Avg Quiz Score', value: `${summary.avgScore || 0}%`, sub: 'across all quizzes', icon: '🎯', color: '#00e5c9' },
            { label: 'Study Streak', value: `${summary.streak}d`, sub: 'current streak', icon: '🔥', color: '#ff6b9d' },
            { label: 'Courses Done', value: summary.completedCourses, sub: `${summary.activeCourses} in progress`, icon: '🏆', color: '#4ade80' },
            { label: 'This Week', value: `${Math.round(summary.weeklyStudyTime / 60)}h`, sub: 'study time', icon: '📅', color: '#7c6fff' },
          ].map((s, i) => (
            <div key={i} className="perf-stat-card" style={{ '--clr': s.color }}>
              <div className="psc-icon">{s.icon}</div>
              <div className="psc-value">{s.value}</div>
              <div className="psc-label">{s.label}</div>
              <div className="psc-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="charts-row">
          <div className="chart-card card">
            <h3 className="chart-title">Daily Study Time (minutes)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={formattedDaily.slice(-14)}>
                <defs>
                  <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c6fff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c6fff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(240,240,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(240,240,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="studyTime" stroke="#7c6fff" strokeWidth={2} fill="url(#studyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card card">
            <h3 className="chart-title">Quiz Scores (%)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={formattedDaily.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(240,240,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(240,240,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="avgQuizScore" fill="#00e5c9" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="charts-row">
          <div className="chart-card card">
            <h3 className="chart-title">XP Earned Per Day</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={formattedDaily.slice(-14)}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b9d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff6b9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(240,240,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(240,240,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#12122a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="xpEarned" stroke="#ff6b9d" strokeWidth={2} fill="url(#xpGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card card">
            <h3 className="chart-title">Skills Radar</h3>
            <div className="skill-bars">
              {skillData.map((s, i) => (
                <div key={i} className="skill-row">
                  <span className="skill-name">{s.name}</span>
                  <div className="skill-bar-track">
                    <div className="skill-bar-fill" style={{ width: `${s.value}%`, background: s.fill }}></div>
                  </div>
                  <span className="skill-pct" style={{ color: s.fill }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course Progress Table */}
        <div className="chart-card card" style={{ marginTop: 24 }}>
          <h3 className="chart-title">Course Progress Overview</h3>
          <div className="course-table">
            <div className="table-header">
              <span>Course</span><span>Category</span><span>Progress</span><span>Time Spent</span><span>Status</span>
            </div>
            {enrollments.map((e, i) => (
              <div key={i} className="table-row">
                <span className="table-course-name">{e.courseTitle}</span>
                <span><span className="badge badge-purple" style={{ fontSize: 11 }}>{e.category}</span></span>
                <span className="table-progress">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="progress-bar" style={{ width: 120 }}>
                      <div className="progress-fill" style={{ width: `${e.progress}%` }}></div>
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{e.progress}%</span>
                  </div>
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{Math.round(e.timeSpent / 60)}h {e.timeSpent % 60}m</span>
                <span>
                  {e.completed
                    ? <span className="badge badge-cyan">✓ Complete</span>
                    : <span className="badge badge-yellow">In Progress</span>
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
