import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";

// Lazy load pages for performance
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const PropertiesPage = lazy(() => import("@/features/properties/pages/PropertiesPage"));

// Suspense wrapper helper
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingOverlay fullScreen />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: withSuspense(LoginPage),
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 mb-4 border-b">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Hệ thống Phú Mỹ Hưng</h1>
                    <p className="text-muted-foreground">Chào mừng bạn trở lại hệ thống quản lý leasing</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Summary cards placeholders */}
                  {[
                    { label: "Tổng số BĐS", value: "245 căn", desc: "+12 căn tháng này" },
                    { label: "Hợp đồng hiệu lực", value: "189 bản", desc: "+4 bản mới" },
                    { label: "Khách hàng thuê", value: "154 đối tác", desc: "Tỉ lệ lấp đầy 92%" },
                    { label: "Yêu cầu xử lý", value: "8 yêu cầu", desc: "3 yêu cầu khẩn cấp" }
                  ].map((card, i) => (
                    <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
                      <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                      <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          {
            path: "properties",
            element: withSuspense(PropertiesPage),
          },
          {
            path: "clients",
            element: (
              <div className="rounded-xl border border-dashed p-8 text-center bg-card">
                <h3 className="text-lg font-medium">Khách hàng</h3>
                <p className="text-muted-foreground mt-1">Chức năng quản lý khách hàng đang phát triển.</p>
              </div>
            ),
          },
          {
            path: "contracts",
            element: (
              <div className="rounded-xl border border-dashed p-8 text-center bg-card">
                <h3 className="text-lg font-medium">Hợp đồng</h3>
                <p className="text-muted-foreground mt-1">Chức năng quản lý hợp đồng thuê đang phát triển.</p>
              </div>
            ),
          },
          {
            path: "inquiries",
            element: (
              <div className="rounded-xl border border-dashed p-8 text-center bg-card">
                <h3 className="text-lg font-medium">Yêu cầu hỗ trợ</h3>
                <p className="text-muted-foreground mt-1">Chức năng tiếp nhận và xử lý yêu cầu đang phát triển.</p>
              </div>
            ),
          },
          {
            path: "unauthorized",
            element: (
              <div className="rounded-xl border border-destructive p-8 text-center bg-card">
                <h3 className="text-lg font-semibold text-destructive">Không có quyền truy cập</h3>
                <p className="text-muted-foreground mt-1">Tài khoản của bạn không có đủ quyền để truy cập trang này.</p>
              </div>
            ),
          }
        ],
      },
    ],
  },
  {
    path: "*",
    element: (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">404</h1>
        <p className="text-muted-foreground mt-2">Không tìm thấy trang yêu cầu.</p>
        <a href="/" className="mt-4 text-primary hover:underline font-medium">
          Quay lại trang chủ
        </a>
      </div>
    ),
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
