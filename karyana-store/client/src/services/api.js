const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('karyana_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  post: async (endpoint, body) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  put: async (endpoint, body) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }
};
