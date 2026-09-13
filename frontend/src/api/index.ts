import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Secure in-memory token storage (never written to localStorage or sessionStorage)
let inMemoryAuthToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  inMemoryAuthToken = token;
  // Purge any lingering tokens from browser storage
  try {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
  } catch {}
};

export const getAuthToken = () => inMemoryAuthToken;

api.interceptors.request.use((config) => {
  if (inMemoryAuthToken && config.headers) {
    config.headers.Authorization = `Bearer ${inMemoryAuthToken}`;
  }
  return config;
});

export interface ConversationResponse {
  sessionId: string;
  message: string;
  readyToSubmit: boolean;
  analysisResult?: any;
}

export const startConversation = async (language: string): Promise<ConversationResponse> => {
  const { data } = await api.post('/api/conversations', { language });
  return data;
};

export const sendMessage = async (sessionId: string, message: string): Promise<ConversationResponse> => {
  const { data } = await api.post(`/api/conversations/${sessionId}/messages`, { message });
  return data;
};

export const submitGrievance = async (payload: any) => {
  const { data } = await api.post('/api/grievances', payload);
  return data;
};

