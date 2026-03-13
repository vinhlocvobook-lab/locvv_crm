# API REFERENCE - QMS v1.0

Tài liệu này định nghĩa các endpoint RESTful cho hệ thống QMS.

---

## 1. Quy tắc chung
- **Base URL:** `/api/v1`
- **Authentication:** Bearer JWT (Header: `Authorization: Bearer <token>`).
- **Media Type:** `application/json`
- **Response Success:**
  ```json
  { "success": true, "data": {}, "meta": { "total": 0 } }
  ```
- **Response Error:**
  ```json
  { "success": false, "error": { "code": "ERR_CODE", "message": "Mô tả lỗi" } }
  ```

---

## 2. Nhóm Auth (`/auth`)

### POST `/login`
- **Mô tả:** Đăng nhập và nhận token.
- **Body:** `{ "email": "...", "password": "..." }`
- **Response:** `{ "accessToken": "...", "refreshToken": "..." }`

### POST `/logout`
- **Mô tả:** Đăng xuất và hủy refresh token.
- **Header:** Required.

### POST `/refresh`
- **Mô tả:** Làm mới access token từ refresh token.
- **Body:** `{ "refreshToken": "..." }`

### POST `/change-password`
- **Mô tả:** Đổi mật khẩu người dùng hiện tại.
- **Body:** `{ "oldPassword": "...", "newPassword": "..." }`

---

## 3. Nhóm Super Admin (`/admin`)
*Dành riêng cho Super Admin quản trị nền tảng.*

### GET `/tenants`
- **Mô tả:** Danh sách các tenant trên hệ thống.
- **Query:** `page`, `limit`, `search`.

### POST `/tenants`
- **Mô tả:** Tạo mới một tenant (Onboarding).
- **Body:** `{ "name": "...", "slug": "...", "adminEmail": "..." }`

### PATCH `/tenants/:id/status`
- **Mô tả:** Kích hoạt hoặc vô hiệu hóa tenant.
- **Body:** `{ "status": "active" | "inactive" }`

---

## 4. Nhóm Users (`/users`)
*Dành cho Company Admin.*

### GET `/`
- **Mô tả:** Danh sách nhân viên trong tenant.
- **Required Role:** ADMIN.

### POST `/`
- **Mô tả:** Tạo mới nhân viên.
- **Body:** `{ "name": "...", "email": "...", "roleId": 1, "teamId": "..." }`

### DELETE `/:id`
- **Mô tả:** Xóa mềm nhân viên.

---

## 5. Nhóm Master Data (Customers, Suppliers, Products)

### `GET/POST/PUT/DELETE` cho các endpoint:
- `/customers`
- `/suppliers`
- `/products`

### Tính năng Import/Export:
- **POST `/customers/import`**: Tải lên file CSV/Excel.
- **GET `/customers/export`**: Tải về danh sách khách hàng.

---

## 6. Nhóm Quotes (`/quotes`) - CORE BUSINESS

### GET `/`
- **Mô tả:** Danh sách các yêu cầu báo giá của tenant.
- **Query:** `status`, `salesId`, `customerId`.

### POST `/`
- **Mô tả:** Tạo mới Quote Request. Trạng thái khởi tạo: `DRAFT`.
- **Body:** `{ "customerId": "...", "items": [{ "productId": "...", "quantity": 10 }] }`

### POST `/:id/submit`
- **Mô tả:** Sales gửi yêu cầu báo giá sang bộ phận Purchasing.
- **State Change:** `DRAFT` -> `REQUESTING_SUPPLIER_PRICE`.

### POST `/:id/supplier-quotes`
- **Mô tả:** Purchasing nhập giá từ nhà cung cấp.
- **Body:** `{ "supplierId": "...", "items": [{ "productId": "...", "price": 100 }] }`

### POST `/:id/submit-for-approval`
- **Mô tả:** Gửi yêu cầu lên Team Leader phê duyệt.
- **State Change:** `SUPPLIER_PRICE_COLLECTED` -> `WAITING_TL_APPROVAL`.

### POST `/:id/approve`
- **Mô tả:** Team Leader duyệt giá bán cuối cùng.
- **Body:** `{ "items": [{ "productId": "...", "finalPrice": 150 }] }`
- **Action:** Tạo **Snapshot** vào `quote_versions`.
- **State Change:** `WAITING_TL_APPROVAL` -> `APPROVED`.

### POST `/:id/reject`
- **Mô tả:** Team Leader từ chối, yêu cầu báo giá lại.
- **Body:** `{ "reason": "..." }`
- **State Change:** `WAITING_TL_APPROVAL` -> `REJECTED/NEGOTIATING`.

### POST `/:id/unable-to-fulfill`
- **Mô tả:** Đánh dấu không thể thực hiện báo giá.
- **State Change:** -> `UNABLE_TO_FULFILL`.

### POST `/:id/send-to-customer`
- **Mô tả:** Sales gửi email báo giá cho khách hàng.
- **Action:** Trigger `EmailService`.
- **State Change:** `APPROVED` -> `SENT_TO_CUSTOMER`.

### GET `/:id/versions`
- **Mô tả:** Xem lịch sử các phiên bản báo giá (Snapshots).

---

## 7. Nhóm Notifications (`/notifications`)

### GET `/`
- **Mô tả:** Danh sách thông báo của người dùng.
- **Query:** `unreadOnly=true`.

### PATCH `/read-all`
- **Mô tả:** Đánh dấu tất cả là đã đọc.

---

## 8. Codes Lỗi Thường Gặp
- `ERR_AUTH_UNAUTHORIZED`: Token không hợp lệ.
- `ERR_ROLE_FORBIDDEN`: Không có quyền thực hiện.
- `ERR_TENANT_INACTIVE`: Công ty đã bị khóa.
- `ERR_QUOTE_INVALID_TRANSITION`: Chuyển trạng thái báo giá sai quy tắc.
- `ERR_SLA_VIOLATED`: Hành động quá hạn SLA.
