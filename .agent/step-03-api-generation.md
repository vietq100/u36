# Bước 3: API Generation & Fetching Layer

**Mục tiêu**: Xây dựng nền tảng giao tiếp với Backend hoàn toàn tự động sử dụng Orval để sinh ra API client từ OpenAPI/Swagger, kết hợp với Axios và TanStack Query.

## 1. Cài đặt thư viện
```bash
npm install axios @tanstack/react-query
npm install -D orval
```

## 2. Cấu hình Axios Instance
Tạo file `src/api/client/axiosInstance.ts` để cấu hình Base URL và các Interceptors (ví dụ: tự động gắn Bearer Token vào header, xử lý lỗi 401 Unauthorized để logout user).

```typescript
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com',
});

// Thêm request interceptor để đính kèm Token (nếu có)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
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
    }
    return Promise.reject(error);
  }
);
```

## 3. Cấu hình Orval
Tạo file `orval.config.js` ở thư mục gốc của project:

```javascript
module.exports = {
  pmhApi: {
    input: {
      target: './swagger.json', // Đường dẫn file swagger (có thể là url)
    },
    output: {
      mode: 'tags-split', // Chia nhỏ file sinh ra theo tag của API
      target: 'src/api/generated',
      schemas: 'src/api/types',
      client: 'react-query', // Tự động sinh ra các custom hooks cho react-query
      mock: false,
      override: {
        mutator: {
          path: 'src/api/client/axiosInstance.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
};
```

## 4. Thiết lập TanStack Query Provider
Bọc ứng dụng trong `App.tsx` hoặc `main.tsx` với `QueryClientProvider`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Tùy chỉnh mặc định
      retry: 1,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## 5. Script sinh code
Thêm vào `package.json`:
```json
"scripts": {
  "api:gen": "orval --config ./orval.config.js"
}
```
Chạy lệnh `npm run api:gen` mỗi khi API thay đổi để tự động update code frontend.
