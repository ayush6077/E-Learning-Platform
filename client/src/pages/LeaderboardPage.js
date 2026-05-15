import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './LeaderboardPage.css';

const RANK_ICONS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/students/leaderboard').then(r => { setStudents(r.data || []); setLoading(false); }).catch(() => {
      setStudents([
        { _id: '1', name: 'Chris Park', totalXP: 3500, level: 7, streak: 21, badges: [{ name: 'Top Learner', icon: '🏆' }] },
        { _id: '2', name: 'Alex Rivera', totalXP: 2840, level: 6, streak: 14, badges: [{ name: 'Streak Master', icon: '🔥' }] },
        { _id: '3', name: 'Jamie Lee', totalXP: 1920, level: 4, streak: 7, badges: [] },
        { _id: '4', name: 'Taylor Kim', totalXP: 800, level: 2, streak: 3, badges: [] },
      ]);
      setLoading(false);
    });
  }, []);

  const myRank = students.findIndex(s => s._id === user?._id) + 1;

  return (
    <div className="leaderboard-page page-enter">
      <div className="lb-hero">
        <div className="container">
          <h1 className="lb-title">🏆 Global <span className="text-gradient">Leaderboard</span></h1>
          <p className="lb-subtitle">Top learners ranked by total XP earned</p>
          {myRank > 0 && <div className="lb-my-rank">Your rank: <strong>#{myRank}</strong></div>}
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        {/* Top 3 Podium */}
        {!loading && students.length >= 3 && (
          <div className="lb-podium">
            {[students[1], students[0], students[2]].map((s, i) => {
              const rank = [2, 1, 3][i];
              return s ? (
                <div key={s._id} className={`podium-card ${rank === 1 ? 'podium-first' : ''}`}>
                  <div className="podium-rank-icon">{RANK_ICONS[rank - 1]}</div>
                  <div className="podium-avatar">{s.name?.[0]}</div>
                  <div className="podium-name">{s.name}</div>
                  <div className="podium-xp">{s.totalXP?.toLocaleString()} XP</div>
                  <div className="podium-level">Lv. {s.level}</div>
                </div>
              ) : null;
            })}
          </div>
        )}

        {/* Full Table */}
        <div className="lb-table card">
          <div className="lb-table-header">
            <span>Rank</span><span>Student</span><span>Level</span><span>XP</span><span>Streak</span><span>Badges</span>
          </div>
          {loading ? [...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 60, margin: '4px 0', borderRadius: 8 }}></div>
          )) : students.map((s, i) => (
            <div key={s._id} className={`lb-row ${s._id === user?._id ? 'lb-row-me' : ''}`}>
              <span className="lb-rank">
                {i < 3 ? RANK_ICONS[i] : <span className="lb-rank-num">#{i + 1}</span>}
              </span>
              <span className="lb-student">
                <div className="lb-av" style={{ background: `hsl(${i * 47 % 360}, 60%, 45%)` }}>{s.name?.[0]}</div>
                <div>
                  <div className="lb-name">{s.name} {s._id === user?._id && <span className="lb-you-badge">You</span>}</div>
                </div>
              </span>
              <span><span className="badge badge-purple">Lv. {s.level}</span></span>
              <span className="lb-xp">{s.totalXP?.toLocaleString()} <span style={{ color: 'var(--text-3)', fontSize: 11 }}>XP</span></span>
              <span className="lb-streak">🔥 {s.streak || 0}d</span>
              <span className="lb-badges">
                {s.badges?.slice(0, 3).map((b, bi) => (
                  <span key={bi} title={b.name} style={{ fontSize: 18 }}>{b.icon}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
