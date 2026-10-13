import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI } from '../services/api.js';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Sparkles,
  HelpCircle,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const PracticePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Timer per session
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await sessionAPI.getSessionById(sessionId);
        if (data.success && data.session) {
          setSession(data.session);

          // Populate existing answers into local drafts
          const initialDrafts = {};
          data.session.answers?.forEach((ans) => {
            initialDrafts[ans.questionIndex] = ans.answerText;
          });
          setAnswerDrafts(initialDrafts);
        }
      } catch (err) {
        setStatusMessage({
          type: 'danger',
          text: err.message || 'Unable to load interview session.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const currentQuestion = session?.questions?.[currentIndex];
  const totalQuestions = session?.questions?.length || 0;
  const currentAnswer = answerDrafts[currentIndex] || '';

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTextChange = (e) => {
    setAnswerDrafts({
      ...answerDrafts,
      [currentIndex]: e.target.value,
    });
  };

  const handleSaveCurrentAnswer = async () => {
    if (!currentAnswer.trim()) {
      setStatusMessage({ type: 'warning', text: 'Please write an answer before proceeding.' });
      return false;
    }

    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const data = await sessionAPI.saveAnswer(sessionId, {
        questionIndex: currentIndex,
        answerText: currentAnswer.trim(),
      });

      if (data.success) {
        setSession(data.session);
        return true;
      }
      return false;
    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.message || 'Failed to save answer.' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const saved = await handleSaveCurrentAnswer();
    if (saved && currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setStatusMessage({ type: '', text: '' });
    }
  };

  const handleFinishInterview = async () => {
    const saved = await handleSaveCurrentAnswer();
    if (!saved) return;

    setSaving(true);
    try {
      await sessionAPI.completeSession(sessionId);
      // Navigate to feedback review page (Phase 5)
      navigate(`/feedback/${sessionId}`);
    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.message || 'Failed to finalize session.' });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
        <div className="spinner" style={{ width: 44, height: 44, borderTopColor: 'var(--accent-primary)' }} />
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div style={{ maxWidth: 600, margin: '3rem auto' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <AlertCircle size={36} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h3 className="card-title">Session Unavailable</h3>
          <p className="card-subtitle" style={{ marginBottom: '1.5rem' }}>
            {statusMessage.text || 'Could not find this mock interview session.'}
          </p>
          <button onClick={() => navigate('/setup')} className="btn btn-primary">
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div style={{ maxWidth: 900, margin: '1rem auto' }}>
      {/* Top Header & Progress Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="tag" style={{ background: 'var(--bg-surface)' }}>
            {session.interviewType}
          </span>
          <span className="tag" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', borderColor: '#6366f1' }}>
            {session.difficulty}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <Clock size={16} />
          <span>{formatTime(secondsElapsed)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'var(--accent-gradient)',
            transition: 'width 300ms ease',
          }}
        />
      </div>

      {statusMessage.text && (
        <div className={`alert alert-${statusMessage.type}`}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Question Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          <HelpCircle size={16} />
          <span>Interviewer Prompt</span>
        </div>
        <h3 style={{ fontSize: '1.35rem', lineHeight: 1.5, fontWeight: 600, color: 'var(--text-primary)' }}>
          {currentQuestion.prompt}
        </h3>
      </div>

      {/* Answer Editor Area */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            Your Answer (Text Submission)
          </label>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {wordCount} words | {currentAnswer.length} characters
          </span>
        </div>

        <textarea
          className="form-textarea"
          style={{ minHeight: 220, fontSize: '1rem', lineHeight: 1.6 }}
          placeholder="Type your structured answer here. State your primary point clearly, explain the reasoning, and provide a concrete example or project reference..."
          value={currentAnswer}
          onChange={handleTextChange}
        />

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handlePrevious}
            className="btn btn-secondary"
            disabled={currentIndex === 0 || saving}
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <div className="spinner" style={{ width: 16, height: 16 }} />
                ) : (
                  <>
                    <span>Save & Next</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishInterview}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                disabled={saving}
              >
                {saving ? (
                  <div className="spinner" style={{ width: 16, height: 16 }} />
                ) : (
                  <>
                    <FileCheck size={18} />
                    <span>Complete Interview</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
