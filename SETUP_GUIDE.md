# 🚀 Hướng dẫn Chạy Hệ thống Btaskee

## 📋 Yêu cầu hệ thống
- Node.js v14+ và npm v6+
- MongoDB Atlas hoặc MongoDB local
- Clerk account (để authentication)

---

## ⚙️ Setup Ban đầu

### 1. Clone hoặc mở project
```bash
cd "d:\đồ án\Btaskee-main (1)\Btaskee-main\project"
```

### 2. Setup Backend

#### Cài đặt dependencies
```bash
cd backend
npm install
```

#### Tạo file `.env` trong `backend/`
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/btaskee
JWT_SECRET=your_random_secret_here
CLERK_SECRET_KEY=your_clerk_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

#### Khởi động backend
```bash
npm run dev
```

**Kỳ vọng output:**
```
[nodemon] 3.0.1
Server running on http://localhost:5000
Database connected successfully
```

### 3. Setup Frontend

#### Cài đặt dependencies
```bash
cd ../client
npm install
```

#### Tạo file `.env` trong `client/`
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

#### Khởi động frontend
```bash
npm run dev
```

**Kỳ vọng output:**
```
VITE v5.x.x  build 0.xx.xx

  ➜  Local:   http://localhost:5000
  ➜  press h to show help
```

---

## ✅ Kiểm tra hoạt động

### 1. Trang chủ
- URL: `http://localhost:3000`
- Kiểm tra: Trang load, hiển thị header & footer

### 2. Dịch vụ (Service)
- URL: `http://localhost:3000/services`
- Kiểm tra: Danh sách dịch vụ hiển thị từ database
- Nếu lỗi: Xem [TROUBLESHOOTING.md](TROUBLESHOOTING.md#1-vấn-đề-trang-dịch-vụ-không-hiển-thị)

### 3. Chat khách hàng
- URL: `http://localhost:3000/services` hoặc bất kỳ trang nào
- Kiểm tra: 💬 button ở góc phải dưới
- Nhấn vào button → mở chat box

### 4. Admin - Đăng nhập
- URL: `http://localhost:3000`
- Nhấn "Login Admin" hoặc "Admin Login"
- Đăng nhập qua Clerk
- Redirect đến `/admin-dashboard`

### 5. Admin - Chat
- URL: `http://localhost:3000/admin-dashboard`
- Sidebar trái → Nhấn "Chat Hỗ Trợ"
- Nếu không thấy: Xem [TROUBLESHOOTING.md](TROUBLESHOOTING.md#2-vấn-đề-trang-admin-không-vào-được)

---

## 📊 Kiến trúc hệ thống

```
┌─────────────────────────────────────┐
│         Client (Frontend)            │
│  React + Vite + Tailwind CSS        │
│  - Customer Pages (Services, Chat)   │
│  - Admin Dashboard (Chat, Orders)    │
│  - Socket.IO Client (Real-time)      │
└────────────────┬────────────────────┘
                 │ (Axios + Socket.IO)
                 ↓
┌─────────────────────────────────────┐
│     Backend (Node.js + Express)      │
│  Port: 5000                          │
│  - REST API (/api/*)                 │
│  - Socket.IO Server (Chat events)    │
│  - JWT Authentication                │
│  - File Upload (Cloudinary)          │
└────────────────┬────────────────────┘
                 │ (Mongoose)
                 ↓
┌─────────────────────────────────────┐
│      MongoDB Database                │
│  (Users, Services, Orders, Chats)   │
└─────────────────────────────────────┘
```

---

## 🔧 Các lệnh hữu ích

### Backend
```bash
cd backend

# Khởi động development
npm run dev

# Khởi động production
npm start

# Chạy scripts
npm run seed-branches      # Seed dữ liệu branches
npm run cleanup-employees  # Dọn dữ liệu employees
```

### Frontend
```bash
cd client

# Khởi động development
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🔌 API Endpoints

### Services
```
GET  /api/services/getall          - Danh sách dịch vụ
GET  /api/services/:id              - Chi tiết dịch vụ
POST /api/services                  - Tạo dịch vụ (Admin)
PUT  /api/services/:id              - Cập nhật dịch vụ (Admin)
```

### Chat
```
POST   /api/chat/conversation       - Tạo cuộc hội thoại
GET    /api/chat/messages/:convId   - Lấy tin nhắn
GET    /api/chat                    - Lấy tất cả cuộc hội thoại
PATCH  /api/chat/read/:convId       - Mark as read
PATCH  /api/chat/close/:convId      - Đóng cuộc hội thoại
```

### Socket.IO Events
```
register_customer                   - Đăng ký khách hàng
register_admin                      - Đăng ký admin
send_message                        - Gửi tin nhắn
receive_message                     - Nhận tin nhắn
join_conversation                   - Tham gia cuộc hội thoại
```

---

## 🐛 Khắc phục sự cố

### "Không thể kết nối với máy chủ"
1. Kiểm tra backend chạy: `http://localhost:5000` có response không
2. Kiểm tra MongoDB kết nối
3. Xem Backend Console có lỗi không

### "Danh sách dịch vụ trống"
1. Kiểm tra database có dữ liệu không
2. Chạy seed script: `npm run seed-branches` (backend)
3. Xem [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### "Admin page không vào được"
1. Đảm bảo đã đăng nhập qua Clerk
2. Kiểm tra sessionStorage có user không: `sessionStorage.getItem('user')`
3. Xem [TROUBLESHOOTING.md](TROUBLESHOOTING.md#2-vấn-đề-trang-admin-không-vào-được)

---

## 📚 File cấu hình chính

```
backend/
  ├─ .env                      # Environment variables
  ├─ package.json              # Dependencies
  ├─ index.js                  # Entry point
  └─ config/
      ├─ dbConnect.js          # MongoDB config
      ├─ socketIO.js           # Socket.IO setup
      └─ cloudinary.js         # File upload config

client/
  ├─ .env                      # Environment variables
  ├─ package.json              # Dependencies
  ├─ vite.config.js            # Vite config
  ├─ index.html                # HTML entry
  └─ src/
      ├─ App.jsx               # Main routes
      └─ main.jsx              # React entry point
```

---

## ✉️ Liên hệ & Hỗ trợ

📖 Xem file [TROUBLESHOOTING.md](TROUBLESHOOTING.md) để giải quyết các vấn đề thường gặp.

---

**Last Updated:** 2024
