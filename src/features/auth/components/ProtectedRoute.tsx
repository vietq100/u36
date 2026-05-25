import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    const hasPermission = allowedRoles.some(role => user.roles.includes(role));
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}
