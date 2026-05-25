# Bước 6: Chiến lược Data Table (Table Pattern)

**Mục tiêu**: Chuẩn hóa việc hiển thị dữ liệu dạng bảng với TanStack Table v8, hỗ trợ Pagination, Sorting và Filtering từ phía Server.

## 1. Cài đặt thư viện
```bash
npm install @tanstack/react-table
```

## 2. Kiến trúc DataTable dùng chung
Tạo một component bọc (Wrapper) `DataTable` tại `src/components/shared/DataTable.tsx`. Component này sẽ nhận vào:
- `columns`: Cấu hình cột.
- `data`: Mảng dữ liệu.
- `pageCount`, `pagination`: Dùng cho server-side pagination.
- Hàm `onPaginationChange`, `onSortingChange`.

## 3. Xử lý Server-Side State
Thay vì xử lý filter/sort ở component con, lưu trạng thái này lên **URL (Search Params)** hoặc dùng local state, sau đó truyền vào hook gọi API (TanStack Query).

Ví dụ kiến trúc trong một Feature:
```tsx
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

export function PropertiesList() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'createdAt:desc';

  // 1. Fetch data dựa trên state
  const { data, isLoading } = useGetPropertiesQuery({ page, sort });

  // 2. Render DataTable dùng chung
  return (
    <DataTable
      columns={propertiesColumns}
      data={data?.items || []}
      pageCount={data?.totalPages || 0}
      isLoading={isLoading}
      // Các hàm callback cập nhật searchParams khi chuyển trang/sort
    />
  );
}
```

## 4. Tích hợp shadcn/ui Table
Bên trong component `DataTable.tsx`, sử dụng các thành phần `<Table>`, `<TableHeader>`, `<TableRow>`, `<TableCell>` của shadcn/ui để render UI cho bảng.

## 5. Xử lý chức năng nâng cao
- **Debounced Search**: Thêm component thanh tìm kiếm dùng chung có debounce (tránh gọi API liên tục mỗi khi gõ phím).
- **Column Visibility**: Nút ẩn/hiện các cột.
- **Row Selection**: Checkbox ở cột đầu tiên để chọn nhiều dòng (thực hiện xóa hàng loạt).
