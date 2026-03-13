# DATABASE DESIGN - QMS

Tài liệu này chi tiết cấu trúc cơ sở dữ liệu MariaDB cho hệ thống QMS.

---

## 1. Entity Relationship Diagram (ERD)

```text
tenants (1) <--- (N) users
tenants (1) <--- (N) customers
tenants (1) <--- (N) suppliers
tenants (1) <--- (N) products

roles (1) <--- (N) users
teams (1) <--- (N) users

quote_requests (1) <--- (N) quote_request_items
quote_requests (1) <--- (N) quote_versions
quote_requests (1) <--- (N) supplier_quotes
quote_requests (1) <--- (N) attachments

supplier_quotes (1) <--- (N) supplier_quote_items

users (1) <--- (N) notifications
tenants (1) <--- (N) audit_logs
tenants (1) <--- (N) email_logs
```

---

## 2. Danh sách bảng

| Nhóm | Tên bảng | Ghi chú |
| :--- | :--- | :--- |
| **System** | `tenants`, `roles`, `teams`, `users` | Cấu trúc tổ chức và phân quyền |
| **Master Data** | `customers`, `suppliers`, `products` | Dữ liệu danh mục của từng Tenant |
| **Core Business** | `quote_requests`, `quote_request_items`, `quote_versions` | Quy trình báo giá chính |
| **Procurement** | `supplier_quotes`, `supplier_quote_items` | Thu thập giá từ nhà cung cấp |
| **Log & Support** | `notifications`, `audit_logs`, `email_logs`, `attachments` | Theo dõi và tệp tin |

---

## 3. Schema chi tiết từng bảng

### 3.1. System Tables

#### `tenants`
- `id`: UUID (PK)
- `slug`: VARCHAR(50) (Unique, Index) - định danh cho URL
- `name`: VARCHAR(255)
- `settings`: JSON (Lưu cấu hình: currency, VAT default, SLA policy)
- `llm_provider`: VARCHAR(50)
- `llm_api_key`: TEXT (**Encrypted at rest**)
- `status`: ENUM('active', 'inactive', 'suspended')
- `created_at`, `updated_at`, `deleted_at`

#### `roles`
- `id`: INT (PK, AI)
- `name`: VARCHAR(50) (e.g., 'SALES', 'PURCHASING', 'TL', 'ADMIN')
- `permissions`: JSON (e.g., `["quote:create", "quote:approve"]`)

#### `teams`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `name`: VARCHAR(100)
- `leader_id`: UUID (FK to `users`)

#### `users`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `role_id`: INT (FK)
- `team_id`: UUID (FK, Nullable)
- `email`: VARCHAR(255) (Unique per tenant)
- `password`: VARCHAR(255) (**Bcrypt hash**)
- `name`: VARCHAR(255)
- `status`: ENUM('active', 'inactive')
- `created_at`, `updated_at`, `deleted_at`

### 3.2. Master Data Tables

#### `customers` & `suppliers`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `name`, `email`, `phone`, `address`, `tax_code`
- `created_at`, `updated_at`, `deleted_at`

#### `products`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `sku`: VARCHAR(100)
- `name`: VARCHAR(255)
- `unit`: VARCHAR(50)
- `base_price`: DECIMAL(15, 2)
- `is_temporary`: BOOLEAN (Default 0)
- `created_at`, `updated_at`, `deleted_at`

### 3.3. Core Business Tables

#### `quote_requests`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `sales_id`: UUID (FK)
- `customer_id`: UUID (FK)
- `status`: VARCHAR(50) (DRAFT, APPROVED, etc.)
- `current_version`: INT (Default 1)
- `expiry_date`: DATETIME
- `total_amount`: DECIMAL(15, 2)
- `currency`: VARCHAR(3)
- `sla_deadline`: DATETIME (Dựa trên bước hiện tại)
- `created_at`, `updated_at`, `deleted_at`

#### `quote_request_items`
- `id`: UUID (PK)
- `quote_request_id`: UUID (FK)
- `product_id`: UUID (FK)
- `quantity`: DECIMAL(15, 2)
- `target_price`: DECIMAL(15, 2)
- `final_price`: DECIMAL(15, 2) (Giá chốt sau cùng)

