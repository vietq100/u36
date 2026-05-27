# Kỹ năng và Tiêu chuẩn code (Skill) cho pmh_v2

File này định nghĩa các quy tắc lập trình, best practices và tiêu chuẩn mà mọi code trong dự án `pmh_v2` phải tuân thủ. Các Agent khi sinh code phải đọc kỹ file này và quy chuẩn chung tại [rule.md](./rule.md).

## 1. Công nghệ cốt lõi
- **Framework**: React 18+ với Vite.
- **Ngôn ngữ**: TypeScript (Strict mode). Luôn định nghĩa rõ ràng Type/Interface, hạn chế tối đa sử dụng `any`.
- **Styling**: Tailwind CSS kết hợp với UI components từ `shadcn/ui`.
- **State Management**:
  - **Server State** (Dữ liệu từ API): Sử dụng `TanStack Query` (React Query v5).
  - **Client State** (Dữ liệu cục bộ UI): Sử dụng `Zustand` (Global) hoặc `useState`/`useReducer` (Local).
- **Forms**: Luôn sử dụng `React Hook Form` kết hợp với `Zod` để validation.

## 2. Quy tắc đặt tên (Naming Conventions)
- **Files/Folders**: Sử dụng `kebab-case` cho tên thư mục và tên file thông thường (ví dụ: `auth-service.ts`, `button.tsx`).
- **Components**: Sử dụng `PascalCase` cho tên component React (ví dụ: `UserProfile.tsx`, `DataTable.tsx`).
- **Variables/Functions**: Sử dụng `camelCase`.
- **Constants**: Sử dụng `UPPER_SNAKE_CASE` cho hằng số không thay đổi.
- **Types/Interfaces**: Bắt đầu bằng chữ hoa `PascalCase` (không cần tiền tố `I` cho Interface, ví dụ: `User`, không phải `IUser`).

## 3. Kiến trúc và Cấu trúc thư mục
Tuân thủ **Feature-Based Architecture**:
- `src/features/`: Chứa các module nghiệp vụ. Mỗi feature tự đóng gói components, hooks, api, stores của riêng mình. Không import chéo giữa các features để tránh coupling.
- `src/shared/` hoặc `src/components/`: Chứa các UI components dùng chung (shadcn/ui).
- `src/api/`: Quản lý API Client độc lập (Orval generated code, hooks, transformers).
- `src/lib/`: Các cấu hình thư viện thứ 3 (axios, query-client).

## 4. UI và Styling (Tailwind + shadcn/ui)
- Tránh viết style inline (ví dụ: `style={{ color: 'red' }}`). Luôn dùng className của Tailwind.
- Khi cần gộp class, sử dụng hàm tiện ích `cn()` (được cấu hình sẵn bởi shadcn/ui từ `clsx` và `tailwind-merge`).
- Ưu tiên sử dụng các Design Tokens trong file `tailwind.config.js` thay vì dùng mã màu cứng (hardcode hex color).
- **Glassmorphism & Premium Aesthetic (Bắt buộc)**: Toàn bộ dự án phải duy trì giao diện tối giản, hiện đại và sang trọng, hỗ trợ linh hoạt cả giao diện Sáng (Light Mode) và Tối (Dark Mode) theo hệ thống:
  - **Containers/Cards**: Áp dụng hiệu ứng kính mờ (Frosted glass). Chế độ sáng sử dụng nền sáng mờ (`bg-card/45` kết hợp `backdrop-blur-xl`, viền tối mỏng `border-border/50` và shadow nhẹ). Chế độ tối sử dụng nền tối mờ (`bg-white/3 backdrop-blur-xl`, viền sáng mỏng `border-white/10` và shadow sâu).
  - **Typography**: Luôn dùng font **Inter** cho mọi văn bản. Màu chữ tự động điều chỉnh độ tương phản cao tương ứng theo theme sáng/tối để đảm bảo dễ đọc.
  - **Backgrounds**: Sử dụng các mảng màu gradient phát sáng (ambient blobs) dịu nhẹ ở dưới nền để tăng chiều sâu không gian (3D depth).
  - **Inputs & Controls**: Ô nhập liệu bo góc `rounded-xl`, nền mờ (`bg-muted/20` ở chế độ sáng, `bg-white/5` ở chế độ tối), viền trong suốt nhẹ, kèm line icons tinh tế (Lucide React). Nút bấm chính (CTA) sử dụng tương phản đảo ngược (`bg-foreground text-background hover:bg-foreground/90`) để tạo điểm nhấn mạnh mẽ trên cả hai chế độ.

