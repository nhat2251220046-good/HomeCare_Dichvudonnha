# Hệ thống Thông báo - Hướng dẫn Sử dụng

## 📋 Tổng quan

Hệ thống thông báo cho phép khách hàng nhận được thông báo khi nhân viên cập nhật trạng thái đơn hàng. Thông báo bao gồm:
- ✅ **Tên nhân viên** - Ai thực hiện
- 🕐 **Ngày, giờ, tháng, năm** - Khi nào cập nhật
- 📝 **Tiêu đề và nội dung** - Chi tiết thay đổi

## 🔔 Các loại Thông báo

### 1. Đơn hàng đang được phân công
- **Tiêu đề**: Đơn hàng đang được phân công
- **Nội dung**: Chúng tôi đang tìm nhân viên phù hợp cho đơn hàng của bạn.

### 2. Chờ nhân viên xác nhận
- **Tiêu đề**: Đơn hàng của bạn đang chờ nhân viên xác nhận
- **Nội dung**: Nhân viên [Tên] đã được phân công. Chúng tôi đang chờ xác nhận từ họ.

### 3. Nhân viên chấp nhận
- **Tiêu đề**: Nhân viên đã chấp nhận đơn hàng của bạn
- **Nội dung**: [Tên nhân viên] đã chấp nhận thực hiện dịch vụ cho bạn.

### 4. Đang thực hiện dịch vụ
- **Tiêu đề**: Nhân viên đang thực hiện dịch vụ
- **Nội dung**: [Tên nhân viên] đang tiến hành thực hiện dịch vụ cho bạn.

### 5. Dịch vụ hoàn thành
- **Tiêu đề**: Dịch vụ hoàn thành thành công
- **Nội dung**: [Tên nhân viên] đã hoàn thành dịch vụ. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.

### 6. Đơn hàng bị hủy
- **Tiêu đề**: Đơn hàng đã bị hủy
- **Nội dung**: Đơn hàng của bạn đã bị hủy bởi [Tên nhân viên].

## 🔔 Cách xem Thông báo

1. Nhấp vào **biểu tượng chuông** 🔔 ở góc trên phải màn hình
2. Danh sách thông báo sẽ hiển thị
3. Thông báo chưa đọc sẽ hiển thị với background **xanh nhạt**
4. Các thông báo được sắp xếp từ **mới nhất** xuống **cũ nhất**

## ✅ Đánh dấu Thông báo

### Đánh dấu một thông báo đã đọc
- Nhấp trực tiếp vào thông báo
- Màu nền sẽ thay đổi từ **xanh nhạt** thành **trắng**

### Đánh dấu tất cả thông báo là đã đọc
- Nhấp nút **"✓ Đánh dấu tất cả là đã đọc"** ở dưới cùng danh sách

## 🗑️ Xóa Thông báo

### Xóa một thông báo
- Nhấp vào nút **X** ở bên phải thông báo

### Xóa tất cả thông báo
- Sử dụng API: `DELETE /api/notifications/customer/:customerId/all`

## 📊 Thống kê Thông báo

- **Số thông báo chưa đọc** hiển thị trong huy hiệu (badge) trên biểu tượng chuông
- Khi có thông báo mới, huy hiệu sẽ cập nhật tự động
- Nếu số lượng > 99, sẽ hiển thị "99+"

## ⚙️ API Endpoints

### Lấy danh sách thông báo
```
GET /api/notifications/customer/:customerId?page=1&limit=20&isRead=false
```
- `page`: Trang (mặc định: 1)
- `limit`: Số thông báo trên trang (mặc định: 10)
- `isRead`: Lọc đã đọc/chưa đọc (tùy chọn)

**Ví dụ trả về**:
```json
{
  "notifications": [
    {
      "_id": "...",
      "customer": "...",
      "order": "...",
      "staff": {...},
      "type": "status_update",
      "status": "in_progress",
      "title": "Nhân viên đang thực hiện dịch vụ",
      "message": "...",
      "staffName": "Nguyễn Văn A",
      "isRead": false,
      "createdAt": "2026-04-21T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### Lấy số thông báo chưa đọc
```
GET /api/notifications/unread/:customerId
```

**Ví dụ trả về**:
```json
{
  "unreadCount": 3
}
```

### Đánh dấu thông báo đã đọc
```
PUT /api/notifications/:notificationId/read
```

### Đánh dấu tất cả thông báo là đã đọc
```
PUT /api/notifications/customer/:customerId/read-all
```

### Xóa thông báo
```
DELETE /api/notifications/:notificationId
```

### Xóa tất cả thông báo
```
DELETE /api/notifications/customer/:customerId/all
```

## 🔌 Socket.IO Real-time

Khi một nhân viên cập nhật trạng thái đơn hàng:
1. Backend tạo thông báo trong database
2. Backend gửi event real-time tới khách hàng qua Socket.IO
3. Frontend tự động cập nhật danh sách thông báo
4. Huy hiệu số lượng được cập nhật

## ⏰ Thời gian Thông báo

Tất cả thời gian được hiển thị theo **định dạng Việt Nam**:
- Định dạng: `DD/MM/YYYY HH:MM:SS`
- Ví dụ: `21/04/2026 10:30:45`

## 💡 Mẹo

- Thông báo được **lưu trong database**, bạn có thể xem lại sau
- Không cần refresh trang, thông báo real-time sẽ tự động cập nhật
- Số lượng thông báo chưa đọc được cập nhật tức thời
- Bạn có thể xóa thông báo cũ mà không cần thiết

## ❌ Xử lý Lỗi

Nếu không thấy thông báo:
1. Đảm bảo bạn đã **đăng nhập**
2. Kiểm tra **kết nối internet**
3. Refresh trang web
4. Xóa cache trình duyệt

---

📞 **Hỗ trợ**: Nếu có vấn đề, vui lòng liên hệ với bộ phận hỗ trợ khách hàng.
