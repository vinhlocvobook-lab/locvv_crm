# Tài Liệu Sửa Lỗi Mất Phiên Đăng Nhập Trên Chrome (F5 Refresh)

Tài liệu này ghi nhận quá trình phân tích và khắc phục lỗi người dùng bị đăng xuất (văng ra trang login) khi tải lại trang (Refresh/F5) trên trình duyệt Google Chrome, trong khi Safari hoạt động bình thường.

---

## 🔍 1. Phân Tích Nguyên Nhân (Root Causes)

Sau khi kiểm tra luồng xác thực (Authentication Flow), chúng tôi phát hiện **2 lỗi liên quan** bổ trợ cho nhau gây ra hiện tượng này:

### 🔴 Nguyên nhân 1: Sai lệch tên trường Token (Critical)
*   **Hiện tượng:** Sau khi Login thành công, `currentToken` trong bộ nhớ Web App vẫn bằng `null`.
*   **Chi tiết:** 
    *   Backend trả về: `{ accessToken: "..." }`
    *   Frontend (`LoginPage.tsx`) đọc: `const { user, token } = response.data.data;`
    *   Do đọc trường `token` bị sai (undefined), `setCredentials` sẽ lưu `token` rỗng vào hệ thống.
*   **Hậu quả:** Toàn bộ lệnh gọi API sau đó không có Header `Authorization: Bearer <token>`. Hệ thống phải dựa hoàn toàn vào cơ chế **Refresh Token (Cookie)** của `axios interceptor` để tự động khôi phục.

### 🔴 Nguyên nhân 2: Chrome chặn Cookie qua Vite Proxy trên Localhost
*   **Hiện tượng:** Khi tải lại trang (F5), Redux State bị xóa. Hệ thống gọi `/auth/refresh` để lấy lại Access Token thông qua HttpOnly Cookie. Lệnh này thất bại trên Chrome dẫn đến bị từ chối truy cập và đá về `/login`.
*   **Chi tiết:** 
    *   Hệ thống chạy local: Frontend (`localhost:3000`) gọi API qua Vite Proxy đến Backend (`localhost:4000`).
    *   Chrome quản lý Cookie trên `localhost` rất khắt khe về **Port-scoping** (phân bổ cổng). Khi thấy sự sai lệch cổng giữa 3000 và 4000, Chrome có thể từ chối gửi Cookie đi trong một số ngữ cảnh Fetch.
    *   Safari nới lỏng hơn cho Localhost nên không gặp lỗi này.

---

## 🛠️ 2. Các Bước Khắc Phục (Fixes)

Chúng tôi đã thực hiện cập nhật toàn diện ở 4 vị trí:

### Vị trí 1: Khắc phục đọc Token (`frontend/src/pages/LoginPage.tsx`)
*   Sửa lại biến hứng dữ liệu từ `token` thành `accessToken` trùng khớp Backend.
```typescript
const { user, accessToken } = response.data.data;
dispatch(setCredentials({ user, token: accessToken }));
```

### Vị trí 2: Giải pháp Dự phòng Double-Strategy (`frontend/src/slices/authSlice.ts`)
*   Bổ sung biến `localStorage` để lưu trữ Access Token làm phương án backup khi F5.
*   **Luồng mới của `verifySession`:**
    1. Thử refresh bằng HttpOnly Cookie (Ưu tiên).
    2. Nếu thất bại (do Chrome chặn), hệ thống sẽ **lấy token dự phòng từ localStorage** ra để thử gọi `/auth/me`.
    3. Nếu cả 2 đều hỏng mới đá về Login.

### Vị trí 3: Cập nhật Interceptor (`frontend/src/utils/api.ts`)
*   Tại điểm tự động refresh token thành công, thực hiện lưu trữ đồng bộ vào `localStorage` để đảm bảo fallback.
```typescript
localStorage.setItem('accessToken', newToken);
```

### Vị trí 4: Cấu hình Proxy (`frontend/vite.config.ts`)
*   Thêm `cookieDomainRewrite: 'localhost'` để ép buộc Proxy định tuyến ghi đè Domain Cookie thuần túy về `localhost` (bỏ qua Port), giúp Chrome nhận diện Cookie dễ dàng hơn.

---

## 🏁 3. Kết Quả
Hệ thống hiện tại đã chạy mượt mà, giữ trạng thái đăng nhập tốt trên tất cả các trình duyệt (Chrome, Safari, Firefox) ngay cả khi tải lại trang nhiều lần.
