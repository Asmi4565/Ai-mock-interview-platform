import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { profileAPI } from '../services/api.js';
import { Save, Plus, X, User, Briefcase, GraduationCap, Code, FolderGit2, CheckCircle, AlertCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();

  const [educationLevel, setEducationLevel] = useState('Undergraduate - Final Year');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [skills, setSkills] = useState(['JavaScript', 'React', 'Node.js']);
  const [newSkill, setNewSkill] = useState('');
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileAPI.getProfile();
        if (data.success && data.profile) {
          setEducationLevel(data.profile.educationLevel || 'Undergraduate - Final Year');
          setTargetRole(data.profile.targetRole || 'Full Stack Developer');
          setSkills(data.profile.skills || []);
          setProjects(data.profile.projectDescriptions || []);
        }
      } catch (err) {
        setStatusMessage({ type: 'danger', text: err.message || 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    const trimmed = newProject.trim();
    if (trimmed) {
      setProjects([...projects, trimmed]);
      setNewProject('');
    }
  };

  const handleRemoveProject = (indexToRemove) => {
    setProjects(projects.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const result = await profileAPI.updateProfile({
        educationLevel,
        targetRole,
        skills,
        projectDescriptions: projects,
      });

      if (result.success) {
        setStatusMessage({ type: 'success', text: 'Student profile updated successfully!' });
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: err.message || 'Error saving profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderTopColor: 'var(--accent-primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '1rem auto' }}>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="card-title">Student Profile</h2>
            <p className="card-subtitle">
              Personalize your mock interview sessions and target role settings
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <User size={15} color="#6366f1" />
            <span>{user?.name} ({user?.email})</span>
          </div>
        </div>

        {statusMessage.text && (
          <div className={`alert alert-${statusMessage.type}`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Target Role & Education Level */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="targetRole">
                <Briefcase size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
                Target Job Role
              </label>
              <input
                id="targetRole"
                type="text"
                className="form-input"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Frontend Engineer"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="educationLevel">
                <GraduationCap size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
                Education Level
              </label>
              <select
                id="educationLevel"
                className="form-select"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
              >
                <option value="Undergraduate - 1st Year">Undergraduate - 1st Year</option>
                <option value="Undergraduate - 2nd Year">Undergraduate - 2nd Year</option>
                <option value="Undergraduate - 3rd Year">Undergraduate - 3rd Year</option>
                <option value="Undergraduate - Final Year">Undergraduate - Final Year</option>
                <option value="Postgraduate / Masters">Postgraduate / Masters</option>
                <option value="Recent Graduate">Recent Graduate</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">
              <Code size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
              Key Technical & Soft Skills
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add a skill (e.g., Python, SQL, REST APIs, Git)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
              />
              <button type="button" onClick={handleAddSkill} className="btn btn-secondary">
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>

            <div className="tag-container">
              {skills.map((skill) => (
                <span key={skill} className="tag">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="tag-remove"
                    title={`Remove ${skill}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No skills listed yet. Add skills to help tailor questions.
                </span>
              )}
            </div>
          </div>

          {/* Academic / Portfolio Projects */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">
              <FolderGit2 size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
              Key Academic & Portfolio Projects (Optional)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Describe a project (e.g., E-commerce store using MERN stack)"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddProject(e);
                  }
                }}
              />
              <button type="button" onClick={handleAddProject} className="btn btn-secondary">
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                  }}
                >
                  <span>{proj}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(idx)}
                    className="tag-remove"
                    title="Remove project"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {projects.length === 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No projects added yet. Adding projects helps simulate resume project questions.
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <div className="spinner" style={{ width: 18, height: 18 }} />
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
