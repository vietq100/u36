import type { ReactNode } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

interface CanAccessProps {
  role: string;
  children: ReactNode;
}

export function CanAccess({ role, children }: CanAccessProps) {
  const hasRole = useAuthStore((state) => state.hasRole(role));
  
  if (!hasRole) return null;
  return <>{children}</>;
}
