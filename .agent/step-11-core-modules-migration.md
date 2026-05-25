# Bước 11: Core Modules Migration

**Mục tiêu**: Chuyển đổi (migrate) các tính năng cốt lõi từ dự án cũ (`pmh-leasing`) sang kiến trúc và stack công nghệ mới của `pmh_v2`.

## 1. Phân tích chức năng dự án cũ
Trong thư mục `src/scenes/` của dự án cũ có các module chính:
- `clientsManagement`
- `propertiesManagement`
- `leaseContractsManagement`
- `inquiriesManagement`
- `accounts`
- `master-data`
- ...

## 2. Quy trình Migrate một Module (Ví dụ: Properties)
Thay vì copy/paste code cũ (`mobx`, `antd`, class components), chúng ta sẽ đập đi xây lại UI theo các Pattern đã định nghĩa ở các bước trước.

### Bước A: Tạo cấu trúc thư mục Feature
Tạo thư mục `src/features/properties/`:
```text
properties/
├── api/          # (Tùy chọn) Ghi đè hoặc mở rộng API từ Orval cho property
├── components/   # PropertyForm.tsx, PropertyList.tsx, PropertyCard.tsx
├── hooks/        # Custom hook xử lý logic riêng của properties
├── pages/        # PropertiesPage.tsx, PropertyDetailPage.tsx
├── stores/       # Zustand store (nếu feature cần quản lý state phức tạp)
├── types/        # Định nghĩa interface riêng (nếu cần)
└── index.ts      # Export public API (chủ yếu là Pages)
```

### Bước B: Xây dựng UI Danh sách (List Page)
1. Sử dụng component `DataTable` (từ Bước 6).
2. Định nghĩa các `columns` cho bảng thuộc tính (Tên, Mã, Giá, Trạng thái...).
3. Dùng hook được Orval tự sinh (VD: `useGetPropertiesQuery`) để fetch data.
4. Gắn các callback update Search Params vào DataTable.

### Bước C: Xây dựng Form (Create/Edit)
1. Sử dụng chiến lược Form (Từ Bước 7).
2. Định nghĩa Zod schema cho Property.
3. Tạo `PropertyForm` dùng `react-hook-form` và `shadcn/ui`.
4. Viết hàm submit dùng hook mutation (VD: `useCreatePropertyMutation`).
5. Nếu API thành công, dùng `queryClient.invalidateQueries` để làm mới danh sách.

### Bước D: Cập nhật Routing
Đăng ký `PropertiesPage` vào file cấu hình router (`src/routes/index.tsx`) bên dưới nhánh có `ProtectedRoute`.

## 3. Lịch trình Đề xuất
Để giảm thiểu rủi ro, nên migrate theo thứ tự từ ít phụ thuộc đến nhiều phụ thuộc:
1. **Master Data**: (Danh mục Tỉnh/Thành, Loại BĐS...)
2. **Clients**: (Khách hàng độc lập)
3. **Properties**: (Bất động sản)
4. **Lease Contracts**: (Hợp đồng thuê - Cần liên kết với Clients và Properties)
5. **Inquiries**: (Yêu cầu hỗ trợ)
