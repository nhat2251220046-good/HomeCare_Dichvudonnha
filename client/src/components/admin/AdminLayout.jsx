import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div>
      {/* <Outlet /> đóng vai trò như một vị trí giữ chỗ (Placeholder).
        Khi người dùng truy cập vào các tuyến đường con (Nested Routes) của AdminLayout,
        React Router sẽ tự động tìm và render component tương ứng của trang con đó vào vị trí này.
        Giúp giữ nguyên cấu trúc layout bao bọc bên ngoài mà không cần re-render lại toàn bộ trang.
      */}
      <Outlet />
    </div>
  );
}