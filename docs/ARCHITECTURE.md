# SYSTEM ARCHITECTURE - QMS

Tài liệu này mô tả kiến trúc kỹ thuật chi tiết của hệ thống Quotation Management System (QMS).

---

## 1. Tổng quan kiến trúc hệ thống
- **Kiến trúc:** Monolith Module-based (Phase 1).
- **Lý do chọn:** 
    - Giảm thiểu độ phức tạp trong việc triển khai và quản lý cơ sở hạ tầng ở giai đoạn đầu.
    - Dễ dàng chia sẻ codebase và các kiểu dữ liệu (TypeScript types) giữa các module.
    - Đội ngũ quy mô nhỏ có thể phát triển và deploy nhanh hơn.
- **Roadmap Phase 2:** Khi quy mô người dùng tăng lên, các module sẽ được tách thành Microservices độc lập:
    - **Auth Service:** Quản lý định danh và phiên làm việc.
    - **Quote Service:** Core logic về báo giá và phiên bản.
    - **Notification Service:** Xử lý Email, Realtime và trung tâm thông báo.
    - **LLM Processing Service:** Xử lý tác vụ AI nặng (Python/Node).

---

## 2. Sơ đồ kiến trúc tổng thể

```text
+-----------------------------------------------------------+
|                      CLIENT LAYER                         |
|      (React SPA / Mobile Web / Excel Connectors)          |
+----------------------------+------------------------------+
                             | HTTPS / WSS
                             v
+----------------------------+------------------------------+
|                      GATEWAY LAYER                        |
|        (Nginx Reverse Proxy / SSL Termination)            |
+----------------------------+------------------------------+
                             |
                             v
+----------------------------+------------------------------+
|                   BACKEND APPLICATION                     |
|      +---------------------------------------------+      |
|      |               API v1 Router                 |      |
|      +---------------------------------------------+      |
|      |        Middleware Chain (Auth, Tenant)      |      |
|      +---------------------------------------------+      |
|      |    Modules (Quote, User, Product, etc.)     |      |
|      +---------------------------------------------+      |
|      |   Services Layer (Abstracted Interfaces)    |      |
|      +---------------------------------------------+      |
+-------------+--------------+---------------+--------------+
              |              |               |
              v              v               v
+-------------+---+   +------+------+   +----+-------+
|    MARIADB      |   |  LOCAL FS    |   | NODE-CRON   |
| (Tenant Data)   |   | (/uploads)   |   | (SLA/Email) |
+-----------------+   +--------------+   +-------------+
```

---

## 3. Cấu trúc thư mục chi tiết

### Backend
```text
/backend
  /src
    /modules
      /auth          # Đăng nhập, JWT, RBAC
      /tenant        # Quản lý công ty, settings
      /user          # Quản lý nhân viên
      /customer      # Danh mục khách hàng
      /supplier      # Danh mục nhà cung cấp
      /product       # Danh mục sản phẩm (Catalog)
      /quote         # Core: Requests, Items, Versions
      /notification  # Realtime & Notification Center
      /storage       # IStorageService, Local/Cloud
      /email         # IEmailService, SMTP/Vendor
      /audit         # Logs hoạt động hệ thống
      /llm           # ILLMAdapter, Gemini/OpenAI
    /shared
      /middlewares   # global (Auth, Tenant, Logger)
      /types         # Common TS interfaces
      /utils         # Helpers (String, Date, Currency)
      /constants     # Enums, Config constants
    /config          # App & Database config
    /database        # Prisma Client, Seeders, Migrations
```

### Frontend
```text
/frontend
  /src
    /pages           # Auth, Dashboard, Quotes, Settings
    /components      # UI Atoms, Molecules, Organisms
    /layouts         # AuthLayout, TenantLayout, AdminLayout
    /hooks           # Custom hooks (useQuotes, useAuth)
    /services        # API Client (Axios/Fetch wrappers)
    /store           # Redux store configuration
      /slices
        authSlice.ts      → Session, JWT, role
        uiSlice.ts        → Sidebar, modal, theme
        callSlice.ts      → WebRTC state machine
        notifSlice.ts     → Notification counters
      store.ts            → Redux store configuration
      hooks.ts            → useAppDispatch, useAppSelector
    /utils           # Formatting, Validators
```

---

## 4. API Design Overview
- **Versioning:** `/api/v1/...`
- **Super Admin routes:** `/api/v1/admin/...` (Middleware xác thực admin riêng, bám sát quản trị platform).
- **Tenant routes:** `/api/v1/...` (Sử dụng Tenant Middleware để lọc dữ liệu).
- **Naming:** RESTful (e.g., `GET /quotes`, `POST /quotes/:id/approve`).
- **Response format:**
  ```json
  { "success": true, "data": { ... }, "meta": { "total": 100 } }
  ```
- **Error format:**
  ```json
  { "success": false, "error": { "code": "ERR_QUOTE_NOT_FOUND", "message": "..." } }
  ```

---

## 5. Request Flow
1. **Client** (HTTPS)
2. **Rate Limiter** (Chặn spam)
3. **Auth Middleware** (Verify JWT, decode user payload)
4. **Tenant Middleware** (Verify `tenant_id` từ JWT, check status tenant)
5. **Request Validator** (Sử dụng Zod/Joi để kiểm tra schema body)
6. **Controller** (Điều hướng request)
7. **Service** (Thực hiện Business Logic chính)
8. **Repository** (Truy vấn qua Prisma)
9. **Database** (MariaDB thực thi)

---

## 6. Authentication Architecture
- **Cơ chế:** JWT Access Token (ngắn hạn) + Refresh Token (dài hạn).
- **Payload:** `{ uid: string, tid: string, role: string, team: string }`.
- **Security:** Refresh token lưu trong HttpOnly Cookie. Access token lưu trong bộ nhớ (Memory) hoặc State.