## 5. Xử lý Form và Validation
- Mọi form phải được wrap bằng component `<Form>` của `shadcn/ui`.
- Khai báo schema validation bằng `Zod` trước. Dùng schema này để infer ra type của form data.
- Không tự quản lý form state bằng `useState`, hãy để `useForm` của React Hook Form lo liệu.

## 6. Gọi API (Data Fetching)
- Tuyệt đối không gọi `axios` trực tiếp trong component và lưu vào `useState`.
- Luôn sử dụng các custom hooks sinh ra bởi Orval (hoặc tự viết TanStack Query hooks).
- Xử lý Loading, Error, và Success states thông qua các property mà `useQuery`/`useMutation` trả về.
## 7. TanStack Query Conventions

- Query keys phải được quản lý tập trung theo factory pattern.
- Không hardcode query keys trực tiếp trong component.
- Mỗi feature cần có file `query-keys.ts`.

Ví dụ:
```typescript
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...userQueryKeys.all, 'detail', id] as const,
};
```

## 8. API Layer Conventions

- Không chỉnh sửa file generated bởi Orval.
- Generated code phải nằm trong `src/api/generated/`.
- Custom hooks hoặc transformers phải nằm ngoài generated folder.
- Không gọi API trực tiếp từ component.
- Không import axios trực tiếp ngoài `src/lib/axios.ts`.

Cấu trúc:
 
src/api/
├── client/
├── generated/
├── hooks/
├── transformers/
├── types/
└── utils/
 

## 9. Component Conventions

- Một component chỉ nên có một trách nhiệm chính.
- Tách container/business logic khỏi presentational UI nếu component phức tạp.
- Không viết component quá 300 dòng.
- Nếu component có nhiều logic:
  - tách hooks
  - tách schemas
  - tách constants
  - tách sub-components
- **Bắt buộc tái sử dụng Component**: Toàn bộ các trường nhập liệu (inputs), dropdowns, buttons, modals, cards, alerts,... đều PHẢI viết thành các component hoặc sử dụng lại từ các component dùng chung (`src/components/ui/` hoặc `src/components/shared/`). Tuyệt đối không tự viết thẻ HTML thô kèm Tailwind lặp đi lặp lại. Chi tiết xem tại [step-13-componentization-standards.md](./step-13-componentization-standards.md).

Ưu tiên:
- composition
- reusable component
- controlled props

## 10. Data Table Rules

- Sử dụng TanStack Table cho mọi data table phức tạp.
- Pagination/filter/sort phải hỗ trợ server-side.
- Filter state nên sync với URL search params.
- Không hardcode columns trong page component.
- Columns definition phải tách riêng.

Ví dụ:
tables/
├── user-table.tsx
├── user-columns.tsx
└── user-table-toolbar.tsx
 
## 11. Form Conventions

- Mỗi form phải có:
  - schema
  - defaultValues
  - submit handler
  - loading state
  - error handling

Cấu trúc:
forms/
├── user-form.tsx
├── user-form.schema.ts
└── user-form.types.ts
Validation business logic phải nằm trong Zod schema nếu có thể.
Reusable form field phải ưu tiên dùng.
Async select phải debounce request.

## 12. Zustand Rules

Zustand chỉ dùng cho:
- auth state
- theme
- sidebar state
- UI preferences
- temporary UI state

Không dùng Zustand cho:
- API response cache
- table data
- form data
- server state

## 13. Error Handling

- Mọi API mutation phải handle error rõ ràng bằng cách hiển thị thông báo lỗi (Toast).
- Toast message phải thống nhất: Sử dụng thư viện `sonner` (được shadcn/ui hỗ trợ) thông qua hàm `toast.error()` và `toast.success()`.
- Không sử dụng `alert()` hoặc console logs trên môi trường Production.
- Sử dụng Error Boundary (bọc bên ngoài các page/module lớn) để ngăn chặn crash toàn bộ ứng dụng và hiển thị UI fallback thân thiện.
- Log unexpected errors thông qua centralized logger (Sentry hoặc một custom logger class được định nghĩa tại `src/shared/utils/logger.ts`).
- Đối với các Form Validation Error trả về từ Server (thường là lỗi HTTP 422 hoặc 400), bắt lỗi và sử dụng `form.setError` từ React Hook Form để ánh xạ lỗi trực tiếp lên input tương ứng trên giao diện.

## 14. Routing & Layout Rules

