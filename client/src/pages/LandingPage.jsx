import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Sparkles, CheckCircle2, RotateCcw, TrendingUp, ShieldAlert, ArrowRight } from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          <Sparkles size={16} color="#6366f1" />
          <span>Built for College Students & Fresh Graduates</span>
        </div>
        <h1 className="hero-title">
          Master Tech & HR Interviews with Structured AI Feedback
        </h1>
        <p className="hero-subtitle">
          Practice role-specific interview questions, receive actionable evaluations across a 5-point rubric, retry weak answers, and track your progress over time.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to="/setup" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
              <span>Start Practice Session</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
                <span>Create Free Student Account</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Core Features Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', margin: '3rem 0' }}>
        <div className="card">
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <CheckCircle2 size={24} color="#6366f1" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Standardized Rubric</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Every answer is assessed on Relevance, Clarity, Completeness, Technical Correctness, and Examples.
          </p>
        </div>

        <div className="card">
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <RotateCcw size={24} color="#06b6d4" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Retry Weak Answers</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Learn from feedback by revising answers immediately and comparing attempts side-by-side.
          </p>
        </div>

        <div className="card">
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <TrendingUp size={24} color="#10b981" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Track Progress</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review past sessions and monitor your score improvements across practice rounds.
          </p>
        </div>
      </section>

      {/* SRS Compliance Disclaimer Banner */}
      <section style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', margin: '2rem 0' }}>
        <ShieldAlert size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ color: 'var(--warning)', fontSize: '1rem', marginBottom: '0.25rem' }}>
            Educational Advisory Notice (SRS Appendix B)
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            This platform is designed for interview practice and learning guidance only. AI-generated feedback and practice scores are advisory, may be inaccurate, and must not be treated as an official measure of employment suitability.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
