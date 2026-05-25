import axios from 'axios';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com',
});

// Thêm request interceptor để đính kèm Token (nếu có)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm response interceptor để xử lý lỗi chung (VD: 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý logout, clear token...
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
