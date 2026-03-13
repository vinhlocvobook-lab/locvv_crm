# PRODUCT REQUIREMENT DOCUMENT (PRD) - QMS v1.0

**Tên dự án:** Quotation Management System (QMS)
**Mô hình:** SaaS Multi-tenant
**Ngôn ngữ:** Tiếng Việt (Technical terms in English)

---

## 1. Mục tiêu dự án
- **Tính minh bạch:** Theo dõi chính xác trạng thái của mọi yêu cầu báo giá.
- **Hiệu suất:** Tăng tốc độ báo giá thông qua tự động hóa (LLM, SLA tracking).
- **Tính chính xác:** So sánh giá nhà cung cấp và phê duyệt đa cấp để đảm bảo lợi nhuận tối ưu.
- **Lưu trữ tập trung:** Quản lý tập trung sản phẩm, khách hàng, nhà cung cấp và lịch sử báo giá.

---

## 2. User Journey (Hành trình người dùng)

### Sales
- Tạo yêu cầu báo giá (Quote Request) từ thông tin khách hàng.
- Có thể thêm sản phẩm từ Catalog hoặc tạo sản phẩm tạm thời.
- Theo dõi trạng thái báo giá realtime.
- Nhận thông báo khi báo giá được duyệt hoặc sắp hết hạn.
- Gửi báo giá cuối cùng cho khách hàng qua email từ hệ thống.

### Purchasing
- Nhận yêu cầu thu thập giá từ Sales.
- Liên hệ một hoặc nhiều Supplier để lấy giá.
- Nhập giá Supplier vào hệ thống (thủ công hoặc forward email - Phase 2).
- Thương lượng lại giá nếu Team Leader yêu cầu.

### Team Leader (TL)
- Xem bảng so sánh giá từ các Supplier khác nhau cho cùng một yêu cầu.
- Điều chỉnh giá bán (Selling Price) dựa trên giá vốn thu thập được.
- Phê duyệt hoặc từ chối (yêu cầu báo giá lại).
- Theo dõi SLA của đội ngũ.

### Company Admin
- Quản lý người dùng, phòng ban (Teams) và phân quyền nội bộ.
- Thiết lập cấu hình Tenant (Tiền tệ mặc định, VAT, SLA policy).

### Super Admin (Platform)
- **Tenant Management:** Khởi tạo, kích hoạt/vô hiệu hóa công ty (Tenant). Setup cấu hình ban đầu cho Tenant mới.
- **Platform User Management:** Quản lý tài khoản quản trị hệ thống.
- **Monitoring:** Giám sát hiệu năng hệ thống toàn bộ nền tảng, theo dõi lượng Quote Request và vi phạm SLA trên mức độ toàn cầu.
- **System Settings:** Quản lý Feature Flags, cập nhật các phiên bản hệ thống.
- **Support & Audit:** Truy cập Audit Logs toàn hệ thống để hỗ trợ kỹ thuật và bảo mật.

---

## 3. Quote State Machine (Sơ đồ trạng thái)

| Trạng thái | Điều kiện chuyển tiếp | Người thực hiện |
| :--- | :--- | :--- |
| **DRAFT** | Tạo mới yêu cầu | Sales |
| **REQUESTING_SUPPLIER_PRICE** | Gửi yêu cầu sang bộ phận Purchasing | Sales |
| **SUPPLIER_PRICE_COLLECTED** | Đã nhập ít nhất 1 giá từ Supplier | Purchasing |
| **WAITING_TL_APPROVAL** | Gửi yêu cầu phê duyệt cuối cùng | Purchasing |
| **APPROVED** | Team Leader chấp thuận giá bán | Team Leader |
| **REJECTED/NEGOTIATING** | TL không duyệt, yêu cầu tìm giá tốt hơn | Team Leader |
| **UNABLE_TO_FULFILL** | Không tìm được nhà cung cấp/giá phù hợp, kết thúc yêu cầu | Sales/TL |
| **SENT_TO_CUSTOMER** | Email báo giá đã gửi thành công | Sales |
| **CLOSED** | Khách hàng chấp nhận hoặc từ chối đơn hàng | Sales |
| **EXPIRED** | Hết thời gian hiệu lực của báo giá | System |
| **CANCELLED** | Huỷ yêu cầu | Sales/TL |

---

## 4. MoSCoW Prioritization

