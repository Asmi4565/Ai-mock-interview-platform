// API Service Wrapper for backend communication

const API_BASE = '/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Auth API Calls
export const authAPI = {
  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => apiRequest('/auth/me'),
};

// Profile API Calls
export const profileAPI = {
  getProfile: () => apiRequest('/profile'),

  updateProfile: (profileData) =>
    apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};

// Session & Interview Practice API Calls
export const sessionAPI = {
  getInterviewOptions: () => apiRequest('/interview-options'),

  createSession: (config) =>
    apiRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  getUserSessions: (page = 1, limit = 10) =>
    apiRequest(`/sessions?page=${page}&limit=${limit}`),

  getSessionById: (id) => apiRequest(`/sessions/${id}`),

  saveAnswer: (sessionId, answerPayload) =>
    apiRequest(`/sessions/${sessionId}/answers`, {
      method: 'POST',
      body: JSON.stringify(answerPayload),
    }),

  completeSession: (sessionId) =>
    apiRequest(`/sessions/${sessionId}/complete`, {
      method: 'POST',
    }),

  deleteSession: (sessionId) =>
    apiRequest(`/sessions/${sessionId}`, {
      method: 'DELETE',
    }),
};

// AI Evaluation & Retry API Calls
export const feedbackAPI = {
  evaluateAnswer: (sessionId, questionIndex) =>
    apiRequest(`/sessions/${sessionId}/answers/${questionIndex}/evaluate`, {
      method: 'POST',
    }),

  retryAnswer: (sessionId, questionIndex, revisedAnswerText) =>
    apiRequest(`/sessions/${sessionId}/answers/${questionIndex}/retry`, {
      method: 'POST',
      body: JSON.stringify({ revisedAnswerText }),
    }),

  getSessionFeedback: (sessionId) =>
    apiRequest(`/sessions/${sessionId}/feedback`),
};

// Dashboard Analytics API Calls
export const dashboardAPI = {
  getStats: () => apiRequest('/dashboard/stats'),
};



