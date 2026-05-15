import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './CourseDetailPage.css';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [openModule, setOpenModule] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    axios.get(`/courses/${id}`).then(r => {
      setCourse(r.data);
      if (user) setEnrolled(r.data.enrolledStudents?.includes(user._id));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, user]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleEnroll = async () => {
    if (!isAuthenticated) return navigate('/login');
    setEnrolling(true);
    try {
      await axios.post(`/courses/${id}/enroll`);
      setEnrolled(true);
      showToast('🎉 Enrolled successfully!');
    } catch (err) {
      if (err.response?.data?.message === 'Already enrolled') { setEnrolled(true); return; }
      showToast('Enrollment failed. Try again.');
    }
    setEnrolling(false);
  };

  if (loading) return <div className="loading-screen"><div className="pulse-loader"></div></div>;
  if (!course) return <div className="container" style={{ paddingTop: 100, textAlign: 'center' }}><h2>Course not found</h2></div>;

  const totalLessons = course.modules?.reduce((a, m) => a + m.lessons.length, 0) || 0;
  const firstModule = course.modules?.[0]?._id;
  const firstLesson = course.modules?.[0]?.lessons?.[0]?._id;

  return (
    <div className="course-detail-page page-enter">
      {toast && <div className="toast toast-success">{toast}</div>}

      <div className="cd-hero">
        <div className="container">
          <div className="cd-breadcrumb"><Link to="/courses">Courses</Link> / <span>{course.category}</span></div>
          <div className="cd-hero-content">
            <div className="cd-hero-left">
              <span className="badge badge-purple">{course.category}</span>
              <h1 className="cd-title">{course.title}</h1>
              <p className="cd-desc">{course.description}</p>
              <div className="cd-meta-row">
                <span>⭐ <strong>{course.rating?.toFixed(1)}</strong> ({course.totalRatings?.toLocaleString()} ratings)</span>
                <span>👥 {course.enrolledStudents?.length || 0} students</span>
                <span>⏱ {Math.round((course.totalDuration || 0) / 60)}h total</span>
                <span className="cd-level-badge">{course.level}</span>
              </div>
              <div className="cd-instructor-row">
                <div className="cd-inst-av">{course.instructor?.name?.[0]}</div>
                <div><span style={{ fontSize: 12, color: 'var(--text-3)' }}>Instructor</span><br/><strong>{course.instructor?.name}</strong></div>
              </div>
            </div>
            <div className="cd-hero-right">
              <div className="cd-enroll-card card">
                <div className="cd-enroll-thumb" style={{ '--clr': '#7c6fff' }}></div>
                <div className="cd-enroll-body">
                  <div className="cd-price">{course.isFree ? '🎓 Free' : `$${course.price}`}</div>
                  {enrolled ? (
                    <Link to={`/learn/${id}/${firstLesson || '0'}`} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>Continue Learning →</Link>
                  ) : (
                    <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleEnroll} disabled={enrolling}>
                      {enrolling ? 'Enrolling…' : 'Enroll Now →'}
                    </button>
                  )}
                  <ul className="cd-perks">
                    <li>✓ {totalLessons} lessons across {course.modules?.length} modules</li>
                    <li>✓ {Math.round((course.totalDuration || 0) / 60)} hours of content</li>
                    <li>✓ Quizzes & hands-on projects</li>
                    <li>✓ Certificate of completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="cd-body">
          <div className="cd-main">
            {course.outcomes?.length > 0 && (
              <div className="cd-section card">
                <h3 className="cd-section-title">What you'll learn</h3>
                <div className="cd-outcomes">
                  {course.outcomes.map((o, i) => <div key={i} className="cd-outcome">✓ {o}</div>)}
                </div>
              </div>
            )}

            <div className="cd-section">
              <h3 className="cd-section-title">Course Curriculum</h3>
              <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 16 }}>{course.modules?.length} modules • {totalLessons} lessons</p>
              <div className="cd-modules">
                {course.modules?.map((mod, mi) => (
                  <div key={mi} className="cd-module card">
                    <button className="cd-module-header" onClick={() => setOpenModule(openModule === mi ? -1 : mi)}>
                      <div>
                        <span className="cd-mod-num">Module {mi + 1}</span>
                        <h4 className="cd-mod-title">{mod.title}</h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{mod.lessons.length} lessons</span>
                        <span style={{ transform: openModule === mi ? 'rotate(180deg)' : 'none', transition: '0.2s', color: 'var(--text-3)' }}>▼</span>
                      </div>
                    </button>
                    {openModule === mi && (
                      <div className="cd-lessons">
                        {mod.lessons.map((l, li) => (
                          <div key={li} className="cd-lesson">
                            <span className="cd-lesson-icon">▶</span>
                            <span className="cd-lesson-title">{l.title}</span>
                            <span className="cd-lesson-dur">{l.duration} min</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
