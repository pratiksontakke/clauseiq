import axios from 'axios';
import type {
  AuthResponse,
  ContractsResponse,
  Contract,
  ContractVersion,
  Comment,
  Clause,
  Risk,
  DiffSummary,
  ChatResponse,
} from '../types/api';

// Create axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for handling cookies
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    const { access_token } = response.data;
    if (access_token) {
      localStorage.setItem('auth_token', access_token);
    }
    return response.data;
  },

  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { email, password });
    const { access_token } = response.data;
    if (access_token) {
      localStorage.setItem('auth_token', access_token);
    }
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
  },

  resetPassword: async (email: string) => {
    await api.post('/auth/reset-password', { email });
  },
};

// Contracts API
export const contracts = {
  list: async (status?: string) => {
    const response = await api.get<ContractsResponse>('/contracts/me', {
      params: { status }
    });
    return response.data;
  },

  getDetails: async (id: string) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  get: async (id: string): Promise<Contract> => {
    const response = await api.get<Contract>(`/contracts/${id}`);
    return response.data;
  },

  create: async (formData: FormData): Promise<Contract> => {
    const response = await api.post<Contract>('/contracts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Contract>): Promise<Contract> => {
    const response = await api.put<Contract>(`/contracts/${id}`, data);
    return response.data;
  },

  uploadVersion: async (id: string, formData: FormData): Promise<ContractVersion> => {
    const response = await api.post<ContractVersion>(`/contracts/${id}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  sign: async (id: string, signature: string): Promise<Contract> => {
    const response = await api.post<Contract>(`/api/contracts/${id}/sign`, { signature });
    return response.data;
  },
};

// Comments API
export const comments = {
  list: async (contractId: string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/comments/${contractId}`);
    return response.data;
  },

  create: async (contractId: string, data: { content: string; location?: string }): Promise<Comment> => {
    const response = await api.post<Comment>('/comments', { contract_id: contractId, ...data });
    return response.data;
  },

  reply: async (commentId: string, content: string): Promise<Comment> => {
    const response = await api.post<Comment>(`/comments/${commentId}/reply`, { content });
    return response.data;
  },
};

// AI Features API
export const ai = {
  chat: async (contractId: string, question: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/ai/chat', { contract_id: contractId, question });
    return response.data;
  },

  getClauses: async (contractId: string): Promise<Clause[]> => {
    const response = await api.get<Clause[]>(`/ai/clauses/${contractId}`);
    return response.data;
  },

  getRisks: async (contractId: string): Promise<Risk[]> => {
    const response = await api.get<Risk[]>(`/ai/risks/${contractId}`);
    return response.data;
  },

  getDiff: async (contractId: string, version1: string, version2: string): Promise<DiffSummary> => {
    const response = await api.get<DiffSummary>(`/ai/diff/${contractId}`, {
      params: { v1: version1, v2: version2 },
    });
    return response.data;
  },
};

export default api; 