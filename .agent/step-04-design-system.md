# Bước 4: Thiết lập Design System

**Mục tiêu**: Định nghĩa các tiêu chuẩn về UI (màu sắc, typography, khoảng cách) để toàn bộ dự án đồng nhất, sang trọng và dễ bảo trì. Tránh việc sử dụng các mã màu cứng (hardcode) trong component.

## 1. Hệ thống màu sắc (Color Palette)
Cấu hình màu sắc của shadcn/ui sử dụng HSL variables. Mở file `src/index.css` (hoặc `globals.css`) để thiết lập các biến CSS cho theme sáng và tối.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    /* Primary color (Ví dụ: Màu xanh thương hiệu) */
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    /* Secondary, Muted, Destructive, Card, Popover... (Theo chuẩn shadcn) */
    --radius: 0.5rem;
  }

  .dark {
    /* Khai báo biến cho Dark mode */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}
```

## 2. Typography (Fonts)
Nên sử dụng font chữ hiện đại (như Inter, Roboto, hoặc font đặc thù của PMH).
- Install font qua Google Fonts trong `index.html`.
- Cấu hình trong `tailwind.config.js`:

```javascript
import { fontFamily } from "tailwindcss/defaultTheme"

export default {
  // ...
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
}
```

## 3. Global CSS & Layout Utilities
- Định nghĩa các class tiện ích dùng chung (như custom scrollbar) vào `index.css`.
- Đảm bảo các component tuân thủ khoảng cách (`spacing`) của Tailwind mặc định (`p-4`, `m-2`, `gap-4`).

## 4. Hành động
- Cập nhật `src/index.css`.
- Cập nhật `tailwind.config.js` để khớp với biến CSS.
- Chạy thử để đảm bảo cấu hình theme thành công.
