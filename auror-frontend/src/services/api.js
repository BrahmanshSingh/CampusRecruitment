// Auror API Client Layer

const API_BASE = '/api';

/**
 * Universal fetch wrapper with automatic JWT token attachment
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auror_token');
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && (data.error || data.message || (typeof data === 'string' ? data : JSON.stringify(data)))) || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // System Health
  health: {
    check: () => apiRequest('/health', { method: 'GET' }),
  },

  // Authentication
  auth: {
    devLogin: (payload = {}) =>
      apiRequest('/auth/dev-token', {
        method: 'POST',
        body: JSON.stringify({
          username: payload.username || 'puranjay_lead',
          role: payload.role || 'student',
          university_name: payload.university_name || 'Thapar Institute of Engineering & Technology',
        }),
      }),
    getMe: () => apiRequest('/auth/me', { method: 'GET' }),
    getGithubLoginUrl: () => apiRequest('/auth/login', { method: 'GET' }),
  },

  // Opportunity Reconnaissance (Placements)
  placements: {
    list: (params = {}) => {
      const queryParams = new URLSearchParams();
      if (params.query) queryParams.append('query', params.query);
      if (params.tier && params.tier !== 'ALL') queryParams.append('tier', params.tier);
      const qs = queryParams.toString();
      return apiRequest(`/ingest/placements${qs ? `?${qs}` : ''}`, { method: 'GET' });
    },
    apply: (placementId) => apiRequest(`/ingest/placements/${placementId}/apply`, { method: 'POST' }),
  },

  // Interrogation Room (Zero-Day Challenge & AI Judge)
  assessment: {
    generate: ({ claimed_skill = 'Python', difficulty = 'medium', language = 'python' } = {}) =>
      apiRequest('/assessment/generate', {
        method: 'POST',
        body: JSON.stringify({ claimed_skill, difficulty, language }),
      }),
    getActive: () => apiRequest('/assessment/active', { method: 'GET' }),
    submitSolution: ({ verification_id, student_fix }) =>
      apiRequest('/submit/solution', {
        method: 'POST',
        body: JSON.stringify({ verification_id, student_fix }),
      }),
  },
};

export default api;
