# Quy chuẩn lập trình và Phát triển dự án dành cho AI Agent (Agent Rules & Standards)

Tài liệu này định nghĩa các quy tắc lập trình, ranh giới kiến trúc và tiêu chuẩn chất lượng bắt buộc mà mọi AI Agent khi hoạt động trên dự án (pmh_v2) phải tuân thủ tuyệt đối. Mục tiêu là đảm bảo toàn bộ mã nguồn được phát triển đồng bộ theo một hướng duy nhất.

---

## 1. Ranh giới Kiến trúc & Thư mục (Architecture & Folder Boundaries)

Dự án áp dụng mô hình **Feature-Based Architecture** kết hợp với **Clean Architecture** ở phía client.

*   **Không import chéo giữa các Features**:
    *   Các thư mục con trong `src/features/[feature-name]/` (như components, hooks, stores) là nội bộ của tính năng đó.
    *   Một feature `A` **không được phép** import trực tiếp các file nằm sâu trong feature `B`.
    *   Nếu feature `A` cần sử dụng tài nguyên của feature `B`, feature `B` phải export tài nguyên đó thông qua file public API `src/features/[feature-name]/index.ts`.
*   **Path Alias (`@/`)**:
    *   Bắt buộc dùng `@/` để đại diện cho thư mục `src/` khi thực hiện các import từ xa.
    *   Tránh viết relative import quá xa (ví dụ: cấm dùng `../../../../components/button`).

---

## 2. Tiêu chuẩn Giao diện & Tái sử dụng Component (UI & Componentization)

*   **Bắt buộc tái sử dụng Shared UI**:
    *   **TUYỆT ĐỐI KHÔNG** sử dụng trực tiếp các thẻ HTML thô (`<input>`, `<select>`, `<button>`, thẻ `<div>` làm card) đính kèm class CSS/Tailwind lặp đi lặp lại trong các file nghiệp vụ.
    *   Phải sử dụng các component đã được xây dựng sẵn từ `src/components/ui/` hoặc `src/components/shared/` hoặc `src/components/shared/forms/` (như `FormInput`, `Combobox`, `RichTextEditor`, `FileUploader`).
*   **Thiết kế Glassmorphism & Premium Aesthetic**:
    *   Duy trì giao diện tối giản, hiện đại và sang trọng, tương thích tốt cả giao diện Sáng (Light) và Tối (Dark).
    *   *Containers / Cards*: Sử dụng hiệu ứng kính mờ (Light: `bg-card/45 backdrop-blur-xl border-border/50 shadow`; Dark: `bg-white/3 backdrop-blur-xl border-white/10 shadow`).
    *   *Nút bấm*: Dùng component `<Button>` với variant và size thích hợp.
    *   *Thông báo*: Sử dụng `sonner` (`toast.success`, `toast.error`, `toast.info`). Tuyệt đối không dùng `alert()` của trình duyệt.
    *   *Xác nhận hành động*: Dùng component `<ConfirmDialog>` có sẵn.

---

## 3. Ranh giới Quản lý Trạng thái (State Management Boundaries)

*   **Server State (Dữ liệu từ API)**:
    *   Được quản lý hoàn toàn bởi **TanStack Query** (React Query).
    *   **CẤM** lưu trữ cache của dữ liệu API vào Zustand hoặc state cục bộ.
*   **Global Client State (Trạng thái UI toàn cục)**:
    *   Sử dụng **Zustand** cho các trạng thái cần chia sẻ giữa nhiều trang độc lập (như Auth State, Theme, Sidebar mở/đóng, UI Preferences).
*   **Local Client State (Trạng thái UI cục bộ)**:
    *   Sử dụng `useState` hoặc `useReducer` cho các trạng thái giao diện chỉ thuộc về bản thân component đó (như dropdown mở/đóng, modal ẩn/hiện, filters tạm thời).
*   **Đồng bộ danh sách lên URL**:
    *   Các trạng thái phân trang (`page`), kích thước trang (`pageSize`), tìm kiếm (`keyword`), bộ lọc (`filters`) của Data Table bắt buộc phải đồng bộ lên URL Search Params của trình duyệt.

---

## 4. Tương tác với API Layer (Data Fetching)

*   **Không tự viết API Client**:
    *   Toàn bộ API client được sinh tự động bởi Orval từ tài liệu OpenAPI/Swagger vào thư mục `src/api/generated/`.
    *   **CẤM chỉnh sửa** các file trong thư mục `generated/`.
    *   Các mutation/query hooks tự động sinh phải được gọi trực tiếp trong các components/hooks nghiệp vụ.
*   **Biến đổi Dữ liệu (Transformers)**:
    *   Khi dữ liệu từ API không phù hợp để hiển thị trực tiếp lên UI (hoặc bị lồng nhau phức tạp), hãy viết các hàm map dữ liệu tại thư mục `src/api/transformers/` thay vì xử lý trực tiếp trong component.
*   **Địa chỉ hành chính (Tỉnh/Thành, Quận/Huyện, Quốc gia)**:
    *   **TUYỆT ĐỐI KHÔNG** sử dụng các endpoint/hooks từ `@/api/generated/locations/locations` (như `useGetApiServicesAppLocationsGetListProvince`, `useGetApiServicesAppLocationsGetListDistrict`).
    *   **Bắt buộc** lấy từ `@/api/generated/category/category` (ví dụ: `useGetApiServicesAppCategoryGetListProvince`, `useGetApiServicesAppCategoryGetListDistrict`, `useGetApiServicesAppCategoryGetListCountry`).


---

## 5. Xử lý Form và Validation

*   **Chuẩn công nghệ**: Luôn sử dụng **React Hook Form** kết hợp với **Zod Schema** để thực hiện validation dữ liệu.
*   **Bắt lỗi từ Server (Server Validation Mapping)**:
    *   Với các lỗi kiểm tra dữ liệu trả về từ API (ví dụ lỗi HTTP 422 hoặc 400), phải bắt lỗi trong catch/onError block và sử dụng `form.setError` của React Hook Form để ánh xạ lỗi trực tiếp lên input field tương ứng trên màn hình.

---

## 6. Định dạng Ngày tháng (Date Handling)

*   **Chuẩn thư viện**: Sử dụng thư viện **date-fns** làm chuẩn duy nhất.
*   **Tập trung hóa định dạng**:
    *   Tất cả các hành động định dạng ngày tháng (Format date, time, relative time) phải được thực hiện thông qua helper dùng chung (tại `src/shared/utils/date.ts` hoặc tương đương).
    *   **CẤM hardcode** các chuỗi định dạng (như `'dd/MM/yyyy'`) trực tiếp trong các component giao diện.

---

## 7. Quy tắc Commit & Viết Mã nguồn (Golden Rules)

*   **Conventional Commits & Branch**:
    *   Nhánh mới: `feat/*`, `fix/*`, `refactor/*`, `chore/*`.
    *   Commit message: `<type>(<scope>): <description>` (Ví dụ: `feat(auth): integrate cookies storage for token`).
*   **TypeScript Strict Mode**:
    *   Luôn bật strict mode. Tuyệt đối **không sử dụng** kiểu dữ liệu `any`. Sử dụng `unknown` và Type Guard khi gặp dữ liệu không rõ kiểu.
*   **Tối ưu Re-render**:
    *   Chọn lọc các trường cụ thể từ Zustand store (ví dụ: `const isSidebarOpen = useAppStore(state => state.isSidebarOpen)` thay vì `const { isSidebarOpen } = useAppStore()`).
    *   Sử dụng `useMemo` và `useCallback` hợp lý khi truyền props phức tạp xuống component con.