#### `quote_versions`
- `id`: UUID (PK)
- `quote_request_id`: UUID (FK)
- `version_number`: INT
- `snapshot_data`: JSON (Lưu toàn bộ state của Quote items + Supplier prices)
- `created_by`: UUID (FK)
- `created_at`: DATETIME

### 3.4. Procurement Tables

#### `supplier_quotes`
- `id`: UUID (PK)
- `quote_request_id`: UUID (FK)
- `supplier_id`: UUID (FK)
- `purchasing_id`: UUID (FK)
- `total_amount`: DECIMAL(15, 2)
- `currency`: VARCHAR(3)
- `status`: VARCHAR(50)
- `created_at`

#### `supplier_quote_items`
- `id`: UUID (PK)
- `supplier_quote_id`: UUID (FK)
- `product_id`: UUID (FK)
- `quantity`: DECIMAL(15, 2)
- `unit_price`: DECIMAL(15, 2)

### 3.5. Log & File Tables

#### `notifications` (tenant_id as Composite)
- `id`: BIGINT (PK)
- `tenant_id`: UUID (FK)
- `user_id`: UUID (FK)
- `type`: VARCHAR(50)
- `content`: TEXT
- `is_read`: BOOLEAN
- `metadata`: JSON
- `created_at`

#### `audit_logs`
- `id`: BIGINT (PK)
- `tenant_id`: UUID (FK)
- `actor_id`: UUID (FK)
- `entity_type`: VARCHAR(50)
- `entity_id`: UUID
- `action`: VARCHAR(50) (CREATE, UPDATE, DELETE, APPROVE)
- `old_data`: JSON
- `new_data`: JSON
- `timestamp`: DATETIME

#### `email_logs`
- `id`: BIGINT (PK)
- `tenant_id`: UUID (FK)
- `recipient`: VARCHAR(255)
- `subject`: VARCHAR(255)
- `status`: ENUM('sent', 'failed')
- `error_msg`: TEXT
- `sent_at`: DATETIME

#### `attachments`
- `id`: UUID (PK)
- `tenant_id`: UUID (FK)
- `entity_type`: VARCHAR(50)
- `entity_id`: UUID
- `file_name`: VARCHAR(255)
- `file_path`: TEXT (Local path: `/uploads/...`)
- `file_size`: INT
- `mime_type`: VARCHAR(100)
- `created_at`

---

## 4. Multi-Tenant Index Strategy

Mọi bảng nghiệp vụ ngoài Khóa chính (UUID) đều phải có index bao gồm `tenant_id` để tối ưu hóa hiệu suất query và cô lập dữ liệu:
- `CREATE INDEX idx_tenant_user ON users(tenant_id, email);`
- `CREATE INDEX idx_tenant_quote ON quote_requests(tenant_id, status);`
- `CREATE INDEX idx_tenant_audit ON audit_logs(tenant_id, entity_type, entity_id);`

---

## 5. Soft Delete Strategy

Áp dụng cho các bảng: `users`, `customers`, `suppliers`, `products`, `quote_requests`.
- Khi xóa, set `deleted_at = CURRENT_TIMESTAMP`.
- Mọi câu lệnh SELECT mặc định phải có `WHERE deleted_at IS NULL`.

---

## 6. Sensitive Data & Encryption
- `tenants.llm_api_key`: Cần được mã hóa đối xứng (AES-256) trước khi lưu vào DB. Key giải mã được lưu trong biến môi trường server.
- `users.password`: Phải dùng Argon2 hoặc Bcrypt với salt. Không bao giờ lưu plaintext.

---

## 7. Migration SQL Scripts (Sơ lược MariaDB)

```sql
CREATE DATABASE qms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE tenants (
    id BINARY(16) PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    settings JSON,
    llm_provider VARCHAR(50),
    llm_api_key TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status)
);

-- Các bảng khác sẽ được migrate tự động qua Prisma ở phase thực thi mã nguồn.
```
