# Bước 1: Thiết lập Kiến trúc Dự án (Architecture)

**Mục tiêu**: Định nghĩa rõ ràng kiến trúc mã nguồn và sự liên kết giữa các tầng trước khi bắt đầu code bất kỳ chức năng nào.

## 1. Cấu trúc thư mục tiêu chuẩn

Toàn bộ mã nguồn sẽ được đặt trong thư mục `src/`, tổ chức theo mô hình **Feature-Based** và **Clean Architecture** (ở phía frontend).

```text
src/
├── api/                  # API Layer độc lập (Orval sinh code ở đây)
│   ├── client/           # Cấu hình axios (interceptors, token handler)
│   ├── generated/        # File tự động sinh ra bởi Orval từ Swagger/OpenAPI
│   ├── hooks/            # Các custom Query hooks nếu Orval không cover hết
│   ├── transformers/     # Hàm map dữ liệu API -> Model Frontend
│   ├── types/            # Type definition cho API
│   └── utils/            # Hàm tiện ích xử lý lỗi API
├── assets/               # Hình ảnh, fonts tĩnh
├── components/           # UI Components dùng chung toàn dự án
│   ├── ui/               # Các component của shadcn/ui sinh ra
│   └── shared/           # Các component tự build (Ví dụ: Header, Sidebar dùng chung)
├── config/               # Cấu hình môi trường (env, routes constants)
├── features/             # (QUAN TRỌNG) Các module nghiệp vụ chính
│   ├── auth/             # Ví dụ module Auth
│   │   ├── api/          # API riêng cho Auth (nếu không dùng chung src/api)
│   │   ├── components/   # UI components chỉ dùng cho Auth (VD: LoginForm)
│   │   ├── hooks/        # React hooks chứa logic Auth
│   │   ├── stores/       # Zustand store cục bộ cho Auth
│   │   ├── utils/        # Hàm helper riêng cho Auth
│   │   └── index.ts      # Public API của feature Auth (chỉ export những gì cần)
│   ├── properties/       # Module quản lý bất động sản
│   └── clients/          # Module quản lý khách hàng
├── hooks/                # Global React hooks dùng chung (VD: useDebounce, useWindowSize)
├── layouts/              # Các layout chính của app (DashboardLayout, AuthLayout)
├── lib/                  # Tiện ích thư viện (VD: hàm `cn` của shadcn, queryClient)
├── routes/               # Cấu hình React Router
├── stores/               # Global Zustand stores (VD: useAppStore)
├── types/                # Global TypeScript types (không liên quan API)
└── utils/                # Global Helper functions (formatDate, currency formatting)
```

## 2. Quy tắc Phân ranh giới (Boundaries)

- **Các tính năng (Features) phải độc lập**: Một feature (ví dụ `properties`) không được phép import trực tiếp các file sâu bên trong một feature khác (ví dụ `clients`).
- Nếu feature `A` cần dùng chức năng của feature `B`, feature `B` phải export chức năng đó qua file `src/features/B/index.ts`. Tính năng đóng gói này giúp code không bị rối rắm như một mớ bòng bong (spaghetti code).

## 3. Kiến trúc Dữ liệu (Data Flow)

1. **View (UI)**: Nhận tương tác người dùng, gọi các actions từ Hooks/Stores.
2. **Hooks/Stores (Logic)**: Xử lý logic frontend hoặc gọi API hooks.
3. **API Hooks (TanStack Query)**: Giao tiếp với API Layer để gọi mạng, caching dữ liệu, và quản lý các trạng thái `isLoading`, `isError`.
4. **API Layer (Orval + Axios)**: Thực hiện gọi HTTP request thực tế.

## 4. Hành động cần thực hiện trong bước này
- Tạo khung thư mục trống theo đúng cấu trúc ở trên.
- Thiết lập file `index.ts` ở các thư mục quan trọng để chuẩn bị cho việc export.
