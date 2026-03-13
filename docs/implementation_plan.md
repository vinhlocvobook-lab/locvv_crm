# Kế hoạch biên soạn PRD - Quotation Management System (QMS)

Bản kế hoạch này mô tả các bước để tạo ra tài liệu PRD toàn diện cho hệ thống QMS đa khách hàng (multi-tenant).

## Mục tiêu
Tạo ra một tài liệu PRD chi tiết, chuyên nghiệp bằng tiếng Việt để làm nền tảng cho việc triển khai mã nguồn sau này.

## Nội dung PRD dự kiến
1. **Mục tiêu dự án**: Tầm nhìn và các KPI chính.
2. **User Journey**: Luồng trải nghiệm của 5 vai trò (Sales, Purchasing, TL, Admin, Super Admin).
3. **State Machine**: Sơ đồ trạng thái chi tiết của báo giá với các điều kiện chuyển đổi.
4. **MoSCoW Prioritization**: Phân loại tính năng cho Phase 1 và Phase 2.
5. **Thiết kế hệ thống**: Kiến trúc Monolith module-based, Multi-tenant (Shared DB, Tenant ID).
6. **Chi tiết kỹ thuật**:
    - Cơ sở dữ liệu: MariaDB với **Prisma ORM**.
    - Backend: Node.js/Express với **node-cron** (Phase 1).
    - Frontend: React với **Zustand** và **Shadcn UI**.
    - Quản lý phiên bản (Versioning): Snapshot dựa trên JSON.
    - Chiến lược SLA: Scheduler quét định kỳ mỗi 5-15 phút.
    - Trừu tượng hóa LLM (Adapter pattern).
    - Storage: **Local Filesystem** với `IStorageService` abstraction.
7. **Quản lý rủi ro & Khả năng mở rộng**.

## Các khía cạnh cần xử lý đặc biệt
- **Đa tiền tệ & VAT**: Xử lý tỷ giá hối đoái tại thời điểm báo giá.
- **Hiệu lực báo giá**: Cơ chế tự động quét và thông báo khi sắp hết hạn.
- **Service Layer Abstraction**: Đảm bảo `EmailService`, `SchedulerService` và `IStorageService` được định nghĩa qua Interface để swap implementation dễ dàng.
- **Storage Organization**: Phân cấp thư mục theo `/uploads/{tenant_slug}/{category}/`.
- **Data Isolation**: Đảm bảo Tenant ID luôn được kiểm soát chặt chẽ ở cấp độ query/middleware.

## Kế hoạch thực hiện
1. [NEW] Tạo file PRD.md với đầy đủ các mục trên.
2. Cập nhật task.md để theo dõi tiến độ.
3. Chờ phản hồi của người dùng về bản PRD trước khi bắt đầu Phase 3 (Thiết kế kỹ thuật chi tiết & Code).
