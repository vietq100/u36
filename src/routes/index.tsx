import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import { LoadingOverlay } from "@/components/shared/feedback/LoadingOverlay";

// Lazy load pages for performance
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const PropertiesPage = lazy(() => import("@/features/properties/pages/PropertiesPage"));
const ClientsPage = lazy(() => import("@/features/clients/pages/ClientsPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const ContractsPage = lazy(() => import("@/features/contracts/pages/ContractsPage"));
const InquiriesPage = lazy(() => import("@/features/inquiries/pages/InquiriesPage"));

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
            element: withSuspense(DashboardPage),
          },
          {
            path: "properties",
            element: withSuspense(PropertiesPage),
          },
          {
            path: "clients",
            element: withSuspense(ClientsPage),
          },
          {
            path: "contracts",
            element: withSuspense(ContractsPage),
          },
          {
            path: "inquiries",
            element: withSuspense(InquiriesPage),
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
