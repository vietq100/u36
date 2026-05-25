# Bước 2: Setup Project cơ bản

**Mục tiêu**: Khởi tạo project React bằng Vite, cài đặt Tailwind CSS, shadcn/ui và cấu hình module aliases (`@/`).

## 1. Khởi tạo Vite
Chạy lệnh tạo dự án với React và TypeScript (SWC cho tốc độ build nhanh hơn):
```bash
npm create vite@latest . -- --template react-ts
npm install
```

## 2. Cài đặt Tailwind CSS
Cài đặt Tailwind và các phụ thuộc:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Cấu hình `tailwind.config.js` để quét các file source:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 3. Cấu hình Absolute Paths (Aliases)
Để import bằng `@/` thay vì `../../`, cấu hình `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
Và cập nhật `vite.config.ts` bằng cách cài đặt thư viện `path` và cấu hình resolve:
```bash
npm i -D @types/node
```
```typescript
import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

## 4. Khởi tạo shadcn/ui
Chạy lệnh CLI của shadcn để tự động cấu hình các biến CSS cơ bản và thiết lập thư mục components:
```bash
npx shadcn-ui@latest init
```
Trong quá trình init, chọn các tùy chọn phù hợp (CSS Variables: yes, Style: Default/New York, Base color: Slate, ...).

## 5. Kết quả mong đợi
- Lệnh `npm run dev` chạy thành công.
- Có thể import file thông qua `@/components/...`.
- Tailwind CSS hoạt động bình thường trên màn hình chính.
