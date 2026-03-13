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
- Quản lý tất cả Tenant (Onboarding/Offboarding).
- Giám sát sức khỏe hệ thống và lưu lượng sử dụng.

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
- Quản lý phiên bản (v1, v2) cho báo giá.
- Dashboard cơ bản cho TL (Bottlenecks).
- Realtime notification & Notification Center nội bộ.
- Import/Export Sản phẩm, Khách hàng, Supplier (CSV/Excel).
- Đa tiền tệ & VAT.

### Should Have (Nên có)
- Email notification (SMTP integration).
- PDF Quote Generation.
- Lịch sử Audit Log chi tiết (Trình xem log).
- Quản lý hiệu lực báo giá và cảnh báo hết hạn.

### Could Have (Có thể có - Phase 2)
- LLM Email Intake (Forward email để extract giá tự động).
- Chat thread nội bộ cho mỗi Quote Request.
- S3 Storage integration.

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

### Tables chính:
- `tenants`: id, slug, name, settings (JSON), status.
- `users`: id, tenant_id, name, email, role_id, team_id.
- `products`: id, tenant_id, sku, name, unit, base_price, status (is_temporary).
- `quote_requests`: id, tenant_id, sales_id, status, version_number, expiry_date, total_amount, currency.
- `quote_request_items`: id, quote_id, product_id, quantity, target_price.
- `supplier_quotes`: id, quote_id, supplier_id, purchasing_id, total_amount, currency, status.
- `supplier_quote_items`: id, supplier_quote_id, product_id, quantity, unit_price.
- `notifications`: id, tenant_id, user_id, type, content, is_read, metadata.
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

- Mỗi khi có sự thay đổi lớn trong cấu trúc giá hoặc sản phẩm sau khi đã sang bước tiếp theo, hệ thống sẽ tạo một phiên bản mới (v2, v3).
- **Hiệu lực (Expiry):** Mỗi `quote_request` sẽ có trường `expiry_date`.
- Một Job định kỳ (Cron job) sẽ quét các báo giá sắp hết hạn trong 24h tới để gửi email/notification "Renew Request" cho Sales/Purchasing.

---

## 9. Rủi ro & Khả năng mở rộng
- **Rủi ro:** Rò rỉ dữ liệu giữa các Tenant.
- **Giải pháp:** Sử dụng middleware kiểm tra `tenant_id` ở cấp độ truy vấn DB global.
- **Mở rộng:** Cấu trúc code theo module (DDD - Domain Driven Design) để dễ dàng tách thành microservices (Auth, Quote, Notification, AI) trong Phase 2.
