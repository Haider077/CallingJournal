import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await api.post('/token', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const register = async (email, password) => {
  const response = await api.post('/register', { email, password });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getEntries = async (skip = 0, limit = 100) => {
  const response = await api.get(`/entries/?skip=${skip}&limit=${limit}`);
  return response.data;
};


export const getEntry = async (date) => {
  try {
    const response = await api.get(`/entries/${date}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createEntry = async (entry) => {
  const response = await api.post('/entries/', entry);
  return response.data;
};

export const updateEntry = async (date, entry) => {
  // Backend doesn't seem to have a specific update endpoint in the snippet I saw,
  // but usually it's PUT /entries/{date}. 
  // I'll check crud.py to be sure.
  // For now assuming createEntry might handle upsert or I need to implement update.
  // Let's assume we might need to add it to backend if missing.
  const response = await api.put(`/entries/${date}`, entry);
  return response.data;
};

export const deleteEntry = async (date) => {
  const response = await api.delete(`/entries/${date}`);
  return response.data;
};

export const sendMessage = async (sessionId, content, context = null) => {
  const payload = { role: 'user', content };
  if (context) {
    payload.context = context;
  }
  const response = await api.post(`/chat/${sessionId}`, payload);
  return response.data;
};

export const getChatHistory = async (sessionId) => {
  const response = await api.get(`/chat/${sessionId}/messages`);
  return response.data;
};

export const getChatSessions = async () => {
  const response = await api.get('/chat/sessions');
  return response.data;
};

export const createChatSession = async (title = "New Chat") => {
  const response = await api.post('/chat/sessions', { title });
  return response.data;
};

export const deleteChatSession = async (sessionId) => {
  const response = await api.delete(`/chat/sessions/${sessionId}`);
  return response.data;
};

export default api;
