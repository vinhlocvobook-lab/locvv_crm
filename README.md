# Quotation Management System (QMS)

Hệ thống quản lý báo giá đa khách hàng (SaaS Multi-tenant) giúp tối ưu hóa quy trình làm báo giá giữa Sales, Purchasing, Team Leader và Nhà cung cấp.

## 🚀 Tính năng chính
- **Multi-tenant:** Cách ly dữ liệu tuyệt đối giữa các công ty.
- **Quote Workflow:** Quy trình báo giá chặt chẽ từ yêu cầu đến khi gửi khách hàng.
- **SLA Tracking:** Theo dõi thời gian xử lý theo giờ làm việc.
- **AI-Powered (Phase 2):** Trích xuất báo giá tự động từ email supplier bằng LLM.
- **So sánh giá:** Hỗ trợ chọn lựa nhà cung cấp tối ưu.

## 🛠 Tech Stack
- **Backend:** Node.js, TypeScript, MariaDB.
- **Frontend:** React, TypeScript.
- **Realtime:** Socket.io.
- **AI:** Google Gemini / OpenAI / Anthropic / Ollama.

## 📁 Tài liệu dự án
Các tài liệu phân tích nghiệp vụ và kỹ thuật nằm trong thư mục `/docs`:
- [Product Requirement Document (PRD)](docs/prd.md)
- [Implementation Plan](docs/implementation_plan.md)
- [Task List](docs/task.md)

## 📋 Hướng dẫn cài đặt (Dự kiến)
1. Clone dự án.
2. Sao chép `.env.example` thành `.env` và cấu hình các thông số.
3. Chạy lệnh cài đặt:
   ```bash
   npm install
   ```
4. Khởi chạy môi trường phát triển:
   ```bash
   npm run dev
   ```

## ⚖️ Quy định đóng góp
Vui lòng đọc kỹ tài liệu [PRD](docs/prd.md) trước khi thực hiện bất kỳ thay đổi lớn nào về cấu trúc dữ liệu hoặc luồng nghiệp vụ.
