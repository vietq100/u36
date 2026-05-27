# Bước 13: Tiêu chuẩn và Tái sử dụng Component (Componentization Standards)

**Mục tiêu**: Đảm bảo toàn bộ các thành phần giao diện như input, dropdown, button, modal (dialog), card, alert/toast,... đều được đóng gói thành các component tái sử dụng và được gọi lại một cách nhất quán, tránh viết mã HTML thô với Tailwind tùy tiện.

---

## 1. Nguyên tắc cốt lõi (Core Principles)

1. **KHÔNG tự viết thẻ HTML thô** với CSS tùy tiện cho các phần tử cơ bản (như `<input>`, `<button>`, `<select>`, `<dialog>`, `<div>` đóng vai trò card).
2. **BẮT BUỘC sử dụng UI Primitives** (`src/components/ui/`) hoặc **Shared Components** (`src/components/shared/`).
3. **Tuân thủ thiết kế chung**: Các component dùng chung đã tích hợp sẵn phong cách **Glassmorphism, Premium Design, Light/Dark mode** và các hiệu ứng micro-animations. Việc viết đè style tùy tiện sẽ làm mất tính đồng nhất của hệ thống.

---

## 2. Phân loại và Hướng dẫn sử dụng các Component

### A. Các Component nhập liệu & Forms (`src/components/shared/forms/` & `src/components/ui/`)

Đối với các ô nhập liệu, danh sách lựa chọn trong Form (sử dụng `react-hook-form` + `zod`):

*   **`FormInput`** (`@/components/shared/forms/FormInput`):
    *   *Mục đích*: Bọc sẵn `<Input>`, nhãn (label), mô tả (description) và thông báo lỗi validation.
    *   *Cách dùng*:
        ```tsx
        <FormInput
          control={form.control}
          name="email"
          label="Email doanh nghiệp"
          placeholder="email@example.com"
          required
        />
        ```
*   **`Select` / `SelectItem`** (`@/components/ui/select`):
    *   *Mục đích*: Dropdown tùy chỉnh hỗ trợ tìm kiếm nội bộ (Client-side search) và hỗ trợ cả Light/Dark Mode.
    *   *Cách dùng*:
        ```tsx
        <Select onValueChange={field.onChange} value={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="1">Danh mục A</SelectItem>
            <SelectItem value="2">Danh mục B</SelectItem>
          </SelectContent>
        </Select>
        ```
*   **`Combobox`** (`@/components/shared/forms/Combobox`):
    *   *Mục đích*: Ô tìm kiếm và chọn giá trị từ danh sách lớn, tự động đóng gói trạng thái đóng/mở popover và input lọc.
*   **`RichTextEditor`** (`@/components/shared/forms/RichTextEditor`):
    *   *Mục đích*: Soạn thảo văn bản/ghi chú có định dạng.
*   **`FileUploader`** (`@/components/shared/forms/FileUploader`):
    *   *Mục đích*: Kéo thả và chọn file tải lên có giới hạn dung lượng/định dạng.

### B. Nút bấm (`src/components/ui/button.tsx`)

*   **`Button`**:
    *   *Mục đích*: Toàn bộ nút bấm trong hệ thống phải dùng component `Button` với các `variant` và `size` định nghĩa sẵn.
    *   *Các Variant*: `default`, `accent`, `outline`, `secondary`, `ghost`, `destructive`, `link`.
    *   *Cách dùng*:
        ```tsx
        // Nút chính (CTA)
        <Button type="submit">Lưu thay đổi</Button>
        
        // Nút hủy/phụ
        <Button variant="outline" onClick={onClose}>Hủy</Button>
        ```

### C. Hộp thoại & Popups (`src/components/ui/dialog.tsx` & `src/components/shared/ConfirmDialog.tsx`)

*   **`Dialog`** (`@/components/ui/dialog`):
    *   *Mục đích*: Dùng để chứa form chỉnh sửa, thêm mới hoặc thông tin chi tiết. Đóng gói sẵn hiệu ứng làm mờ nền (backdrop blur).
*   **`ConfirmDialog`** (`@/components/shared/ConfirmDialog`):
    *   *Mục đích*: Hộp thoại xác nhận thao tác nhanh (như xóa dữ liệu, hủy bỏ thay đổi). **Cấm tự code lại Dialog cho mục đích xác nhận.**
    *   *Cách dùng*:
        ```tsx
        <ConfirmDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          title="Xác nhận xóa"
          description="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?"
          onConfirm={handleDelete}
          variant="destructive"
        />
        ```

### D. Thẻ chứa thông tin (`src/components/ui/card.tsx`)

*   **`Card`**:
    *   *Mục đích*: Gom nhóm thông tin trên dashboard hoặc trang quản trị.
    *   *Cách dùng*: Sử dụng các sub-components đi kèm như `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
        ```tsx
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan</CardTitle>
            <CardDescription>Số liệu thống kê tháng này</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Nội dung */}
          </CardContent>
        </Card>
        ```

### E. Cảnh báo và Thông báo (Alerts & Toasts)

*   **`Sonner (Toast)`** (`@/components/ui/sonner`):
    *   *Mục đích*: Hiển thị thông báo trạng thái hành động nhanh (thành công, thất bại, cảnh báo).
    *   *Cách dùng*: Import trực tiếp `toast` từ `sonner`.
        ```tsx
        toast.success("Thao tác thành công!");
        toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
        ```

---

## 3. Quy trình khi cần tạo UI Element mới

Nếu trên giao diện xuất hiện một kiểu UI element mới chưa có sẵn trong `src/components/ui/` hoặc `src/components/shared/`:

1.  **Bước 1**: Tìm kiếm trên tài liệu thư viện `shadcn/ui` xem có component tương ứng hay không.
2.  **Bước 2**: Chạy lệnh `npx shadcn-ui@latest add <component_name>` để cài đặt component thô vào `src/components/ui/`.
3.  **Bước 3**: Custom lại component đó tại thư mục `src/components/ui/` để tuân thủ phong cách thiết kế chung (bo góc `rounded-xl`, nền mờ glassmorphism, màu sắc tương thích light/dark mode của dự án).
4.  **Bước 4**: Export component tại `src/components/index.ts` (nếu là shared component) để dễ dàng import và tái sử dụng ở mọi trang.
