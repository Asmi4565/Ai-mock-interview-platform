import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionAPI } from '../services/api.js';
import {
  Clock,
  ExternalLink,
  Trash2,
  Filter,
  Play,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchSessions = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await sessionAPI.getUserSessions(page, 10);
      if (data.success) {
        setSessions(data.sessions || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch session history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(1);
  }, []);

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session and all associated answer attempts?')) return;
    try {
      await sessionAPI.deleteSession(sessionId);
      fetchSessions(pagination.page);
    } catch (err) {
      alert(err.message || 'Failed to delete session.');
    }
  };

  const filteredSessions = sessions.filter((sess) => {
    const matchesStatus = filterStatus === 'all' || sess.status === filterStatus;
    const matchesSearch =
      searchTerm === '' ||
      sess.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sess.interviewType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ maxWidth: 1040, margin: '1rem auto' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              <Clock size={16} />
              <span>Practice Logs</span>
            </div>
            <h2 className="card-title">Interview History</h2>
            <p className="card-subtitle">
              Review all past interview attempts, re-examine feedback reports, or clean up saved history
            </p>
          </div>

          <Link to="/setup" className="btn btn-primary">
            <Play size={16} />
            <span>New Practice Session</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 260 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by role or category (e.g. Frontend, Behavioral)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Sessions ({pagination.total})</option>
              <option value="completed">Completed Only</option>
              <option value="in-progress">In Progress Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="spinner" style={{ width: 36, height: 36, borderTopColor: 'var(--accent-primary)' }} />
          </div>
        ) : filteredSessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredSessions.map((sess) => (
              <div
                key={sess._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{sess.role}</span>
                    <span className="tag" style={{ fontSize: '0.75rem' }}>{sess.interviewType}</span>
                    <span className="tag" style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', borderColor: '#6366f1' }}>
                      {sess.difficulty}
                    </span>
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

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Started on {new Date(sess.createdAt).toLocaleDateString()} at{' '}
                    {new Date(sess.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                    • {sess.questionCount || sess.questions?.length} Questions
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {sess.status === 'completed' ? (
                    <Link to={`/feedback/${sess._id}`} className="btn btn-secondary btn-sm">
                      <span>View Report</span>
                      <ExternalLink size={14} />
                    </Link>
                  ) : (
                    <Link to={`/practice/${sess._id}`} className="btn btn-primary btn-sm">
                      <span>Resume Practice</span>
                      <ArrowRight size={14} />
                    </Link>
                  )}

                  <button
                    onClick={() => handleDeleteSession(sess._id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.45rem', color: 'var(--danger)' }}
                    title="Delete session"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => fetchSessions(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn btn-secondary btn-sm"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => fetchSessions(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="btn btn-secondary btn-sm"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              No practice sessions match your search or filter.
            </p>
            <Link to="/setup" className="btn btn-primary">
              <Play size={16} />
              <span>Start New Interview</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
