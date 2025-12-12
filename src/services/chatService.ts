import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Buat instance axios dengan konfigurasi default
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 detik timeout
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  sessionId?: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

// Fungsi untuk mengirim pesan ke backend
export const sendChatMessage = async (message: string, sessionId?: string): Promise<ChatResponse> => {
  try {
    const response = await api.post<ChatResponse>('/chat', {
      message,
      sessionId: sessionId || 'default'
    });
    return response.data;
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    throw new Error(error.response?.data?.error || 'Failed to send message');
  }
};

// Fungsi untuk memulai chat baru
export const startNewChat = async (sessionId?: string) => {
  try {
    const response = await api.post('/chat/new', {
      sessionId: sessionId || 'default'
    });
    return response.data;
  } catch (error) {
    console.error('Error starting new chat:', error);
  }
};

// Fungsi untuk cek kesehatan backend
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Backend is not reachable:', error);
    return null;
  }
};

export default api;