- Sử dụng React Router v6 với kiến trúc Data Router (`createBrowserRouter`).
- Phân tách rõ ràng giữa `AuthLayout` (không sidebar) và `DashboardLayout` (có sidebar + header).
- Mọi trang (Pages) phải được tải chậm (Lazy load) sử dụng `React.lazy` và bọc trong `Suspense` với fallback UI thích hợp.
- Link điều hướng trong menu sử dụng component `NavLink` để tự động kích hoạt active class.

## 15. Performance Rules

- Sử dụng React Lazy Loading (`React.lazy` và `Suspense`) cho tất cả các trang ở mức Router Level để phân tách bundle nhỏ gọn.
- Không render danh sách hoặc bảng dữ liệu lớn (dataset > 100 dòng) mà không có virtualization (Sử dụng `@tanstack/react-virtual` hoặc thư viện tương đương).
- Memoize computations tốn kém bằng `useMemo`. Sử dụng `useCallback` cho các hàm callback được truyền xuống các component con được bọc bởi `React.memo` để tránh re-render không cần thiết.
- Tránh prop drilling sâu quá 3 cấp; ưu tiên sử dụng Zustand cho global client state, React Context cho cục bộ, hoặc thiết kế component theo dạng Composition.
- Sử dụng TanStack Query caching hợp lý: Cấu hình `staleTime` và `gcTime` (cacheTime) phù hợp cho từng API query, tránh fetch liên tục các dữ liệu ít thay đổi (master-data).
- Tránh re-render không cần thiết bằng cách select các trường cụ thể từ Zustand store (ví dụ: `const isSidebarOpen = useAppStore(state => state.isSidebarOpen)` thay vì `const { isSidebarOpen } = useAppStore()`).

## 16. Import Rules

Thứ tự import trong mọi file source code phải tuân thủ:
1. React/core libs (react, react-dom, v.v.)
2. Third-party libs (axios, zustand, react-hook-form, lucide-react, v.v.)
3. Shared libs/components dùng chung (`@/components/...`, `@/lib/...`, `@/utils/...`)
4. Feature imports (`@/features/feature-name/...`)
5. Relative imports (`./components`, `./hooks`, `./styles.css`)

- Sử dụng Path Alias (`@/`) đại diện cho thư mục `src/` (Đã cấu hình tại `tsconfig.json` và `vite.config.ts`). Không viết relative import quá xa (ví dụ: cấm dùng `../../../../components/button`).
- Không import chéo các file logic nội bộ giữa các features với nhau. Nếu feature A cần dùng code của feature B, feature B phải export code đó ra file `src/features/B/index.ts` (Public API của feature).

## 17. AI Agent Rules

ALWAYS:
- use TypeScript strict types
- use Orval generated hooks
- use React Hook Form + Zod
- use TanStack Query for server state
- use feature-based structure
- create reusable components
- extract constants and schemas
- handle loading/error states

NEVER:
- use `any`
- fetch data inside `useEffect`
- call axios directly inside component
- duplicate business logic
- mutate generated files
- store server state in Zustand
- hardcode query keys
- hardcode permissions
- create huge page components

## 18. Testing Standards

- **E2E Testing**: Sử dụng Playwright cho các bài test E2E kiểm tra toàn bộ luồng nghiệp vụ.
- **Unit & Component Testing**: Sử dụng `Vitest` kết hợp với `React Testing Library` để viết unit test cho các helpers/transformers và component test cho các shared components quan trọng.
- Các luồng quan trọng (Critical Flows) bắt buộc phải có kiểm thử tự động:
  - Luồng Login & Logout.
  - Luồng CRUD (Thêm, sửa, xóa danh mục hoặc dữ liệu cốt lõi).
  - Tìm kiếm, lọc và phân trang (Search, Filter, Pagination).
  - Phân quyền (hiển thị UI theo roles).
- Ưu tiên sử dụng test selectors theo tiêu chuẩn: `data-testid="..."`.
- Không phụ thuộc vào text hiển thị trên UI để test (ngoại trừ assertion cuối cùng), tránh việc test bị fail khi thay đổi ngôn ngữ hoặc copy/label.

## 19. File Upload Rules

- Các Component upload file (Drag & Drop, Single/Multi file) phải được đóng gói reusable tại `src/components/shared/FileUpload.tsx`.
- Luôn kiểm tra và validate định dạng file (Accept types) và kích thước file (Max size - ví dụ mặc định là 10MB) ở phía client trước khi gửi lên API Server.
- Không xử lý trực tiếp logic upload (gọi API Axios) bên trong trang nghiệp vụ; hãy sử dụng Custom Hook (ví dụ: `useUploadMutation` của TanStack Query).
- Luôn hiển thị tiến trình tải lên (Progress Bar) và trạng thái upload (thành công, thất bại, đang xử lý) một cách trực quan cho người dùng.

