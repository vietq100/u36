# Bước 12: Cài đặt và cấu hình Testing (Playwright)

**Mục tiêu**: Đảm bảo chất lượng hệ thống bằng cách viết các bài kiểm thử End-to-End (E2E) tự động, giả lập thao tác của người dùng thực với trình duyệt.

## 1. Cài đặt Playwright
Sử dụng lệnh init của Playwright:
```bash
npm init playwright@latest
```
Trong quá trình cài đặt:
- Chọn TypeScript.
- Tên thư mục test: `tests/e2e` (hoặc để mặc định `tests`).
- Add a GitHub Actions workflow: Có thể chọn Yes nếu dùng CI/CD.
- Cài đặt trình duyệt: Yes.

## 2. Cấu hình Playwright
Chỉnh sửa file `playwright.config.ts` để cấu hình thư mục test và baseURL:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    // URL của ứng dụng local
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Có thể bật thêm firefox, webkit nếu cần
  ],
  // Tự động start server trước khi chạy test
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 3. Viết Test Case đầu tiên (Đăng nhập)
Tạo file `tests/e2e/auth.spec.ts` để test luồng đăng nhập:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Luồng xác thực (Authentication)', () => {
  test('Người dùng đăng nhập thành công', async ({ page }) => {
    // 1. Vào trang đăng nhập
    await page.goto('/login');

    // 2. Nhập thông tin
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');

    // 3. Click nút đăng nhập
    await page.click('button[type="submit"]');

    // 4. Kiểm tra điều hướng về trang chủ
    await expect(page).toHaveURL('/');
    
    // 5. Kiểm tra UI thay đổi (VD: Thấy tiêu đề Dashboard)
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('Hiển thị lỗi khi sai mật khẩu', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // 6. Kiểm tra thông báo lỗi hiển thị
    await expect(page.getByText('Email hoặc mật khẩu không chính xác')).toBeVisible();
  });
});
```

## 4. Chạy Test
- Chạy test có giao diện UI: `npx playwright test --ui`
- Chạy test ẩn (headless mode): `npx playwright test`
- Xem báo cáo (report): `npx playwright show-report`
