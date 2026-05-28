import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import React from 'react';
import { ThemeProvider } from '@/components/shared/layout/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const getErrorMessage = (error: any): string => {
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message ||
    "Đã xảy ra lỗi hệ thống."
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error: any) => {
      const message = getErrorMessage(error);
      toast.error(`Lỗi tải dữ liệu: ${message}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      const message = getErrorMessage(error);
      toast.error(`Thao tác thất bại: ${message}`);
    },
  }),
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster closeButton position="top-right" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
