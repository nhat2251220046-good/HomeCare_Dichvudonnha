# 💬 Hệ Thống Chat Khách Hàng - Admin

## ✅ Tính Năng Chính

### Khách Hàng
- 💬 Chat bubble nổi ở góc phải màn hình
- ✍️ Gửi tin nhắn real-time
- 📜 Lịch sử chat tự động tải
- 🔔 Thông báo tin nhắn mới

### Admin
- 👥 Danh sách tất cả cuộc chat
- 🔍 Tìm kiếm khách hàng theo tên/email
- 💬 Trả lời tin nhắn real-time
- 🔚 Đóng cuộc hội thoại
- ✓ Đánh dấu đã đọc tự động

---

## 📁 Các Files Tạo Mới

### Backend
```
backend/
├── models/
│   ├── ChatModel.js              # Lưu tin nhắn
│   └── ConversationModel.js      # Lưu cuộc hội thoại
├── controllers/
│   └── chatController.js         # Logic xử lý chat
├── routers/
│   └── chatRoutes.js             # API routes
└── config/
    └── socketIO.js               # Socket.IO events (updated)
```

### Frontend
```
client/src/
├── components/
│   ├── ChatBox.jsx               # Chat component cho khách
│   └── ChatBox.css               # Styles
├── pages/admin/
│   ├── AdminChat.jsx             # Chat page cho admin
│   └── AdminChat.css             # Styles
└── components/
    └── MainLayout.jsx            # Updated với ChatBox
```

---

## 🔌 API Endpoints

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| POST | `/api/chat/conversation` | Tạo/lấy cuộc chat |
| GET | `/api/chat/messages/:conversationId` | Lấy tin nhắn |
| GET | `/api/chat` | Lấy tất cả chat (admin) |
| GET | `/api/chat/customer/:customerId` | Lấy chat của khách |
| PATCH | `/api/chat/read/:conversationId` | Đánh dấu đã đọc |
| PATCH | `/api/chat/close/:conversationId` | Đóng cuộc chat |

---

## 🔌 Socket.IO Events

### Khách Hàng Emit
- `register_customer` - Đăng ký khách hàng
- `join_conversation` - Tham gia phòng chat
- `send_message` - Gửi tin nhắn

### Admin Emit
- `register_admin` - Đăng ký admin
- `join_conversation` - Tham gia phòng chat
- `send_message` - Gửi tin nhắn

### Server Broadcast
- `receive_message` - Nhận tin nhắn
- `new_message` - Thông báo tin nhắn mới cho admins

---

## 🚀 Cách Sử Dụng

### Khách Hàng
1. Truy cập bất kỳ trang nào
2. Click nút 💬 ở góc phải dưới
3. Nhập tin nhắn và gửi
4. Admin sẽ trả lời ngay

### Admin
1. Đăng nhập vào `/admin-dashboard`
2. Vào `Chat Support` (hoặc `/admin-dashboard/chat`)
3. Chọn khách từ danh sách bên trái
4. Gửi tin nhắn để hỗ trợ

---

## 📊 Database Schema

### ChatMessage
```javascript
{
  conversationId: String,    // ID cuộc hội thoại
  senderId: String,          // ID người gửi
  senderType: "customer|admin",
  senderName: String,
  message: String,
  isRead: Boolean,
  timestamps
}
```

### Conversation
```javascript
{
  conversationId: String,    // ID duy nhất
  customerId: String,        // ID khách hàng
  customerName: String,
  customerEmail: String,
  lastMessage: String,       // Tin nhắn cuối
  lastMessageTime: Date,
  status: "active|closed"
}
```

---

## ⚙️ Cấu Hình

### Environment Variables
```
MONGODB_URI=<your_mongodb_uri>
```

### CORS Settings
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## 🐛 Troubleshooting

| Lỗi | Giải Pháp |
|-----|----------|
| Tin nhắn không gửi | Kiểm tra socket connection |
| Admin không nhận được tin | Kiểm tra admin có join room chưa |
| Lỗi CORS | Kiểm tra origin setting trong socketIO |

---

## 📈 Mở Rộng Tương Lai

- [ ] File upload support
- [ ] Typing indicators
- [ ] Message reactions
- [ ] Chat history search
- [ ] Auto-responses/templates
- [ ] Rating system
- [ ] Chat assignment

---

## 📝 Notes

- Tất cả tin nhắn lưu trong MongoDB
- Socket.IO auto-reconnect nếu mất kết nối
- Khách chỉ có 1 cuộc chat với admin
- Chat history tự động tải khi mở