---

## 7. Multi-Tenant Enforcement Strategy
- **Resolution:** `tenant_id` luôn được trích xuất từ JWT của User. Không bao giờ nhận `tenant_id` từ Body/Query của Client cho các dữ liệu nhạy cảm.
- **Injection:** Middleware tự động gán `req.tenantId` cho các Request sau đó.
- **Filtering:** Global filter trong Prisma hoặc Repository layer: `where: { tenant_id: req.tenantId }`.
- **Index:** Mọi bảng đều có Composite Index `(tenant_id, id)`.
- **Data Leakage:** Kiểm tra định kỳ bằng Unit Test để đảm bảo query không bao giờ thiếu `tenant_id`.

---

## 8. Socket.io Architecture
- **Namespace:** Sử dụng default namespace hoặc `/quotes`.
- **Phạm vi sử dụng:** 
    - Thông báo trạng thái báo giá realtime.
    - Cảnh báo vi phạm SLA.
    - Chat thread nội bộ (internal comments).
    - **Lưu ý:** KHÔNG dùng Socket.io cho tín hiệu cuộc gọi (signaling) nếu sử dụng SIP trực tiếp.
- **Room structure:**
    - `tenant:{tenant_id}`: Thông báo chung toàn công ty.
    - `quote:{quote_id}`: Chat thread và cập nhật trạng thái riêng của từng báo giá.
- **Events:** `quote.created`, `quote.status_changed`, `sla.violation`, `internal_comment.new`.

---

## 9. LLM Service Layer
- **Pattern:** Adapter Pattern + Factory.
- **Abstraction:** `ILLMAdapter` định nghĩa các hàm: `extractFromEmail`, `extractFromImage`.
- **Implementation:** `GeminiAdapter`, `OpenAIAdapter`, v.v.
- **Per-Tenant Config:** Metadata của Tenant lưu Provider và API Key (được mã hóa). Factory sẽ khởi tạo instance dựa trên cấu hình này:
  ```typescript
  const provider = LLMFactory.create(tenant.provider, decrypt(tenant.apiKey));
  ```

---

## 10. Storage Service Layer
- **Pattern:** Interface-based.
- **Phase 1 (LocalStorageService):** Lưu tại `/uploads/{tenant_slug}/{category}/`.
- **Phase 2 (CloudSyncService):** Cung cấp các adapter cho Google Drive / OneDrive.
- **Mục tiêu:** Business logic chỉ gọi `storageService.upload(file)` mà không cần quan tâm file nằm ở đâu.

---

## 11. Background Jobs
- **Node-cron (Phase 1):**
    - **SLA Scanner:** Chạy mỗi 10 phút, tìm các Quote quá hạn, cập nhật DB và phát Notification.
    - **Expiry Scanner:** Chạy 1 lần/ngày, thông báo các Quote sắp hết hiệu lực.
    - **Email Dispatcher:** Gửi email từ hàng đợi tạm thời (memory/db).
- **Phase 2:** Thay bằng **BullMQ** để hỗ trợ retry, concurrency và observability.

---

## 12. Caching Strategy (Future)
- **Redis:** 
    - Lưu trữ danh sách Role/Permissions để tránh truy vấn DB mỗi request.
    - Rate limiting cho API.
    - Cache dữ liệu Product Catalog cho các Tenant có lượng sản phẩm lớn.

---

## 13. VoIP / SIP Architecture (Phase 2)

### Tổng quan
Hệ thống sẽ tích hợp với tổng đài **Asterisk PBX** thông qua giao thức **SIP over WebSocket**. Người dùng sẽ thực hiện cuộc gọi trực tiếp từ trình duyệt bằng công nghệ **WebRTC**.

### Call State Machine
IDLE → REGISTERING → REGISTERED → CALLING → RINGING → CONNECTED → ON_HOLD → ENDED / FAILED

### Công nghệ
- **JsSIP hoặc Sip.js:** Thư viện client-side để xử lý giao thức SIP trên trình duyệt.
- **WebRTC API:** Truyền tải media (âm thanh) trực tiếp giữa trình duyệt và Asterisk.
- **Asterisk (WSS):** Tổng đài đóng vai trò SIP Server, hỗ trợ WebSocket Secure (WSS) để nhận tín hiệu từ Web client.

### Redux callSlice quản lý
- `registrationStatus`: Trạng thái đăng ký với tổng đài SIP (Registered/Unregistered).
- `callState`: Trạng thái máy trạng thái cuộc gọi.
- `localStream` / `remoteStream`: Quản lý luồng âm thanh.
- `activeCall`: Thông tin cuộc gọi hiện tại (số điện thoại, thời lượng).

### Luồng tín hiệu (SIP Flow)
1. **Register:** Client (JsSIP) gửi `REGISTER` message tới Asterisk qua WSS.
2. **Invite:** Client gửi `INVITE` message để bắt đầu cuộc gọi.
3. **Signaling:** Asterisk trao đổi các bản tin SIP chuẩn (100 Trying, 180 Ringing, 200 OK).
4. **Media:** Sau khi handshake thành công, luồng RTP (âm thanh) được truyền qua WebRTC.

### Lưu ý tích hợp
- **Security:** Thông tin tài khoản SIP (Extension/Secret) của mỗi User cần được quản lý bảo mật.
- **NAT:** Asterisk cần được cấu hình đúng về ICE/STUN/TURN để hỗ trợ người dùng từ nhiều mạng khác nhau.
- **Lịch sử cuộc gọi:** Hệ thống sẽ đồng bộ Call Logs từ Asterisk (CDR) về bảng `call_logs` của từng Tenant.
