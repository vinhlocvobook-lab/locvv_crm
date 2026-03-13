# SERVICE INTERFACES - QMS

Tài liệu này định nghĩa các Interface trừu tượng cho tầng dịch vụ mẫu (Service Layer) để đảm bảo tính linh hoạt của hệ thống.

---

## 1. IEmailService

Quản lý việc gửi thông báo qua Email.

```typescript
export interface IEmailService {
  /** Gửi báo giá chính thức cho khách hàng */
  sendQuoteToCustomer(quoteId: string, recipient: string, pdfPath?: string): Promise<boolean>;

  /** Cảnh báo vi phạm SLA cho nhân viên/quản lý */
  sendSLAWarning(userId: string, quoteId: string, level: 'warning' | 'violation' | 'critical'): Promise<void>;

  /** Thông báo khi có thay đổi trạng thái quan trọng */
  sendStatusUpdate(userId: string, quoteId: string, status: string): Promise<void>;

  /** Email chào mừng Tenant mới hoặc User mới */
  sendWelcomeEmail(email: string, name: string): Promise<void>;
}
```
- **Phase 1:** `NodemailerEmailService` (SMTP).
- **Phase 2:** `ResendEmailService` (API-based, tốc độ cao hơn).

---

## 2. IStorageService

Quản lý lưu trữ tệp tin (Tài liệu sản phẩm, Báo giá Supplier, PDF).

```typescript
export interface FileMetadata {
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
}

export interface IStorageService {
  /** Upload file vào thư mục chỉ định */
  uploadFile(file: Buffer, tenantSlug: string, category: string, fileName: string): Promise<FileMetadata>;

  /** Lấy URL truy cập (cho frontend hoặc đính kèm email) */
  getFileUrl(filePath: string): Promise<string>;

  /** Xóa file khỏi hệ thống */
  deleteFile(filePath: string): Promise<void>;

  /** Đọc file stream (phục vụ download hoặc AI processing) */
  getFileStream(filePath: string): Promise<ReadableStream>;
}
```
- **Phase 1:** `LocalStorageService` (Lưu tại `/uploads`).
- **Phase 2:** `GoogleDriveStorageService` (Thông qua Cloud SDK).

---

## 3. ILLMAdapter (Phase 2)

Trừu tượng hóa việc giao tiếp với các mô hình ngôn ngữ lớn để trích xuất dữ liệu.

```typescript
export interface ExtractedData {
  supplierName?: string;
  items: Array<{
    sku?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  currency: string;
}

export interface ILLMAdapter {
  /** Trích xuất dữ liệu từ nội dung text email */
  extractFromEmail(content: string): Promise<ExtractedData>;

  /** Trích xuất dữ liệu từ file PDF được parse */
  extractFromPDF(pdfContent: string): Promise<ExtractedData>;
}
```
- **Implementations:** `GeminiAdapter`, `OpenAIAdapter`.
- **Factory:** Khởi tạo adapter dựa trên API Key của từng Tenant.

---

## 4. ISchedulerService

Quản lý các tác vụ chạy ngầm và quét định kỳ.

```typescript
export interface ISchedulerService {
  /** Khởi tạo scanner quét vi phạm SLA */
  registerSLAScanner(intervalMinutes: number): void;

  /** Quét và thông báo báo giá sắp hết hạn hàng ngày */
  registerExpiryScanner(hour: number, minute: number): void;

  /** Gửi email từ hàng đợi gom luồng để tránh nghẽn */
  registerEmailDispatcher(intervalSeconds: number): void;
}
```
- **Phase 1:** `NodeCronSchedulerService`.
- **Phase 2:** `BullMQSchedulerService` (Sử dụng Redis Queues).

---

## 5. Dependency Injection (Ví dụ)

Trong tầng khởi tạo (e.g., `App.ts` hoặc InversifyJS):

```typescript
// Giai đoạn 1: Dùng Local & SMTP
const storage = new LocalStorageService();
const email = new NodemailerEmailService();
const scheduler = new NodeCronSchedulerService(email);

// Khi cần dùng trong QuoteService
const quoteService = new QuoteService(storage, email);
```
Mọi Business Logic bên trong `QuoteService` sẽ chỉ gọi `this.storage.uploadFile()` mà không cần biết file đang được lưu ở đâu.
