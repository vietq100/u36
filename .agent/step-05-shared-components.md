# Bước 5: Shared UI Components

**Mục tiêu**: Xây dựng một thư viện component cục bộ (Dựa trên shadcn/ui) dùng chung cho mọi module, đảm bảo tính tái sử dụng và UI nhất quán.

## 1. Cài đặt các component cơ bản từ shadcn/ui
Sử dụng CLI để tự động kéo các component thiết yếu về thư mục `src/components/ui`:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add table
```

## 2. Xây dựng các Shared Component tự custom
Ngoài các component cơ bản của shadcn/ui, cần tạo các component ghép (composite components) ở thư mục `src/components/shared/` như:

- **ConfirmDialog**: Hộp thoại xác nhận (Xóa, Hủy, Lưu) dùng chung.
- **PageHeader**: Tiêu đề trang, có tích hợp Breadcrumb và nút hành động (Ví dụ: "Thêm mới", "Xuất Excel").
- **EmptyState**: Hiển thị khi danh sách trống hoặc lỗi dữ liệu.
- **LoadingOverlay**: Component hiển thị vòng xoay loading phủ toàn màn hình hoặc một khu vực.

Ví dụ `PageHeader.tsx`:
```tsx
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 mb-4 border-b">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex gap-2">
        {actions}
      </div>
    </div>
  );
}
```

## 3. Quy tắc khi tạo Component
- **Props**: Luôn định nghĩa TypeScript Interface cho Props.
- **ClassName**: Hỗ trợ truyền `className` từ ngoài vào bằng cách dùng `cn(defaultClass, className)`.
- **Thư mục**: Nếu một component chỉ dùng riêng cho tính năng "Auth", không để ở `src/components`, hãy để ở `src/features/auth/components`.
