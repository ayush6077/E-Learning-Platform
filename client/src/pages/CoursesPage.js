import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './CoursesPage.css';

const CATEGORIES = ['All', 'Web Development', 'AI/ML', 'Data Science', 'UI/UX Design', 'DevOps', 'Blockchain', 'Cybersecurity', 'Mobile Dev'];
const LEVELS = ['All', 'beginner', 'intermediate', 'advanced'];
const COLORS = ['#7c6fff', '#ff6b9d', '#00e5c9', '#ffd93d', '#4ade80', '#f97316'];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 9 });
    if (search) params.set('search', search);
    if (category !== 'All') params.set('category', category);
    if (level !== 'All') params.set('level', level);
    axios.get(`/courses?${params}`).then(r => {
      setCourses(r.data.courses || []);
      setTotal(r.data.total || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [search, category, level, page]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  return (
    <div className="courses-page page-enter">
      <div className="courses-header-section">
        <div className="container">
          <h1 className="courses-page-title">Explore <span className="text-gradient">Courses</span></h1>
          <p className="courses-page-sub">{total} courses to power your career</p>
          <input className="input courses-search" placeholder="🔍  Search courses, topics, skills…" value={search} onChange={handleSearch} />
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div className="courses-filters">
          <div className="filter-row">
            {CATEGORIES.map(c => (
              <button key={c} className={`filter-chip ${category === c ? 'active' : ''}`} onClick={() => { setCategory(c); setPage(1); }}>{c}</button>
            ))}
          </div>
          <div className="filter-row level-row">
            {LEVELS.map(l => (
              <button key={l} className={`filter-chip level-chip ${level === l ? 'active' : ''}`} onClick={() => { setLevel(l); setPage(1); }}>{l === 'All' ? 'All Levels' : l}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="courses-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 320 }}></div>)}
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state" style={{ padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No courses found</h3>
            <p style={{ color: 'var(--text-2)' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((c, i) => (
              <Link key={c._id} to={`/courses/${c._id}`} className="course-card card">
                <div className="cc-thumb" style={{ '--clr': COLORS[i % COLORS.length] }}>
                  <div className="cc-category">{c.category}</div>
                  <div className="cc-level-badge">{c.level}</div>
                </div>
                <div className="cc-body">
                  <h3 className="cc-title">{c.title}</h3>
                  <p className="cc-desc">{c.description?.slice(0, 85)}…</p>
                  <div className="cc-instructor">
                    <div className="cc-av">{c.instructor?.name?.[0]}</div>
                    <span>{c.instructor?.name}</span>
                  </div>
                  <div className="cc-meta">
                    <span>⭐ {c.rating?.toFixed(1)} <span style={{ color: 'var(--text-3)' }}>({c.totalRatings?.toLocaleString()})</span></span>
                    <span>⏱ {Math.round((c.totalDuration || 0) / 60)}h</span>
                    <span>👥 {c.enrolledStudents?.length || 0}</span>
                  </div>
                  <div className="cc-footer">
                    <span className="cc-price">{c.isFree ? 'Free' : `$${c.price}`}</span>
                    <span className="btn btn-primary btn-sm">Enroll →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {total > 9 && (
          <div className="pagination">
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ color: 'var(--text-2)', fontSize: 14 }}>Page {page} of {Math.ceil(total / 9)}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / 9)} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
