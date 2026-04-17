const isBrowser = typeof window !== 'undefined';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const buildUrl = (path, query = {}) => {
  const url = new URL(`${API_BASE_URL}${path}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const parseResponseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const apiRequest = async (path, { method = 'GET', body, query } = {}) => {
  const headers = {};
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    credentials: 'include',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await parseResponseBody(response);
  if (!response.ok) {
    const message = payload?.error || payload?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }
  return payload;
};

const unwrapList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const siteData = {
  auth: {
    async me() {
      const payload = await apiRequest('/api/auth/session');
      return payload?.user || null;
    },
    async login(email, password) {
      const payload = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      return payload?.user || null;
    },
    async logout() {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    },
    redirectToLogin(redirectTo) {
      if (!isBrowser) return;
      if (redirectTo) {
        window.location.href = redirectTo;
        return;
      }
      const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
      window.location.href = `/admin/login?next=${next}`;
    },
  },
  entities: {
    ContactRequest: {
      async list(sort = '-created_date', limit = 100) {
        const payload = await apiRequest('/api/admin/contact-requests', { query: { sort, limit } });
        return unwrapList(payload);
      },
      async create(data) {
        const payload = await apiRequest('/api/contact-requests', { method: 'POST', body: data });
        return payload?.item || payload;
      },
      async update(id, data) {
        const payload = await apiRequest(`/api/admin/contact-requests/${id}`, { method: 'PATCH', body: data });
        return payload?.item || payload;
      },
      async delete(id) {
        return apiRequest(`/api/admin/contact-requests/${id}`, { method: 'DELETE' });
      },
    },
    SectionView: {
      async list(sort = '-created_date', limit = 100) {
        const payload = await apiRequest('/api/admin/section-views', { query: { sort, limit } });
        return unwrapList(payload);
      },
      async create(data) {
        const payload = await apiRequest('/api/section-views', { method: 'POST', body: data });
        return payload?.item || payload;
      },
      async update() {
        throw new Error('SectionView updates are not supported.');
      },
      async delete() {
        throw new Error('SectionView deletion is not supported.');
      },
    },
    SiteSettings: {
      async list(sort = 'setting_key', limit = 1000) {
        const payload = await apiRequest('/api/admin/site-settings', { query: { sort, limit } });
        return unwrapList(payload);
      },
      async create(data) {
        const payload = await apiRequest('/api/admin/site-settings', { method: 'POST', body: data });
        return payload?.item || payload;
      },
      async update(id, data) {
        const payload = await apiRequest(`/api/admin/site-settings/${id}`, { method: 'PATCH', body: data });
        return payload?.item || payload;
      },
      async delete(id) {
        return apiRequest(`/api/admin/site-settings/${id}`, { method: 'DELETE' });
      },
    },
  },
};
