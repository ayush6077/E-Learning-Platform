import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

const FEATURES = [
  { icon: '🧠', title: 'AI-Powered Learning', desc: 'Adaptive paths that evolve with your progress, served by real-time ML models.' },
  { icon: '⚡', title: 'XP & Leveling System', desc: 'Earn XP for every lesson, quiz, and streak. Level up and unlock exclusive content.' },
  { icon: '📊', title: 'Deep Analytics', desc: 'Charts, heatmaps, and skill breakdowns help you spot gaps and optimize study time.' },
  { icon: '🏆', title: 'Global Leaderboard', desc: 'Compete with learners worldwide. Climb ranks and earn rare achievement badges.' },
  { icon: '🎯', title: 'Hands-On Projects', desc: 'Every course ends with a production-grade project to add to your portfolio.' },
  { icon: '🌐', title: 'Live Cohorts', desc: 'Join weekly live sessions, peer reviews, and async discussion boards.' },
];

const STATS = [
  { value: '120K+', label: 'Active Learners' },
  { value: '840+', label: 'Expert Courses' },
  { value: '98%', label: 'Completion Rate' },
  { value: '4.9★', label: 'Avg Rating' },
];

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);

  useEffect(() => {
    axios.get('/courses?limit=3').then(r => setFeaturedCourses(r.data.courses || [])).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-bg-grid"></div>
        <div className="hero-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge-wrap">
            <span className="badge badge-purple">🚀 Built for 2026 Learners</span>
          </div>
          <h1 className="hero-title">Learn Faster.<br/><span className="text-gradient">Level Up</span> Smarter.</h1>
          <p className="hero-subtitle">The platform that gamifies your growth. Track performance with real-time analytics, earn XP, and build skills that matter in the AI era.</p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">Start for Free →</Link>
            <Link to="/courses" className="btn btn-secondary btn-lg">Browse Courses</Link>
          </div>
          <div className="hero-stats">
            {STATS.map((s, i) => (
              <div key={i} className="hero-stat">
                <div className="hero-stat-val">{s.value}</div>
                <div className="hero-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section features-section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-cyan">Why EduPulse</span>
            <h2 className="section-title">Everything to <span className="text-gradient-2">accelerate</span> you</h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredCourses.length > 0 && (
        <section className="section courses-section">
          <div className="container">
            <div className="section-header">
              <span className="badge badge-pink">Trending Now</span>
              <h2 className="section-title">Top Courses This Week</h2>
            </div>
            <div className="home-courses-grid">
              {featuredCourses.map((c, i) => (
                <Link key={c._id} to={`/courses/${c._id}`} className="home-course-card card">
                  <div className="hcc-thumb" style={{ '--clr': ['#7c6fff','#ff6b9d','#00e5c9'][i % 3] }}>
                    <span className="hcc-cat">{c.category}</span>
                    <span className="hcc-level badge">{c.level}</span>
                  </div>
                  <div className="hcc-body">
                    <h3 className="hcc-title">{c.title}</h3>
                    <p className="hcc-desc">{c.description?.slice(0, 90)}…</p>
                    <div className="hcc-footer">
                      <span>⭐ {c.rating?.toFixed(1)}</span>
                      <span>{c.enrolledStudents?.length || 0} students</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="section-cta">
              <Link to="/courses" className="btn btn-outline btn-lg">View All Courses →</Link>
            </div>
          </div>
        </section>
      )}

      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-orb"></div>
            <h2 className="cta-title">Ready to start your journey?</h2>
            <p className="cta-subtitle">Join 120,000+ learners already leveling up on EduPulse.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