### Must Have (Cần thiết ngay - Phase 1)
- Multi-tenancy isolation (Shared DB + `tenant_id`).
- Quản lý User/Role/Permission cơ bản.
- Luồng Quote Request từ DRAFT -> SENT_TO_CUSTOMER.
- Quản lý phiên bản (v1, v2) cho báo giá (Snapshot).
- Dashboard cơ bản cho TL (Bottlenecks).
- Realtime notification & Notification Center nội bộ.
- **Email notification (SMTP/SendGrid/Resend):** Bắt buộc cho luồng SLA và gửi báo giá cho khách hàng.
- Import/Export Sản phẩm, Khách hàng, Supplier (CSV/Excel).
- Đa tiền tệ & VAT.
- **Local Storage:** Lưu trữ file đính kèm và PDF tại hệ thống file cục bộ.

### Should Have (Nên có)
- PDF Quote Generation.
- Lịch sử Audit Log chi tiết (Trình xem log).
- Quản lý hiệu lực báo giá và cảnh báo hết hạn.
- **Backup Policy:** Quy trình sao lưu định kỳ cho thư mục `/uploads`.

### Could Have (Có thể có - Phase 2)
- LLM Email Intake (Forward email để extract giá tự động).
- Chat thread nội bộ cho mỗi Quote Request.
- **Cloud Sync:** Đồng bộ hóa dữ liệu lên Google Drive / OneDrive.

### Won't Have (Chưa thực hiện)
- Portal cho khách hàng tự phục vụ (Self-service portal).

---

## 5. Chiến lược SLA (Best Practice Đề xuất)

SLA sẽ được tính theo **Giờ làm việc (Working Hours)** của công ty (Ví dụ: 8:00 - 17:00, nghỉ T7/CN).

| Bước quy trình | Thời gian SLA tiêu chuẩn | Hành động khi vi phạm |
| :--- | :--- | :--- |
| Sales -> Purchasing (Lấy giá) | 8 Working Hours | Cảnh báo TL & Purchasing |
| Purchasing -> TL (Phê duyệt) | 4 Working Hours | Cảnh báo TL |
| TL -> Sales (Gửi khách) | 8 Working Hours | Cảnh báo Sales & TL |

**Cơ chế Escalation:**
- **Warning (T-1h):** Gửi notification cho người thực hiện.
- **Violation (T=0):** Gửi notification cho người thực hiện + Quản lý trực tiếp.
- **Critical (T+4h):** Đánh dấu "High Priority" trên Dashboard của TL/Admin.

---

## 6. Thiết kế Cơ sở dữ liệu (Gợi ý Schema)

### Tables chi tiết:
- `tenants`: id, slug, name, settings (JSON), status, created_at, updated_at.
- `roles`: id, name, description, permissions (JSON).
- `teams`: id, tenant_id, name, leader_id, description.
- `users`: id, tenant_id, name, email, role_id, team_id, status.
- `customers`: id, tenant_id, name, email, phone, address, tax_code.
- `suppliers`: id, tenant_id, name, contact_person, email, phone, category.
- `products`: id, tenant_id, sku, name, unit, base_price, status (is_temporary).
- `quote_requests`: id, tenant_id, sales_id, customer_id, status, current_version, expiry_date, total_amount, currency.
- `quote_request_items`: id, quote_request_id, product_id, quantity, target_price.
- `quote_versions`: id, quote_request_id, version_number, snapshot_data (JSON), created_by, created_at. (Lưu snapshot tại các mốc APPROVED hoặc SENT).
- `supplier_quotes`: id, quote_request_id, supplier_id, purchasing_id, total_amount, currency, status.
- `supplier_quote_items`: id, supplier_quote_id, product_id, quantity, unit_price.
- `notifications`: id, tenant_id, user_id, type, content, is_read, metadata.
- `email_logs`: id, tenant_id, recipient, subject, body_preview, status (sent/failed), error_msg, sent_at.
- `audit_logs`: id, tenant_id, actor_id, entity_type, entity_id, action, timestamp, old_data, new_data.

---

## 7. LLM Provider Abstraction

Sử dụng **Adapter Pattern** để có thể switch giữa OpenAI, Gemini, Claude, Ollama.

```typescript
interface ILLMAdapter {
  extractSupplierQuote(emailContent: string): Promise<ExtractedQuoteData>;
}

class GeminiAdapter implements ILLMAdapter { ... }
class OpenAIAdapter implements ILLMAdapter { ... }
```

---

## 8. Quản lý Phiên bản & Hiệu lực (Versioning)