## 20. Date Handling Rules

- Sử dụng thư viện `date-fns` làm chuẩn xử lý ngày tháng duy nhất trong toàn bộ dự án.
- Tất cả việc định dạng ngày tháng (Format date, time, relative time) phải được tập trung tại file helper `src/shared/utils/date.ts`.
- Cấm format ngày tháng trực tiếp trong UI components bằng cách hardcode các chuỗi format (như `'dd/MM/yyyy'`). Hãy gọi các hàm helper đã định nghĩa sẵn.
- Xử lý timezone đồng bộ: Luôn chuyển ngày tháng về dạng chuẩn ISO 8601 UTC khi gửi lên backend và chỉ format sang múi giờ địa phương khi hiển thị cho người dùng.

## 21. Authentication & Authorization (RBAC)

- **Lưu trữ trạng thái Auth**: Sử dụng Zustand lưu trữ thông tin token và profile user toàn cục, tích hợp với middleware `persist` để tự động lưu vào `localStorage`.
- **Cấu hình API Interceptors**: Đảm bảo Axios Instance đọc token từ Auth Store để đính kèm tự động vào header `Authorization: Bearer <token>` trên mỗi request.
- **Xử lý Logout & Token Expired**: Nếu API trả về mã lỗi HTTP `401 Unauthorized`, interceptor phải tự động kích hoạt action `logout()` trong Auth Store để xóa dữ liệu lưu trữ và chuyển hướng người dùng về trang `/login`.
- **Bảo vệ Route (ProtectedRoute)**: Sử dụng component `ProtectedRoute` của `react-router-dom` bọc ngoài các trang nghiệp vụ để kiểm tra trạng thái xác thực (`isAuthenticated()`) và kiểm tra vai trò người dùng (`allowedRoles`).
- **Kiểm soát hiển thị giao diện (RBAC Component)**: Sử dụng component `<CanAccess role="ADMIN">` hoặc custom hook `const hasPermission = useAuthStore(state => state.hasRole('ADMIN'))` để ẩn/hiện các nút bấm hoặc chức năng nhạy cảm trên giao diện.

## 22. State Management Boundary

Để đảm bảo hiệu năng và dễ bảo trì, luồng quản lý trạng thái phải tuân thủ nghiêm ngặt ranh giới:
- **Server State**: Toàn bộ dữ liệu fetch từ API phải được quản lý bởi **TanStack Query** (Không lưu trữ cache của API vào Zustand hoặc Local State).
- **Global Client State**: Chỉ dùng **Zustand** cho các trạng thái cần chia sẻ ở mức ứng dụng và thay đổi xuyên suốt (Auth State, Theme Sáng/Tối, Sidebar đóng/mở, UI Preferences).
- **Local Client State**: Dùng `useState` hoặc `useReducer` cho các trạng thái cục bộ chỉ thuộc về một component duy nhất (ví dụ: dropdown mở/đóng, modal ẩn/hiện, filter tạm thời của form).
- **URL Search Params**: Mọi trạng thái hiển thị của Data Table như số trang (`page`), kích thước trang (`pageSize`), bộ lọc (`filters`), hay sắp xếp (`sorting`) phải được đồng bộ trực tiếp lên URL Search Params của trình duyệt. Điều này giúp hỗ trợ bookmark trang và chức năng quay lại (Back) của trình duyệt.

## 23. TypeScript Standards & Type Safety

- **TypeScript Strict Mode**: Luôn bật strict mode. Tuyệt đối không sử dụng kiểu dữ liệu `any`. Nếu gặp trường hợp dữ liệu không xác định từ API, sử dụng `unknown` và thực hiện Type Guard.
- **Type vs Interface**:
  - Ưu tiên dùng `interface` để định nghĩa cấu trúc dữ liệu, Models, và React Props (vì nó hỗ trợ kế thừa `extends` và merger declarations tốt hơn).
  - Sử dụng `type` để khai báo các kiểu Union, Tuple hoặc Utility types phức tạp.
- **React Component Types**:
  - Tránh gán kiểu chung chung `React.FC` hoặc `React.FunctionComponent`. Khai báo trực tiếp kiểu cho Props thông qua destructured arguments:
    ```typescript
    interface ButtonProps {
      label: string;
      onClick: () => void;
    }
    export function Button({ label, onClick }: ButtonProps) { ... }
    ```
