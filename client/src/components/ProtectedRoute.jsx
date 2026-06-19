import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, redirectPath = "/manager-login" }) {
  // Lấy và ép kiểu dữ liệu user từ sessionStorage để kiểm tra trạng thái đăng nhập
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Trường hợp 1: Nếu chưa đăng nhập (không có user trong sessionStorage)
  // Chuyển hướng người dùng về trang login (mặc định là "/manager-login")
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  // Trường hợp 2: Đã đăng nhập nhưng quyền (role) của user không nằm trong danh sách quyền được phép (allowedRoles)
  // Chuyển hướng người dùng về trang chủ "/"
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Trường hợp 3: Hợp lệ (Đã đăng nhập và đúng quyền)
  // Cho phép hiển thị các component con bên trong Route này (thông qua <Outlet />)
  return <Outlet />;
}