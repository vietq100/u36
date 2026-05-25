# Bước 7: Chiến lược Form (Form Pattern)

**Mục tiêu**: Xử lý toàn bộ logic nhập liệu, validate dữ liệu đồng bộ và thống nhất bằng React Hook Form (RHF) và Zod.

## 1. Cài đặt thư viện
```bash
npm install react-hook-form @hookform/resolvers zod
```

## 2. Tiêu chuẩn khai báo Form
Mỗi form đều phải bắt đầu bằng việc định nghĩa Zod Schema để đảm bảo Type Safety.

Ví dụ tạo Form Tạo Khách hàng (`src/features/clients/components/ClientForm.tsx`):
```tsx
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// 1. Định nghĩa Schema
const clientSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phoneNumber: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export function ClientForm({ onSubmit, defaultValues }) {
  // 2. Khởi tạo useForm
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultValues || { fullName: "", email: "" },
  });

  // 3. Render Form sử dụng shadcn/ui Form components
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Từng trường nhập liệu */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và Tên</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên..." {...field} />
              </FormControl>
              <FormMessage /> {/* Tự động hiển thị lỗi từ Zod */}
            </FormItem>
          )}
        />
        
        {/* ... các trường khác ... */}
        
        <Button type="submit">Lưu khách hàng</Button>
      </form>
    </Form>
  );
}
```

## 3. Tạo Reusable Form Fields (Tùy chọn nâng cao)
Thay vì viết lặp lại cụm `FormField > FormItem > FormLabel > FormControl`, hãy tạo các custom wrapper như `<FormInput>`, `<FormSelect>`, `<FormDatePicker>` trong `src/components/shared/forms/` để truyền trực tiếp tên trường (`name`) và nhãn (`label`), giúp code form ngắn gọn hơn gấp nhiều lần.

## 4. Xử lý Lỗi từ Server (Server Validation Errors)
Khi API trả về lỗi (ví dụ HTTP 422 - Validation Error), bắt lỗi trong hàm `onError` của mutation và sử dụng hàm `form.setError()` để map lỗi trả về từ server vào đúng field tương ứng trên UI.
