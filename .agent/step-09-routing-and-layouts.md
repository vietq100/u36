# Bước 9: Routing và Layouts

**Mục tiêu**: Định tuyến các trang trong ứng dụng và xây dựng bộ khung Layout chính (Sidebar, Header) của hệ thống.

## 1. Cài đặt thư viện
```bash
npm install react-router-dom
```

## 2. Cấu trúc Layout
Dự án sẽ có 2 layout chính:
- **AuthLayout**: Layout đơn giản dùng cho trang Login, Forgot Password (không có sidebar).
- **DashboardLayout**: Layout phức tạp cho các trang bên trong, bao gồm Sidebar và Header.

Xây dựng component `DashboardLayout` tại `src/layouts/DashboardLayout.tsx`:
```tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet /> {/* Các trang con sẽ render ở đây */}
        </main>
      </div>
    </div>
  );
}
```

## 3. Cấu hình Routes với `createBrowserRouter`
Nên sử dụng kiến trúc Data Router mới của React Router v6.
Tạo file `src/routes/index.tsx`:

```tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

// Lazy load các trang để tối ưu performance
import { lazy, Suspense } from "react";
const PropertiesPage = lazy(() => import("@/features/properties/pages/PropertiesPage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />, // Chặn người dùng chưa đăng nhập
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <div>Dashboard Home</div>,
          },
          {
            path: "properties",
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <PropertiesPage />
              </Suspense>
            ),
          },
          // Thêm các route khác tại đây...
        ],
      },
    ],
  },
  {
    path: "*",
    element: <div>404 - Not Found</div>,
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
```

## 4. Tích hợp Sidebar với Router
Trong component `Sidebar.tsx`, sử dụng thẻ `NavLink` của `react-router-dom` kết hợp với styling để highlight menu item đang được chọn (active state).
