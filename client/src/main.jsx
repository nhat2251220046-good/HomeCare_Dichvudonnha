import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Import tệp cấu hình CSS toàn cục (bao gồm cả Tailwind CSS nếu có)
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { HelmetProvider } from "react-helmet-async";
import ScrollToTop from './components/ScrollToTop.jsx'

// --- IMPORT STYLESHEETS CỦA THƯ VIỆN SWIPER (SLIDER) ---
// Đảm bảo các hiệu ứng chuyển ảnh và phân trang của Banner Trang chủ hoạt động chính xác
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// --- ĐỌC BIẾN MÔI TRƯỜNG (ENVIRONMENT VARIABLES) ---
// Lấy mã Publishable Key của Clerk Auth từ file .env phục vụ cho quá trình xác thực dữ liệu người dùng
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// --- CẤU TRÚC ĐÓNG GÓI THÀNH PHẦN (ROOT COMPONENT TREE) ---
// Thiết lập cây component chứa các Context Providers bao bọc toàn bộ logic ứng dụng
const Root = (
  <BrowserRouter>
    {/* Component tự động cuộn màn hình về đầu trang mỗi khi người dùng chuyển Route */}
    <ScrollToTop>
      {/* Provider hỗ trợ thay đổi thẻ <meta>, <title> động trong component con để tối ưu SEO */}
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ScrollToTop>
  </BrowserRouter>
)

// --- LUỒNG KHỞI CHẠY ỨNG DỤNG ĐIỀU KIỆN (CONDITIONAL RENDERING ROOT) ---
// Kiểm tra sự tồn tại của Clerk Key để quyết định cơ chế phân quyền xác thực khi khởi tạo DOM
if (PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'REPLACE_ME') {
  // TRƯỜNG HỢP 1: Có đầy đủ Key cấu hình -> Bọc ứng dụng trong ClerkProvider để chạy tính năng đăng nhập
  createRoot(document.getElementById('root')).render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>{Root}</ClerkProvider>
  )
} else {
  // TRƯỜNG HỢP 2: Thiếu Key hoặc Key chưa thay thế -> Chạy chế độ Dev độc lập mà không cần kết nối mạng qua Clerk
  console.warn('Clerk publishable key missing or placeholder. Running without Clerk.');
  createRoot(document.getElementById('root')).render(Root)
}