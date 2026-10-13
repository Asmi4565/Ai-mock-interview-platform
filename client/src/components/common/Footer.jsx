import React from 'react';
import { Sparkles, Shield, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        padding: '2rem 1.5rem',
        fontSize: '0.88rem',
        color: 'var(--text-muted)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#6366f1" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>PrepAI Mock Interview</span>
          <span>• FSD Mini-Project</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Shield size={14} color="#f59e0b" />
            <span>Educational Practice Guidance Only (SRS Appendix B)</span>
          </span>
          <span>React • Node.js • Express • MongoDB • LLM AI</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
