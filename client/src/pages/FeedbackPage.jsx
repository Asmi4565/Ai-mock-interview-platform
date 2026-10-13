import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessionAPI, feedbackAPI } from '../services/api.js';
import {
  Sparkles,
  Award,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  BookOpen,
  Key,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const FeedbackPage = () => {
  const { sessionId } = useParams();

  const [session, setSession] = useState(null);
  const [feedbacks, setFeedbacks] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluatingIndex, setEvaluatingIndex] = useState(null);
  const [retryingIndex, setRetryingIndex] = useState(null);
  const [retryDraft, setRetryDraft] = useState('');
  const [credentialError, setCredentialError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Load session and feedbacks
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const data = await feedbackAPI.getSessionFeedback(sessionId);
        if (data.success) {
          setSession(data.session);

          // Map feedback records by questionIndex
          const fMap = {};
          data.feedbacks?.forEach((f) => {
            // Keep the latest attempt for each questionIndex
            if (!fMap[f.questionIndex] || f.attemptNumber > fMap[f.questionIndex].attemptNumber) {
              fMap[f.questionIndex] = f;
            }
          });
          setFeedbacks(fMap);
        }
      } catch (err) {
        // If feedback not yet generated, fetch session directly
        try {
          const sData = await sessionAPI.getSessionById(sessionId);
          if (sData.success) {
            setSession(sData.session);
          }
        } catch (sErr) {
          console.error('Error fetching session:', sErr);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [sessionId]);

  const handleEvaluateQuestion = async (index) => {
    setEvaluatingIndex(index);
    setCredentialError(null);

    try {
      const data = await feedbackAPI.evaluateAnswer(sessionId, index);
      if (data.success && data.feedback) {
        setFeedbacks((prev) => ({
          ...prev,
          [index]: data.feedback,
        }));
      }
    } catch (err) {
      if (err.data?.errorType === 'MISSING_CREDENTIALS') {
        setCredentialError(err.data.message);
      } else {
        alert(err.message || 'Evaluation failed. Please try again.');
      }
    } finally {
      setEvaluatingIndex(null);
    }
  };

  const handleOpenRetry = (index, currentAnswer) => {
    setRetryingIndex(index);
    setRetryDraft(currentAnswer || '');
  };

  const handleSubmitRetry = async (index) => {
    if (!retryDraft.trim()) {
      alert('Please enter a revised answer.');
      return;
    }

    setEvaluatingIndex(index);
    setCredentialError(null);

    try {
      const data = await feedbackAPI.retryAnswer(sessionId, index, retryDraft.trim());
      if (data.success && data.feedback) {
        setFeedbacks((prev) => ({
          ...prev,
          [index]: data.feedback,
        }));
        setRetryingIndex(null);
        setRetryDraft('');
      }
    } catch (err) {
      if (err.data?.errorType === 'MISSING_CREDENTIALS') {
        setCredentialError(err.data.message);
      } else {
        alert(err.message || 'Retry evaluation failed.');
      }
    } finally {
      setEvaluatingIndex(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
        <div className="spinner" style={{ width: 44, height: 44, borderTopColor: 'var(--accent-primary)' }} />
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ maxWidth: 600, margin: '3rem auto' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 className="card-title">Session Not Found</h3>
          <p className="card-subtitle" style={{ marginBottom: '1.5rem' }}>
            We could not find the requested interview session.
          </p>
          <Link to="/setup" className="btn btn-primary">
            Start New Practice
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Average Overall Score of evaluated answers
  const evaluatedKeys = Object.keys(feedbacks);
  const avgScore =
    evaluatedKeys.length > 0
      ? Math.round(
          evaluatedKeys.reduce((acc, k) => acc + (feedbacks[k]?.overallScore || 0), 0) /
            evaluatedKeys.length
        )
      : null;

  return (
    <div style={{ maxWidth: 960, margin: '1rem auto' }}>
      {/* Session Summary Header */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              <Award size={16} />
              <span>Session Evaluation Report</span>
            </div>
            <h2 className="card-title">{session.role} Mock Interview</h2>
            <p className="card-subtitle">
              {session.interviewType} • {session.difficulty} • {session.questions?.length} Questions
            </p>
          </div>

          {avgScore !== null ? (
            <div style={{ textAlign: 'center', background: 'var(--bg-primary)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: avgScore >= 70 ? 'var(--success)' : avgScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                {avgScore}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Practice Score
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <span className="tag" style={{ background: 'var(--bg-surface)' }}>
                Pending Evaluation
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Missing Credentials Banner (Clear Setup Guide) */}
      {credentialError && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--warning)', background: 'rgba(245, 158, 11, 0.08)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Key size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: 4 }} />
            <div>
              <h3 style={{ color: 'var(--warning)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                AI Provider Setup Required
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '0.75rem' }}>
                {credentialError}
              </p>
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                1. Visit <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Google AI Studio</a> and generate a free API key.<br />
                2. Open <strong>server/.env</strong> and set: <code>AI_API_KEY=your_actual_key_here</code><br />
                3. Restart the backend server and click "Evaluate with AI" below.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
        {session.questions?.map((q, idx) => {
          const isEvaluated = !!feedbacks[idx];
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`btn btn-sm ${activeTab === idx ? 'btn-primary' : 'btn-secondary'}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              <span>Question {idx + 1}</span>
              {isEvaluated && <CheckCircle size={14} color="#10b981" />}
            </button>
          );
        })}
      </div>

      {/* Active Question Evaluation Card */}
      {session.questions?.[activeTab] && (() => {
        const q = session.questions[activeTab];
        const answerObj = session.answers?.find((a) => a.questionIndex === activeTab);
        const feedback = feedbacks[activeTab];
        const isEvaluating = evaluatingIndex === activeTab;
        const isRetrying = retryingIndex === activeTab;

        return (
          <div className="card">
            {/* Prompt */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Prompt #{activeTab + 1} ({q.category})
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {q.prompt}
              </h3>
            </div>

            {/* Student Submitted Answer */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Your Submitted Answer {answerObj?.attemptNumber > 1 ? `(Attempt #${answerObj.attemptNumber})` : ''}:
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {answerObj?.answerText ? `${answerObj.answerText.split(/\s+/).length} words` : 'Not answered'}
                </span>
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: answerObj?.answerText ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                {answerObj?.answerText || 'No answer submitted for this question.'}
              </p>
            </div>

            {/* Evaluation Section */}
            {feedback ? (
              <div>
                {/* Score & Rubric Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Overall Question Score
                    </span>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: feedback.overallScore >= 70 ? 'var(--success)' : feedback.overallScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                      {feedback.overallScore} / 100
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleOpenRetry(activeTab, answerObj?.answerText)}
                      className="btn btn-secondary btn-sm"
                    >
                      <RotateCcw size={15} />
                      <span>Retry Answer</span>
                    </button>
                  </div>
                </div>

                {/* 5-Point Rubric Grid */}
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                  SRS 5-Point Rubric Evaluation
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {Object.entries(feedback.rubricScores || {}).map(([key, val]) => {
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase());
                    return (
                      <div key={key} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          {label}
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: val >= 7 ? 'var(--success)' : val >= 5 ? 'var(--warning)' : 'var(--danger)' }}>
                          {val} / 10
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Strengths & Improvements */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#86efac', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <CheckCircle size={16} />
                      <span>Strengths</span>
                    </div>
                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {feedback.strengths?.map((str, idx) => (
                        <li key={idx} style={{ marginBottom: '0.35rem' }}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: 'var(--warning-bg)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fde047', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <AlertTriangle size={16} />
                      <span>Areas for Improvement</span>
                    </div>
                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {feedback.improvements?.map((imp, idx) => (
                        <li key={idx} style={{ marginBottom: '0.35rem' }}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Explanation */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Detailed Evaluation
                  </h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {feedback.explanation}
                  </p>
                </div>

                {/* Suggested Model Answer */}
                {feedback.suggestedAnswer && (
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-secondary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                      <Lightbulb size={16} />
                      <span>Exemplary Model Answer Approach</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                      {feedback.suggestedAnswer}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Not Yet Evaluated State */
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                  {answerObj?.answerText
                    ? 'Ready for structured evaluation against the 5-point SRS rubric.'
                    : 'Submit an answer during the interview session to enable AI feedback.'}
                </p>

                {answerObj?.answerText && (
                  <button
                    onClick={() => handleEvaluateQuestion(activeTab)}
                    className="btn btn-primary"
                    disabled={isEvaluating}
                  >
                    {isEvaluating ? (
                      <>
                        <div className="spinner" style={{ width: 16, height: 16 }} />
                        <span>Evaluating with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Evaluate with AI</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Answer Retry Drawer / Form */}
            {isRetrying && (
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>
                  Retry & Improve Your Answer
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Incorporate the feedback and model guidance above, then submit your revision for immediate re-scoring.
                </p>
                <textarea
                  className="form-textarea"
                  value={retryDraft}
                  onChange={(e) => setRetryDraft(e.target.value)}
                  placeholder="Draft your revised answer here..."
                  style={{ minHeight: 180, marginBottom: '0.75rem' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setRetryingIndex(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmitRetry(activeTab)}
                    className="btn btn-primary btn-sm"
                    disabled={isEvaluating}
                  >
                    {isEvaluating ? (
                      <>
                        <div className="spinner" style={{ width: 14, height: 14 }} />
                        <span>Evaluating Retry...</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw size={14} />
                        <span>Submit Revision & Re-Evaluate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Advisory Notice Banner (SRS Section 8.2 & Appendix B) */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '1.5rem' }}>
        <ShieldAlert size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Educational Advisory Notice (SRS Appendix B):</strong> AI evaluation scores are approximate practice guidance. They do not constitute an official employment screening or certified assessment.
        </span>
      </div>
    </div>
  );
};

export default FeedbackPage;