- **Trigger tạo phiên bản mới (Versioning):**
    - Thay đổi danh sách sản phẩm (thêm/bớt) sau khi yêu cầu đã ở trạng thái `WAITING_TL_APPROVAL`.
    - Thay đổi số lượng hoặc giá mục tiêu/giá bán sau khi đã được `APPROVED`.
    - Sau khi báo giá đã gửi cho khách hàng (`SENT_TO_CUSTOMER`) nhưng khách hàng yêu cầu điều chỉnh lại.
- **Không trigger phiên bản mới:**
    - Thay đổi trong giai đoạn `DRAFT`.
    - Cập nhật thông tin ghi chú (Comment), đính kèm file (Attachment) không ảnh hưởng đến giá trị báo giá.
    - Sửa lỗi chính tả hoặc mô tả sản phẩm (trừ khi làm thay đổi bản chất sản phẩm).
- **Snapshot:** Mỗi phiên bản sẽ lưu một bản snapshot JSON toàn bộ dữ liệu tại thời điểm đó để đảm bảo tính bất biến của lịch sử.
- **Hiệu lực (Expiry):** Mỗi `quote_request` sẽ có trường `expiry_date`.
- Một Job định kỳ (Cron job) sẽ quét các báo giá sắp hết hạn trong 24h tới để gửi email/notification "Renew Request" cho Sales/Purchasing.

---

## 9. Rủi ro & Khả năng mở rộng
- **Rủi ro:** Rò rỉ dữ liệu giữa các Tenant.
- **Giải pháp:** Sử dụng middleware kiểm tra `tenant_id` ở cấp độ truy vấn DB global.
- **Mở rộng:** Cấu trúc code theo module (DDD - Domain Driven Design) để dễ dàng tách thành microservices (Auth, Quote, Notification, AI) trong Phase 2.

---

## 10. Technology Stack (Chi tiết)

### Backend
- **Framework:** Node.js với **Express.js** (hoặc NestJS nếu dự án cần tính cấu trúc cao hơn).
- **Language:** TypeScript.
- **ORM:** **Prisma** (Hỗ trợ type-safe và migration mạnh mẽ).
- **Queue & Scheduler System:**
    - **Phase 1:** Sử dụng **node-cron** cho các tác vụ quét SLA định kỳ và **async/await** trực tiếp với Nodemailer cho việc gửi email.
    - **Phase 2:** Nâng cấp lên **Redis + BullMQ** khi cần xử lý AI email parsing (hỗ tợ retry, priority) hoặc khi tải hệ thống tăng cao.
    - **Yêu cầu kiến trúc:** Tách biệt `EmailService` và `SchedulerService` thành các layer độc lập ngay từ đầu (Abstract Class/Interface) để dễ dàng hoán đổi implementation mà không ảnh hưởng đến logic nghiệp vụ.

### Frontend
- **Framework:** **React** với TypeScript.
- **State Management:** **Redux Toolkit**
  
  **Redux Slices:**
  - `authSlice`: User session, JWT, permissions.
  - `uiSlice`: Sidebar, modal, theme, loading states.
  - `callSlice`: WebRTC call state machine, local/remote streams, peer connection state, mic/camera/speaker controls.
  - `notifSlice`: Notification badge count, unread count.
  
  *Lưu ý: Server state (API data) vẫn dùng TanStack Query — Redux chỉ quản lý Client State và WebRTC State.*

- **UI Library:** **Tailwind CSS + Shadcn UI** (Premium, hiện đại, dễ tùy biến).
- **Data Fetching:** **TanStack Query** (React Query) để quản lý cache và trạng thái server.

### Infrastructure & Others
- **Database:** MariaDB.
- **Realtime:** Socket.io.
- **File Storage:**
    - **Phase 1:** Sử dụng **Local Filesystem**. Cấu trúc thư mục: `/uploads/{tenant_slug}/{category}/` (ví dụ: `/uploads/company-a/suppliers/`).
    - **Phase 2:** Tích hợp **Cloud Sync** (Google Drive / OneDrive) thay vì S3.
    - **Yêu cầu kiến trúc:** Thiết kế `IStorageService` interface ngay từ Phase 1 để đảm bảo việc hoán đổi giữa Local, GDrive hoặc OneDrive sau này diễn ra dễ dàng.
    - **Backup:** Phải có chính sách sao lưu định kỳ (automated backup policy) cho thư mục `/uploads` được đề cập trong tài liệu triển khai.
- **Authentication:** JWT với cơ chế Refresh Token.
