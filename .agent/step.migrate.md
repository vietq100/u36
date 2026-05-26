# Nhật ký Tiến trình Migration Hệ thống PMH Leasing (step.migrate.md)

Tài liệu này ghi lại tiến trình di chuyển (migrate) từng module/feature từ hệ thống cũ sang kiến trúc mới `pmh_v2`. Tài liệu sẽ được cập nhật tuần tự khi từng module được hoàn thành.

---

## Danh sách các Module đã di chuyển (Migrated Modules)

### 1. Module: Auth & Login (Xác thực và Đăng nhập)
- **Thời gian**: 2026-05-26
- **Trạng thái**: [x] Đã hoàn thành
- **Công việc thực hiện**:
  - Tích hợp logic xử lý và form đăng nhập (`LoginForm.tsx` & `useAuthStore.ts`).
  - Hỗ trợ chế độ chạy thử nghiệm (Demo Mode) khi dùng `fake-jwt-token`.
  - Cấu hình tự động giải nén (unwrap) định dạng phản hồi `{ result, success }` của ABP Framework trong Axios interceptor để tương thích trong suốt với các query/mutation hooks sinh từ OpenAPI.
  - Tối ưu hóa bộ chọn Select/Combobox để tránh lặp vô hạn (Infinite Loop).
- **Kết quả xác minh**: Build hệ thống biên dịch 100% thành công. Đăng nhập thành công và lưu trữ token đúng mục tiêu.

---

## Hướng dẫn các bước tiếp theo
Khi bắt đầu di chuyển một module mới (ví dụ: `Clients`, `Properties`, `Contracts`,...):
1. Thảo luận và thống nhất về phương án thiết kế UI (kính mờ thích ứng) và cách liên kết dữ liệu API của module đó.
2. Thực hiện migration code của module đó.
3. Cập nhật thông tin chi tiết của module đó vào tài liệu này (không liệt kê trước các module chưa thực hiện).
