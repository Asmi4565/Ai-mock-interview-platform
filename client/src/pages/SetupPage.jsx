import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI, profileAPI } from '../services/api.js';
import { Sparkles, Play, Briefcase, Layers, Sliders, Hash, AlertCircle } from 'lucide-react';

export const SetupPage = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState('Full Stack Developer');
  const [interviewType, setInterviewType] = useState('Technical Fundamentals');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [questionCount, setQuestionCount] = useState(3);

  const [options, setOptions] = useState({
    roles: [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Data Scientist',
      'General Software Engineer',
    ],
    categories: [
      'HR / Behavioral',
      'Technical Fundamentals',
      'Role-Specific Practice',
      'System Design & Architecture',
    ],
    difficulties: ['Beginner', 'Intermediate', 'Advanced'],
    questionCounts: [3, 5, 7],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-sync with student profile's target role
  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const [optData, profData] = await Promise.allSettled([
          sessionAPI.getInterviewOptions(),
          profileAPI.getProfile(),
        ]);

        if (optData.status === 'fulfilled' && optData.value.success) {
          setOptions(optData.value.options);
        }

        if (profData.status === 'fulfilled' && profData.value.success && profData.value.profile?.targetRole) {
          setRole(profData.value.profile.targetRole);
        }
      } catch (err) {
        console.warn('Using default options:', err.message);
      }
    };

    fetchDefaults();
  }, []);

  const handleStartSession = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await sessionAPI.createSession({
        role: role.trim(),
        interviewType,
        difficulty,
        questionCount: parseInt(questionCount, 10),
      });

      if (data.success && data.session?._id) {
        navigate(`/practice/${data.session._id}`);
      } else {
        throw new Error(data.message || 'Failed to initialize session');
      }
    } catch (err) {
      setError(err.message || 'Could not start interview session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '1.5rem auto' }}>
      <div className="card">
        <div className="card-header" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '0.4rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', marginBottom: '0.75rem' }}>
            <Sparkles size={28} color="#6366f1" />
          </div>
          <h2 className="card-title">Configure Mock Interview</h2>
          <p className="card-subtitle">
            Choose your target role, interview category, and preferred session length
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleStartSession}>
          {/* Target Role */}
          <div className="form-group">
            <label className="form-label" htmlFor="role">
              <Briefcase size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
              Target Role
            </label>
            <select
              id="role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {options.roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Interview Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="interviewType">
              <Layers size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
              Interview Category
            </label>
            <select
              id="interviewType"
              className="form-select"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
            >
              {options.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Difficulty */}
            <div className="form-group">
              <label className="form-label" htmlFor="difficulty">
                <Sliders size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
                Difficulty Level
              </label>
              <select
                id="difficulty"
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {options.difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Count */}
            <div className="form-group">
              <label className="form-label" htmlFor="questionCount">
                <Hash size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
                Questions Count
              </label>
              <select
                id="questionCount"
                className="form-select"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
              >
                {options.questionCounts.map((qc) => (
                  <option key={qc} value={qc}>
                    {qc} Questions (~{qc * 3} mins)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Educational Note */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '1rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            💡 <strong>Interview Tip:</strong> Questions will be delivered one at a time. You can revise your answers before completing the session, and each answer will receive detailed rubric-based feedback.
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" style={{ width: 18, height: 18 }} />
            ) : (
              <>
                <Play size={18} />
                <span>Begin Practice Session</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupPage;
