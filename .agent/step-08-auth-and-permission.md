# Bước 8: Authentication và Permission (RBAC)

**Mục tiêu**: Xây dựng luồng đăng nhập an toàn, lưu trữ token, bảo vệ các router nội bộ và ẩn/hiện chức năng tùy thuộc vào vai trò (Role) của người dùng.

## 1. Lưu trữ trạng thái xác thực
Sử dụng Zustand để lưu thông tin Auth global (Tránh truyền props lằng nhằng).
Tạo file `src/features/auth/stores/useAuthStore.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserInfo {
  id: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  setAuth: (user: UserInfo, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token,
      hasRole: (role) => get().user?.roles.includes(role) || false,
    }),
    { name: 'auth-storage' } // Lưu vào localStorage tự động
  )
);
```

## 2. Quản lý Token và Interceptors
Đảm bảo file `src/api/client/axiosInstance.ts` đọc token từ `useAuthStore` hoặc `localStorage` và đính vào header của mọi request. Đặc biệt xử lý logic interceptor khi API trả về lỗi `401 Unauthorized` -> Tự động gọi hàm `logout()` và đẩy user về trang `/login`.

## 3. Thành phần bảo vệ Route (ProtectedRoute)
Tạo component `ProtectedRoute.tsx` để bọc quanh các trang cần đăng nhập:
```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Nếu route có yêu cầu role cụ thể
  if (allowedRoles && user) {
    const hasPermission = allowedRoles.some(role => user.roles.includes(role));
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />; // Cho phép render trang con
}
```

## 4. RBAC UI Component (CanAccess)
Để ẩn/hiện nút bấm dựa vào quyền, tạo component `CanAccess.tsx`:
```tsx
export function CanAccess({ role, children }: { role: string; children: React.ReactNode }) {
  const hasRole = useAuthStore((state) => state.hasRole(role));
  
  if (!hasRole) return null;
  return <>{children}</>;
}
```
Sử dụng:
```tsx
<CanAccess role="ADMIN">
  <Button>Xóa người dùng</Button>
</CanAccess>
```

## 5. Hành động cần làm
- Tạo UI Trang `/login`.
- Gắn form gọi API login.
- Xử lý lưu kết quả vào Zustand.
- Cấu hình Axios interceptor đọc token.
