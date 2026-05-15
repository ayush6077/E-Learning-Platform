import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LessonPage.css';

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [toast, setToast] = useState('');
  const startTime = useRef(Date.now());

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          axios.get(`/courses/${courseId}`),
          axios.get(`/progress/${courseId}`)
        ]);
        setCourse(cRes.data);
        setProgress(pRes.data);
        // Find active lesson
        const allLessons = cRes.data.modules?.flatMap(m => m.lessons) || [];
        const found = lessonId !== '0' ? allLessons.find(l => l._id === lessonId) : allLessons[0];
        setActiveLesson(found || allLessons[0]);
      } catch {}
      setLoading(false);
    };
    load();
  }, [courseId, lessonId]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCompleteLesson = async () => {
    if (!activeLesson) return;
    setCompleting(true);
    const timeSpent = Math.round((Date.now() - startTime.current) / 60000);
    try {
      const { data } = await axios.put(`/progress/${courseId}/lesson/${activeLesson._id}`, { timeSpent: Math.max(timeSpent, 1) });
      setProgress(data);
      showToast(`+50 XP! Lesson complete 🎉`);
      // Navigate to next lesson
      const allLessons = course.modules?.flatMap(m => m.lessons) || [];
      const idx = allLessons.findIndex(l => l._id === activeLesson._id);
      if (idx < allLessons.length - 1) {
        const next = allLessons[idx + 1];
        setActiveLesson(next);
        navigate(`/learn/${courseId}/${next._id}`, { replace: true });
        startTime.current = Date.now();
      } else {
        showToast('🏆 Course complete! Amazing work!');
      }
    } catch { showToast('Error saving progress'); }
    setCompleting(false);
  };

  if (loading) return <div className="loading-screen"><div className="pulse-loader"></div></div>;
  if (!course) return <div style={{ padding: 100, textAlign: 'center' }}><h2>Course not found</h2><Link to="/dashboard">Back to Dashboard</Link></div>;

  const allLessons = course.modules?.flatMap(m => m.lessons) || [];
  const isCompleted = (lid) => progress?.completedLessons?.includes(lid);
  const currentIdx = allLessons.findIndex(l => l._id === activeLesson?._id);

  return (
    <div className="lesson-page">
      {toast && <div className="toast toast-success">{toast}</div>}

      {/* Top Bar */}
      <div className="lesson-topbar">
        <Link to="/dashboard" className="lesson-back">← Dashboard</Link>
        <div className="lesson-course-title">{course.title}</div>
        <div className="lesson-progress-bar-wrap">
          <div className="progress-bar" style={{ width: 180 }}>
            <div className="progress-fill" style={{ width: `${progress?.percentComplete || 0}%` }}></div>
          </div>
          <span className="lesson-pct">{progress?.percentComplete || 0}%</span>
        </div>
      </div>

      <div className="lesson-layout">
        {/* Sidebar */}
        <aside className="lesson-sidebar">
          <div className="lesson-sidebar-header">
            <h3>Course Content</h3>
            <span className="lesson-sidebar-count">{allLessons.length} lessons</span>
          </div>
          <div className="lesson-modules-list">
            {course.modules?.map((mod, mi) => (
              <div key={mi} className="lesson-module-group">
                <div className="lesson-module-title">
                  <span>Module {mi + 1}</span>
                  <span className="lesson-module-name">{mod.title}</span>
                </div>
                {mod.lessons.map((l, li) => (
                  <button key={li} className={`lesson-item ${activeLesson?._id === l._id ? 'active' : ''} ${isCompleted(l._id) ? 'done' : ''}`}
                    onClick={() => { setActiveLesson(l); navigate(`/learn/${courseId}/${l._id}`, { replace: true }); startTime.current = Date.now(); }}>
                    <span className="lesson-item-icon">{isCompleted(l._id) ? '✓' : '▶'}</span>
                    <span className="lesson-item-title">{l.title}</span>
                    <span className="lesson-item-dur">{l.duration}m</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="lesson-main">
          <div className="lesson-video-area">
            <div className="lesson-video-placeholder">
              <div className="lesson-play-btn">▶</div>
              <p>{activeLesson?.title}</p>
              <span>{activeLesson?.duration} min</span>
            </div>
          </div>

          <div className="lesson-content-area">
            <div className="lesson-content-header">
              <div>
                <h1 className="lesson-title">{activeLesson?.title}</h1>
                <p className="lesson-meta">Lesson {currentIdx + 1} of {allLessons.length} • {activeLesson?.duration} min</p>
              </div>
              <button className={`btn btn-primary ${isCompleted(activeLesson?._id) ? 'btn-done' : ''}`}
                onClick={handleCompleteLesson} disabled={completing || isCompleted(activeLesson?._id)}>
                {isCompleted(activeLesson?._id) ? '✓ Completed' : completing ? 'Saving…' : 'Mark Complete +50 XP'}
              </button>
            </div>

            <div className="lesson-description card">
              <h3>About this lesson</h3>
              <p>{activeLesson?.description || 'In this lesson, you will learn the key concepts covered in the video above. Follow along with the exercises and make sure to complete the lesson to earn your XP.'}</p>
            </div>

            {/* XP Info */}
            <div className="lesson-xp-card card">
              <div className="lesson-xp-icon">⚡</div>
              <div>
                <h4>Earn XP by completing this lesson</h4>
                <p style={{ color: 'var(--text-2)', fontSize: 13 }}>+{activeLesson?.xpReward || 50} XP • Contributes to your daily streak</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="lesson-nav">
              <button className="btn btn-secondary" disabled={currentIdx === 0}
                onClick={() => { const prev = allLessons[currentIdx - 1]; setActiveLesson(prev); navigate(`/learn/${courseId}/${prev._id}`, { replace: true }); }}>
                ← Previous
              </button>
              <button className="btn btn-secondary" disabled={currentIdx >= allLessons.length - 1}
                onClick={() => { const next = allLessons[currentIdx + 1]; setActiveLesson(next); navigate(`/learn/${courseId}/${next._id}`, { replace: true }); }}>
                Next →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
