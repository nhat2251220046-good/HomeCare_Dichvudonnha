# Hướng dẫn Kiểm tra Hệ thống Thông báo

## 🚀 Bước chuẩn bị

1. Đảm bảo backend đang chạy trên port 5000
2. Đảm bảo frontend đang chạy trên port 5173
3. Database MongoDB đang kết nối

## 🧪 Test Case 1: Tạo và Nhận Thông báo Khi Cập nhật Status

### Bước 1: Tạo đơn hàng
1. Đăng nhập bằng tài khoản khách hàng
2. Đặt dịch vụ bất kỳ
3. Lưu lại **Order ID** và **Customer ID**

### Bước 2: Cập nhật trạng thái đơn hàng (Admin/Staff)
Sử dụng API hoặc admin panel để cập nhật status:

```bash
curl -X PUT http://localhost:5000/api/orders/:orderId \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted",
    "staffId": "staff_id_here"
  }'
```

### Bước 3: Kiểm tra thông báo
1. Đăng nhập lại bằng tài khoản khách hàng
2. Nhấp vào biểu tượng chuông 🔔
3. Xác nhận:
   - ✅ Thông báo mới xuất hiện
   - ✅ Hiển thị tên nhân viên
   - ✅ Hiển thị tiêu đề chính xác
   - ✅ Hiển thị nội dung chính xác
   - ✅ Hiển thị thời gian (ngày, giờ, tháng, năm)

## 🧪 Test Case 2: Real-time Notification

### Bước 1: Chuẩn bị hai tab trình duyệt
1. Tab 1: Đăng nhập khách hàng (để mở dropdown thông báo)
2. Tab 2: Đăng nhập admin/staff

### Bước 2: Cập nhật status từ Tab 2
```bash
curl -X PUT http://localhost:5000/api/orders/:orderId \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "staffId": "staff_id_here"
  }'
```

### Bước 3: Kiểm tra
1. Tab 1 sẽ nhận được thông báo **tức thời** (không cần refresh)
2. Xác nhận thông báo xuất hiện trong dropdown

## 🧪 Test Case 3: Đánh dấu Đã đọc

### Bước 1: Mở dropdown thông báo
- Nhấp vào biểu tượng chuông 🔔

### Bước 2: Kiểm tra thông báo chưa đọc
- Xác nhận có **huy hiệu số** trên chuông
- Xác nhận **background xanh nhạt** trên thông báo chưa đọc

### Bước 3: Nhấp vào thông báo
- Thông báo sẽ chuyển sang **background trắng**
- Huy hiệu số sẽ **giảm đi 1**

### Bước 4: Đánh dấu tất cả là đã đọc
- Nhấp nút "✓ Đánh dấu tất cả là đã đọc"
- Tất cả thông báo sẽ chuyển sang **background trắng**
- Huy hiệu số sẽ **bằng 0**

## 🧪 Test Case 4: Xóa Thông báo

### Bước 1: Mở dropdown
- Nhấp vào biểu tượng chuông 🔔

### Bước 2: Xóa một thông báo
- Nhấp nút X bên phải thông báo
- Xác nhận thông báo **biến mất**

### Bước 3: Xóa tất cả (API)
```bash
curl -X DELETE http://localhost:5000/api/notifications/customer/:customerId/all
```
- Xác nhận dropdown thông báo **rỗng**

## 🧪 Test Case 5: Lấy Danh sách Thông báo (API)

### Lệnh:
```bash
curl -X GET "http://localhost:5000/api/notifications/customer/:customerId?page=1&limit=20"
```

### Xác nhận:
- ✅ Trả về **mảng thông báo**
- ✅ Mỗi thông báo có **_id, customer, order, staff, type, status, title, message, staffName, isRead, createdAt**
- ✅ Kết quả được **sắp xếp từ mới nhất**
- ✅ Hỗ trợ **phân trang**

## 🧪 Test Case 6: Lấy Số Thông báo Chưa đọc

### Lệnh:
```bash
curl -X GET http://localhost:5000/api/notifications/unread/:customerId
```

### Xác nhận:
- ✅ Trả về **unreadCount**
- ✅ Số lượng chính xác

## 🧪 Test Case 7: Các Trạng thái Khác Nhau

Thử cập nhật với các status khác nhau và xác nhận thông báo:

| Status | Tiêu đề | Xác nhận |
|--------|---------|---------|
| pending | "Đơn hàng của bạn đang chờ nhân viên xác nhận" | ✅ |
| accepted | "Nhân viên đã chấp nhận đơn hàng của bạn" | ✅ |
| in_progress | "Nhân viên đang thực hiện dịch vụ" | ✅ |
| completed | "Dịch vụ hoàn thành thành công" | ✅ |
| canceled | "Đơn hàng đã bị hủy" | ✅ |
| assigning | "Đơn hàng đang được phân công" | ✅ |

## 🧪 Test Case 8: Thời gian Hiển thị

### Bước 1: Tạo thông báo
- Cập nhật status đơn hàng

### Bước 2: Kiểm tra thời gian
- Xác nhận thời gian hiển thị theo format: **DD/MM/YYYY HH:MM:SS**
- Ví dụ: `21/04/2026 10:30:45`

## 🧪 Test Case 9: Database Persistence

### Bước 1: Tạo thông báo
- Cập nhật status

### Bước 2: Đóng trình duyệt
- Tắt hoàn toàn tab khách hàng

### Bước 3: Mở lại
- Đăng nhập lại khách hàng
- Nhấp vào biểu tượng chuông
- Xác nhận thông báo **vẫn còn** (không bị mất)

## 📊 Kiểm tra Database

### Xem thông báo trong MongoDB:
```javascript
// Sử dụng MongoDB Compass hoặc MongoDB CLI
db.notifications.find().pretty()

// Tìm thông báo của một khách hàng
db.notifications.find({ customer: ObjectId("customer_id") }).pretty()
```

### Xác nhận:
- ✅ Có dữ liệu trong collection `notifications`
- ✅ Mỗi document có các trường bắt buộc
- ✅ Dữ liệu staffName được lưu (trường hợp nhân viên bị xóa)

## 🔧 Debug & Troubleshooting

### Nếu thông báo không xuất hiện:
1. Kiểm tra console (F12) để xem lỗi
2. Kiểm tra Network tab để xem API response
3. Kiểm tra MongoDB xem dữ liệu đã lưu chưa
4. Kiểm tra Socket.IO connection trong console

### Logs để check:
- Backend: Tìm `createNotification` trong logs
- Frontend Console: Tìm "Thông báo mới:" message

### Lệnh check Socket.IO:
```javascript
// Trong browser console
// Nếu không thấy output, Socket.IO chưa kết nối
io().on('connect', () => console.log('Connected'))
```

## ✅ Danh sách Kiểm tra Hoàn tất

- [ ] Thông báo xuất hiện khi cập nhật status
- [ ] Thông báo real-time qua Socket.IO
- [ ] Đánh dấu đã đọc hoạt động
- [ ] Xóa thông báo hoạt động
- [ ] API endpoints hoạt động đúng
- [ ] Dữ liệu lưu trong database
- [ ] Hiển thị tên nhân viên
- [ ] Hiển thị thời gian đúng format
- [ ] Thông báo vẫn còn sau khi refresh
- [ ] Huy hiệu số cập nhật đúng

---

**Lưu ý**: Nếu gặp vấn đề, hãy kiểm tra:
- Console Browser (F12)
- Backend logs (Terminal)
- MongoDB connection
- Socket.IO connection
