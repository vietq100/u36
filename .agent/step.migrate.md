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

### 2. Module: Properties/Project (Quản lý Dự án & Sơ đồ tầng)
- **Thời gian**: 2026-05-27
- **Trạng thái**: [x] Đã hoàn thành
- **Công việc thực hiện**:
  - Tạo thành phần UI Sheet (`src/components/ui/sheet.tsx`) dùng chung dạng slide-over. Tinh chỉnh overlay trong suốt hơn (`bg-black/30`), không làm mờ nền (no backdrop-blur) và nền SheetContent 80% trong suốt (`bg-background/80`).
  - Xây dựng component layout dùng chung `DetailSheet.tsx` (`src/components/shared/DetailSheet.tsx`) hỗ trợ chiều rộng 88% (`sm:max-w-[88vw]`), ẩn icon đóng X bên phải (`showCloseButton={false}`) và tự động đưa cụm nút Hủy / Lưu lên đầu trên `SheetHeader` để tăng độ tiện dụng khi thao tác.
  - Di chuyển và mở rộng schema validation Zod & kiểu dữ liệu Dự án (`src/features/properties/types/index.ts`) với hơn 40 trường thông tin chi tiết từ hệ thống cũ (chủ đầu tư, ngân hàng, lessor, legal representative, phí đỗ xe...).
  - Tích hợp API thực tế qua các React Query hooks sinh từ OpenAPI cho Company, Contact, Locations (Tỉnh/Thành, Quận/Huyện) và Category (Tiện ích dự án). Sắp xếp lại biểu mẫu sang dạng lưới 4 cột gọn gàng để khai thác không gian 88% rộng rãi. Tái cấu trúc `ProjectForm.tsx` bọc bằng component `DetailSheet` mới và loại bỏ các nút footer trùng lặp.
  - Tích hợp tính năng quản lý Sàn/Tầng (Floors) qua bảng chỉnh sửa trực tiếp (inline editable table) có hỗ trợ thêm, sửa, ngưng hoạt động tầng và đồng bộ API tương ứng thông qua component `ProjectFloorsTab.tsx`.
- **Kết quả xác minh**: Build hệ thống biên dịch thành công 100%, tích hợp hoạt động mượt mà.

### 3. Module: Properties/Unit (Căn hộ & Mặt bằng)
- **Thời gian**: 2026-05-27
- **Trạng thái**: [x] Đã hoàn thành
- **Công việc thực hiện**:
  - Di chuyển và mở rộng schema validation Zod (`unitSchema`) và kiểu dữ liệu `Unit` trong `src/features/properties/types/index.ts` để hỗ trợ đầy đủ 15+ trường chi tiết (Hướng, View, Tiện ích, Diện tích ban công, Đơn giá thuê mong muốn, v.v.).
  - Cập nhật hàm mapper API `mapUnitDto` trong `src/features/properties/hooks/useProperties.ts` để ánh xạ chính xác các trường mở rộng này từ DTO của backend.
  - Sửa lỗi static type trong mock store bằng cách bổ sung `floorId: 0` mặc định cho các mock units ban đầu.
  - Tái cấu trúc form chi tiết căn hộ `UnitForm.tsx` bọc bằng component `DetailSheet` mở rộng 88% chiều rộng, tự động thích ứng chế độ Sáng/Tối. Thiết kế bố cục 2 cột lớn (Core fields bên trái chiếm 3/5, Attributes/Facilities bên phải chiếm 2/5) giúp loại bỏ hoàn toàn thao tác cuộn trang dọc. Loại bỏ các nút lưu cũ dưới chân biểu mẫu.
  - Xây dựng cơ chế lựa chọn phân cấp (cascaded dropdowns) mượt mà:
    - Chọn Dự án -> Tải danh sách Tầng/Sàn của dự án đó.
    - Chọn Dự án -> Chọn Loại hình tài sản (Property Type) -> Chọn Loại căn hộ (Unit Type).
  - Tích hợp các Combobox tìm kiếm và API thực tế lấy danh mục hướng (Facing), tầm nhìn (View), tiện ích căn hộ (Unit Facilities) và trạng thái (Unit Status).
  - Nâng cấp `UnitList.tsx` để liên kết chính xác sự kiện click dòng / nút thêm để mở Sheet `UnitForm` kính mờ mới.
- **Kết quả xác minh**: Hệ thống biên dịch thành công 100%, hoàn toàn không có lỗi TypeScript hay CSS.

### 4. Module: Shared DetailDialog & Refactoring Centered Modals (Hộp thoại dùng chung & Tái cấu trúc Dialog ở giữa)
- **Thời gian**: 2026-05-27
- **Trạng thái**: [x] Đã hoàn thành
- **Công việc thực hiện**:
  - Thiết kế và phát triển component dùng chung `DetailDialog.tsx` (`src/components/shared/DetailDialog.tsx`) sử dụng màu nền đồng bộ trực tiếp theo các biến CSS root của hệ thống (`bg-background/80` và bổ sung thêm `dark:bg-background/80`). Việc bổ sung modifier `dark:` đảm bảo ghi đè thành công lớp màu nền tĩnh cũ (`dark:bg-black/40`) của component `DialogContent` gốc, giúp Dialog đồng bộ hoàn hảo theo theme của dự án ở cả hai chế độ.
  - Tích hợp phím Hủy / Lưu thay đổi lên `DialogHeader`, ẩn nút close X mặc định, tự động bind sự kiện submit thông qua thuộc tính `formId` của HTML5.
  - Thực hiện tái cấu trúc đồng bộ và nâng cấp giao diện cho 4 biểu mẫu lớn hiển thị dạng dialog ở giữa màn hình:
    1. `InquiryForm.tsx` (Yêu cầu hỗ trợ) với `formId="inquiry-form"`.
    2. `CompanyForm.tsx` (Doanh nghiệp đối tác) với `formId="company-form"`.
    3. `ContactForm.tsx` (Khách hàng / Liên hệ) với `formId="contact-form"`.
    4. `ContractForm.tsx` (Hợp đồng thuê) với `formId="contract-form"`.
  - Hỗ trợ linh hoạt cấu hình nút Lưu thông qua prop `saveLabel` (Ví dụ: "Ký Hợp đồng" / "Lưu thay đổi" tùy ngữ cảnh).
  - Sửa lỗi runtime crash của component `FileUploader.tsx` liên quan đến `TypeError: Right-hand side of 'instanceof' is not callable`. Lỗi này phát sinh do việc import icon `File` từ `lucide-react` đã ghi đè (shadowed) lên đối tượng DOM `File` mặc định của trình duyệt; đã khắc phục bằng cách đổi tên import thành `File as FileIcon`.
- **Kết quả xác minh**: Hệ thống biên dịch thành công 100%, các form hoạt động hoàn toàn mượt mà và trực quan.

---

## Hướng dẫn các bước tiếp theo
Khi bắt đầu di chuyển một module mới (ví dụ: `Clients`, `Properties`, `Contracts`,...):
1. Thảo luận và thống nhất về phương án thiết kế UI (kính mờ thích ứng) và cách liên kết dữ liệu API của module đó.
2. Thực hiện migration code của module đó.
3. Cập nhật thông tin chi tiết của module đó vào tài liệu này (không liệt kê trước các module chưa thực hiện).
