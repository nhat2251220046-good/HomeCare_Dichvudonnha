import { Link } from "react-router-dom";

export default function AdminNotFound() {
  return (
    // Toàn bộ vùng chứa (Container) căn giữa màn hình theo cả chiều dọc và chiều ngang
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">

      {/* Mã lỗi 404 với kích thước chữ lớn để gây ấn tượng thị giác */}
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>

      {/* Lời nhắn thông báo trang không tìm thấy (hỗ trợ responsive kích thước chữ) */}
      <p className="text-xl md:text-2xl text-gray-600 mb-6">
        Oops! Trang bạn đang tìm không tồn tại.
      </p>

      {/* Nút bấm (Link) sử dụng React Router để điều hướng mượt mà về trang quản lý chính mà không bị load lại trang */}
      <Link
        to="/admin-dashboard"
        className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
      >
        Quay về trang chủ Admin
      </Link>

    </div>
  );
}