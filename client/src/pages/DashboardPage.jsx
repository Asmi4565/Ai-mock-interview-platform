import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardAPI, sessionAPI } from '../services/api.js';
import {
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  Play,
  User,
  ArrowRight,
  Trash2,
  AlertCircle,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardAPI.getStats();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session and its answers?')) return;
    try {
      await sessionAPI.deleteSession(sessionId);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Could not delete session.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
        <div className="spinner" style={{ width: 44, height: 44, borderTopColor: 'var(--accent-primary)' }} />
      </div>
    );
  }

  const {
    totalSessions = 0,
    completedSessions = 0,
    averageOverallScore = null,
    totalEvaluatedAnswers = 0,
    rubricAverages = {},
    recentSessions = [],
  } = stats || {};

  return (
    <div style={{ maxWidth: 1040, margin: '1rem auto' }}>
      {/* Welcome Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              <Sparkles size={16} />
              <span>Student Practice Dashboard</span>
            </div>
            <h2 className="card-title" style={{ fontSize: '1.75rem' }}>
              Welcome back, {user?.name || 'Student'}!
            </h2>
            <p className="card-subtitle">
              Track your interview performance, practice weak answers, and measure rubric improvements.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/setup" className="btn btn-primary">
              <Play size={16} />
              <span>Start New Interview</span>
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              <User size={16} />
              <span>Profile Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Aggregate Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Total Attempts</span>
            <Clock size={16} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{totalSessions}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {completedSessions} sessions completed
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Average Score</span>
            <Award size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: averageOverallScore ? (averageOverallScore >= 70 ? 'var(--success)' : averageOverallScore >= 50 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)' }}>
            {averageOverallScore !== null ? `${averageOverallScore}%` : 'N/A'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Across {totalEvaluatedAnswers} evaluated answers
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Evaluated Answers</span>
            <CheckCircle2 size={16} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{totalEvaluatedAnswers}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Tested with live AI rubric
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Completion Rate</span>
            <TrendingUp size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>
            {totalSessions > 0 ? `${Math.round((completedSessions / totalSessions) * 100)}%` : '0%'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Consistent practice habit
          </div>
        </div>
      </div>

      {/* Rubric Criteria Trends Breakdown */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>5-Point Rubric Average Breakdown</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Historical scoring averages per SRS evaluation criterion (Scale: 1 – 10)
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-secondary)', fontSize: '0.85rem' }}>
            <BarChart3 size={16} />
            <span>Rubric Analysis</span>
          </div>
        </div>

        {totalEvaluatedAnswers > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { key: 'relevance', label: 'Question Relevance', val: rubricAverages.relevance || 0 },
              { key: 'clarity', label: 'Clarity & Logical Structure', val: rubricAverages.clarity || 0 },
              { key: 'completeness', label: 'Answer Completeness', val: rubricAverages.completeness || 0 },
              { key: 'technicalCorrectness', label: 'Technical Correctness', val: rubricAverages.technicalCorrectness || 0 },
              { key: 'examplesAndReasoning', label: 'Concrete Examples & STAR Reasoning', val: rubricAverages.examplesAndReasoning || 0 },
            ].map((item) => (
              <div key={item.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.val >= 7 ? 'var(--success)' : item.val >= 5 ? 'var(--warning)' : 'var(--danger)' }}>
                    {item.val} / 10
                  </span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(item.val / 10) * 100}%`,
                      height: '100%',
                      background: item.val >= 7 ? 'var(--success)' : item.val >= 5 ? 'var(--warning)' : 'var(--danger)',
                      borderRadius: 4,
                      transition: 'width 300ms ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No rubric evaluations recorded yet. Complete an interview and evaluate an answer to see criteria breakdown!
          </div>
        )}
      </div>

      {/* Recent Sessions List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Practice Attempts</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Quick access to your latest mock interviews and reports
            </p>
          </div>
          <Link to="/history" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>View All History</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentSessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentSessions.map((sess) => (
              <div
                key={sess._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{sess.role}</span>
                    <span className="tag" style={{ fontSize: '0.75rem' }}>{sess.interviewType}</span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600,
                        background: sess.status === 'completed' ? 'var(--success-bg)' : 'var(--warning-bg)',
                        color: sess.status === 'completed' ? '#86efac' : '#fde047',
                      }}
                    >
                      {sess.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(sess.createdAt).toLocaleDateString()} at {new Date(sess.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sess.questionCount || sess.questions?.length} Questions
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {sess.avgScore !== null && (
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: sess.avgScore >= 70 ? 'var(--success)' : 'var(--warning)', marginRight: '0.5rem' }}>
                      {sess.avgScore}%
                    </div>
                  )}

                  {sess.status === 'completed' ? (
                    <Link to={`/feedback/${sess._id}`} className="btn btn-secondary btn-sm">
                      <span>View Report</span>
                      <ExternalLink size={14} />
                    </Link>
                  ) : (
                    <Link to={`/practice/${sess._id}`} className="btn btn-primary btn-sm">
                      <span>Resume</span>
                      <ArrowRight size={14} />
                    </Link>
                  )}

                  <button
                    onClick={() => handleDeleteSession(sess._id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.4rem', color: 'var(--danger)' }}
                    title="Delete session"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              You haven't started any mock interview practice sessions yet.
            </p>
            <Link to="/setup" className="btn btn-primary">
              <Play size={16} />
              <span>Start Your First Interview</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
