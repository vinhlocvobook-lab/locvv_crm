# Tài Liệu Kiểm Thử Phân Quyền (Permissions Redesign)

Tài liệu này ghi nhận kịch bản kiểm thử tự động (Automated Test Scenario) và kết quả xác minh hệ thống phân quyền mới cho Dự án và Báo giá.

---

## 🧪 Kịch bản kiểm thử (`backend/src/scripts/test_permissions.ts`)

Kịch bản thực hiện các luồng tự động sau:
1. **Khởi tạo:** Tạo 5 tài khoản mẫu cho `SALES`, `PURCHASING`, `TECHNICAL`, `ACCOUNTANT`, `TL`.
2. **Tạo dữ liệu:** Tạo Dự án thử nghiệm (gán Tech làm thành viên) và Yêu cầu báo báo giá ở trạng thái `DRAFT`.
3. **Thực thi TestCase:** Tự động gọi API nâng cao bằng `fetch` với JWT Token riêng cho từng vai trò để đo đạc kết quả.

---

## 📊 Kết quả Kiểm thử (Test Results)

Chạy lúc: `2026-03-18T09:40:00+07:00`

```bash
🧪 Bắt đầu kịch bản kiểm thử phân quyền...
👥 1. Khởi tạo tài khoản kiểm thử...
📊 2. Khởi tạo dữ liệu mẫu (Project + Quote)...

📡 3. Gọi API Kiểm thử...

--- 🟢 [CASE 1] Sale xem Quote: Expects to see it
✅ PASS: Sale xem được danh sách

--- 🔴 [CASE 2] Purchasing xem Quote: Expects to skip DRAFT
✅ PASS: Purchasing không thấy quote DRAFT.

--- 🟡 [CASE 3] Technical xem Quote Detail: Expects prices MASKED
✅ PASS: Giá targetPrice & subTotal đã bị MASKED (Ẩn).

--- 👑 [CASE 4] TL Override Override: Expects prices VISIBLE
✅ PASS: Giá hiển thị do có Override permission của TL.

🏁 4. Cleanup dữ liệu test...
```

### Kết luận:
- **Tính bảo mật:** Đảm bảo Nhân viên các phòng ban chỉ thấy thông tin cần thiết.
- **Tính ẩn giá (Masking):** Hoạt động chính xác cho vai trò `TECHNICAL`.
- **Tính năng phá rào (Override):** Cho phép Team Leader cấp quyền xem giá cho Kỹ thuật viên thành công.