- **API Mapping (Transformers)**: Không sử dụng trực tiếp Model trả về từ API trên giao diện nếu dữ liệu đó bị lồng nhau hoặc khác biệt về kiểu hiển thị. Viết các hàm transformer tại thư mục `src/api/transformers/` để map dữ liệu API sang Interface của Frontend.

## 24. Git & Commit Conventions

- **Quy tắc đặt tên nhánh (Branch Naming)**:
  - Tính năng mới: `feat/ten-tinh-nang` (ví dụ: `feat/login-screen`).
  - Sửa lỗi: `fix/ten-loi` (ví dụ: `fix/avatar-upload`).
  - Tối ưu hóa/Refactor: `refactor/ten-phan-viet-lai` (ví dụ: `refactor/properties-table`).
  - Tài liệu/Cấu hình: `chore/noi-dung` hoặc `docs/noi-dung`.
- **Commit Message Convention (Conventional Commits)**:
  - Định dạng: `<type>(<scope>): <description>` (ví dụ: `feat(auth): integrate zustand for auth persistence`).
  - Các `<type>` được phép sử dụng: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
  - Description viết ngắn gọn, súc tích bằng tiếng Anh hoặc tiếng Việt nhất quán.

## 25. Migration Rules

Dự án V2 thực hiện viết lại/refactor toàn bộ hệ thống cũ (`pmh-leasing`) sang stack công nghệ mới. Tuyệt đối không copy trực tiếp code từ V1 sang V2. Dưới đây là bảng ánh xạ và hướng dẫn chuyển đổi chi tiết:

| Khái niệm (V1 - Dự án cũ `pmh-leasing`) | Công nghệ/Pattern áp dụng ở V2 (`pmh_v2`) | Hướng dẫn chi tiết |
| :--- | :--- | :--- |
| **MobX Store** (Global/Feature) | **Zustand** (UI State) / **TanStack Query** (Server State) | Đập bỏ các MobX store. Cache dữ liệu từ API được giao hoàn toàn cho TanStack Query. State giao diện dùng Zustand. |
| **MobX Actions** / API calls | **TanStack Query Mutations** / **Zustand Actions** | Các tác vụ tạo, cập nhật, xóa dữ liệu sử dụng query mutation hooks. Các action thay đổi UI state viết trực tiếp trong Zustand store. |
| **Ant Design Components** (`antd`) | **shadcn/ui** + **Tailwind CSS** | Thiết kế lại UI theo style guide của `shadcn/ui`. Sử dụng Tailwind CSS cho layout và styling. Cấm sử dụng inline styles. |
| **antd Table** | **TanStack Table v8** (React Table) | Sử dụng component dùng chung `<DataTable>` kết hợp các cột định nghĩa riêng để hiển thị dữ liệu bảng, hỗ trợ phân trang và lọc server-side. |
| **antd Form** | **React Hook Form** + **Zod Schema** | Validate dữ liệu thông qua Zod schema, bọc các trường trong component `<Form>` của shadcn, bắt lỗi server và map qua `setError`. |
| **Axios direct calls** trong component | **Orval Generated Hooks** | Không viết logic gọi api thủ công trong component hay hooks riêng lẻ. Phải sử dụng API client do Orval sinh tự động. |

**Quy trình Migrate một Module nghiệp vụ:**
1. **Phân tích Database & Swagger API**: Kiểm tra các endpoint tương ứng có sẵn trên Swagger V2 hay chưa.
2. **Sinh API Code**: Chạy `npm run api:gen` để cập nhật các API Hooks tự động.
3. **Định nghĩa Schema**: Viết Zod Schema cho các Form thêm mới/chỉnh sửa dựa trên API Model.
4. **Xây dựng Trang danh sách (List Page)**: Tạo layout sử dụng `<PageHeader>`, `<DataTable>`, cấu hình columns và đồng bộ filters lên URL.
5. **Xây dựng Trang chi tiết/Form**: Tạo form sử dụng React Hook Form + shadcn/ui.
6. **Cấu hình định tuyến**: Đăng ký trang vào [src/routes/index.tsx](../src/routes/index.tsx).

## 26. Golden Rules

PRIORITY ORDER:
1. correctness
2. consistency
3. maintainability
4. reusability
5. performance

When generating code:
- Prefer simple solutions
- Avoid premature abstraction
- Avoid duplication
- Prefer composition over inheritance
- Prefer reusable patterns
- Follow existing architecture strictly