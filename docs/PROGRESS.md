# PROJECT PROGRESS - QMS

Theo dõi các mốc quan trọng của dự án.

| Giai đoạn | Trạng thái | Hoàn thành | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Phase 1: Discovery** | ✅ Hoàn thành | 100% | Đã chốt PRD v1.4 |
| **Phase 2: Technical Design** | ✅ Hoàn thành | 100% | Đã xong Architecture, DB, API, Service Interfaces |
| **Phase 3: Initialization** | ✅ Hoàn thành | 100% | Gitignore, Env, README |
| **Phase 4: Backend Setup** | ⏳ Chờ | 0% | Cấu trúc module, Type-safe |
| **Phase 5: Frontend Setup** | ⏳ Chờ | 0% | UI Layout, State management |
| **Phase 6: Core Features** | ⏳ Chờ | 0% | Auth, Quotes, Tenant |

## Cập nhật gần đây
- **2026-03-13:** Hoàn thành **API Reference** và **Service Interfaces**, kết thúc giai đoạn Technical Design.
- **2026-03-13:** Điều chỉnh kiến trúc VoIP: Sử dụng SIP over WebRTC kết nối tổng đài Asterisk PBX thay vì truyền tín hiệu qua Socket.io.
- **2026-03-13:** Giới hạn phạm vi của Socket.io chỉ cho Chat nội bộ và Notification.
- **2026-03-13:** Quyết định chuyển State Management từ Zustand sang Redux Toolkit để hỗ trợ WebRTC Call State Machine (Phase 2).
- **2026-03-13:** Bổ sung WebRTC/VoIP Architecture vào `ARCHITECTURE.md`.
- **2026-03-13:** Thiết kế xong file `ARCHITECTURE.md` và `DATABASE.md`.
- **2026-03-13:** Chốt phương án Storage (Local) và Queue (node-cron) cho Giai đoạn 1.
- **2026-03-13:** Hoàn thành PRD v1.4 với đầy đủ các yêu cầu nghiệp vụ bổ sung.
