import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBox from './ChatBox';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    // Khối bao bọc toàn bộ giao diện layout với cấu trúc Flexbox theo chiều dọc (column)
    // min-h-screen giúp đảm bảo chiều cao tối thiểu luôn tràn màn hình để Footer không bị đẩy lên giữa trang
    <div className='flex flex-col min-h-screen'>

      {/* Thanh thông báo biểu ngữ (Top Banner) phía trên cùng của Header */}
      <div className="flex flex-wrap items-center justify-center w-full py-2 font-medium text-sm text-white text-center bg-gradient-to-b from-orange-500 to-orange-600">
        <p>Templates are live on prebuiltui!</p>
        <button className="flex items-center gap-1 px-3 py-1 rounded-lg text-orange-600 bg-white hover:bg-slate-200 transition active:scale-95 ml-3">
          Check it out
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.91797 7H11.0846" stroke="#F54900" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 2.9165L11.0833 6.99984L7 11.0832" stroke="#F54900" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Component Thanh điều hướng đầu trang */}
      <Header />

      {/* Khu vực hiển thị nội dung chính của từng trang (Main Content Area).
        - flex-1: Tự động co giãn chiếm trọn không gian trống còn lại giữa Header và Footer.
        - pt-40: Tạo khoảng trống phía trên (padding-top) để tránh bị thanh Header fixed che khuất nội dung.
        - container mx-auto: Căn giữa nội dung và giới hạn chiều rộng tối đa theo chuẩn responsive.
        - <Outlet />: Nơi React Router DOM sẽ render các component con tương ứng với URL hiện tại.
      */}
      <main className="flex-1 pt-40 container mx-auto">
        <Outlet />
      </main>

      {/* Component Chân trang hệ thống */}
      <Footer />

      {/* Component Hộp thoại Chatbox nổi (thường nằm cố định ở góc màn hình) */}
      <ChatBox />
    </div>
  );
}