# 🔧 Hướng dẫn Khắc phục Sự cố

## 1. Vấn đề: "Trang Dịch vụ không hiển thị"

### Nguyên nhân
- Backend server không chạy
- Lỗi kết nối mạng
- Database không khả dụng

### Giải pháp

#### 1️⃣ Kiểm tra Backend đã chạy chưa
```bash
# Đi vào thư mục backend
cd backend

# Cài đặt dependencies (nếu chưa)
npm install

# Khởi động backend
npm run dev
```

**Kỳ vọng output:**
```
Server running on http://localhost:5000
Database connected
```

#### 2️⃣ Kiểm tra kết nối Database (MongoDB)
- Đảm bảo MongoDB Atlas hoặc MongoDB local đang chạy
- Kiểm tra biến môi trường `MONGODB_URI` trong `.env`

#### 3️⃣ Kiểm tra Frontend
```bash
cd client
npm run dev
```

#### 4️⃣ Kiểm tra Browser Console
- Mở DevTools (F12)
- Tab **Console** xem có lỗi nào
- Tab **Network** xem request đến `/api/services/getall` có status 200 không

**Nếu vẫn lỗi:** Trang sẽ hiển thị thông báo lỗi chi tiết
- "Không thể tải dịch vụ. Vui lòng kiểm tra kết nối với máy chủ."

---

## 2. Vấn đề: "Trang Admin không vào được"

### Nguyên nhân
- Không đăng nhập qua Clerk
- Menu Chat bị thiếu (đã fix)
- Role trong sessionStorage không đúng

### Giải pháp

#### 1️⃣ Đảm bảo đã đăng nhập
- Nhấn "Login Admin" ở trang chủ
- Sử dụng tài khoản Clerk valid
- Kiểm tra `sessionStorage` trong DevTools:
  ```javascript
  sessionStorage.getItem('user')
  // Kỳ vọng: {"id": "...", "role": "admin", ...}
  ```

#### 2️⃣ Kiểm tra Menu Chat
- Dashboard admin → Sidebar trái phía
- Phải thấy "Chat Hỗ Trợ" giữa "Branches" và "Reports"
- **Đã được add vào data/index.js**

#### 3️⃣ Truy cập trực tiếp
- URL: `http://localhost:3000/admin-dashboard/chat`
- Hoặc qua menu "Chat Hỗ Trợ"

#### 4️⃣ Clear cache & reload
```javascript
// Mở DevTools Console và chạy:
sessionStorage.clear()
location.reload()
```

---

## 3. Vấn đề: "Chat không hoạt động"

### Nguyên nhân
- Backend không chạy → Socket.IO không connect
- Firewall chặn port 5000
- CORS không cấu hình đúng

### Giải pháp

#### 1️⃣ Kiểm tra Socket.IO kết nối
- DevTools → Console
- Bạn sẽ thấy:
  - ✅ `"✅ Socket connected"` (thành công)
  - ❌ `"Socket connection error"` (thất bại)
  - ⚠️ `"Không thể kết nối với máy chủ"` (error banner)

#### 2️⃣ Nếu Socket lỗi
- Kiểm tra backend chạy: `http://localhost:5000`
- Kiểm tra port 5000 free:
  ```bash
  # Windows PowerShell
  Get-NetTCPConnection -LocalPort 5000
  ```

#### 3️⃣ Nếu vẫn lỗi
- Kill process trên port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```
- Khởi động lại: `npm run dev` (backend folder)

---

## 4. ✅ Danh sách kiểm tra trước khi report lỗi

- [ ] Backend chạy (`npm run dev` từ `backend/` folder)
- [ ] Frontend chạy (`npm run dev` từ `client/` folder)
- [ ] MongoDB kết nối (check console backend)
- [ ] Đã đăng nhập qua Clerk
- [ ] Clear browser cache/sessionStorage
- [ ] Kiểm tra Browser Console (F12)
- [ ] Kiểm tra Network Tab status codes

---

## 5. 🔍 Debugging Tips

### Xem tất cả API requests
```javascript
// DevTools → Network tab
// Filter: XHR/Fetch
// Kiểm tra status code: 200 = OK, 4xx/5xx = lỗi
```

### Xem Database queries (Backend Console)
```bash
npm run dev
# Sẽ thấy MongoDB queries
```

### Xem real-time logs
```bash
# Backend folder
npm run dev -- --verbose

# Frontend folder  
npm run dev -- --host
```

---

## 6. 📊 Cấu trúc Server

```
Backend: http://localhost:5000
  ├─ API: /api/services/getall (Service list)
  ├─ API: /api/chat (Chat endpoints)
  └─ Socket.IO: ws://localhost:5000 (Chat real-time)

Frontend: http://localhost:3000
  ├─ Pages:
  │  ├─ /services (Customer service list)
  │  └─ /admin-dashboard/chat (Admin chat)
  └─ Components:
     ├─ ChatBox (Customer chat floating button)
     └─ AdminChat (Admin chat interface)
```

---

## 7. 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
CLERK_SECRET_KEY=your_key
```

### Frontend (.env)
```
VITE_CLERK_PUBLISHABLE_KEY=your_key
```

---

## ✉️ Liên hệ hỗ trợ

Nếu vấn đề vẫn chưa giải quyết:
1. Cung cấp **Browser Console logs**
2. Cung cấp **Backend Console logs**
3. Cung cấp **Network tab requests** (F12)
4. Mô tả **các bước tái hiện** lỗi
