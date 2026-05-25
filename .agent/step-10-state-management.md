# Bước 10: Global State Management với Zustand

**Mục tiêu**: Quản lý các state dùng chung toàn cục (ngoại trừ Dữ liệu API đã được quản lý bởi TanStack Query và trạng thái Auth đã quản lý ở `useAuthStore`).

## 1. Khi nào dùng Zustand?
Chỉ dùng Zustand cho các trạng thái Client-side mang tính chất chia sẻ giữa nhiều component không liên quan đến nhau, ví dụ:
- Trạng thái đóng/mở của Sidebar.
- Theme hiện tại (Light/Dark mode).
- Trạng thái các Modal/Dialog dùng chung toàn cục.
- Cấu hình ngôn ngữ (i18n).

**KHÔNG DÙNG Zustand cho:**
- Dữ liệu fetch từ API (VD: Danh sách khách hàng) -> Dùng `TanStack Query`.
- Dữ liệu form -> Dùng `React Hook Form`.
- State chỉ dùng trong 1 component -> Dùng `useState` hoặc `useReducer`.

## 2. Cài đặt Zustand
```bash
npm install zustand
```

## 3. Tạo Store cơ bản (Ví dụ: useAppStore)
Tạo file `src/stores/useAppStore.ts`:
```typescript
import { create } from 'zustand';

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>()((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}));
```

## 4. Tích hợp Store vào Component
Sử dụng hook được tạo ra từ Zustand trực tiếp trong các Component.

Ví dụ ở `Header.tsx`:
```tsx
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function Header() {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      {/* ... */}
    </header>
  );
}
```

Ví dụ ở `Sidebar.tsx`:
```tsx
import { useAppStore } from '@/stores/useAppStore';

export function Sidebar() {
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-64 border-r bg-background">
      {/* ... */}
    </aside>
  );
}
```
