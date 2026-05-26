import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export const customInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://dev-leasing-api.sadec.co',
});

// Thêm request interceptor để đính kèm Token (nếu có)
customInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm response interceptor để xử lý lỗi chung (VD: 401) và tự động giải nén (unwrap) kết quả ABP nếu có
customInstance.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      if ('result' in response.data && 'success' in response.data) {
        response.data = response.data.result;
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý logout, clear token...
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const axiosInstance = <T>(
  url: string,
  config: RequestInit
): Promise<T> => {
  const headers: Record<string, string> = {};
  if (config.headers) {
    const rawHeaders = config.headers as any;
    if (typeof rawHeaders.forEach === 'function') {
      rawHeaders.forEach((value: string, key: string) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, rawHeaders);
    }
  }

  let data: any = undefined;
  if (config.body) {
    try {
      data = JSON.parse(config.body as string);
    } catch {
      data = config.body;
    }
  }

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: (config.method || 'GET').toLowerCase() as any,
    headers,
    data,
  };

  return customInstance(axiosConfig).then((response) => response.data);
};
