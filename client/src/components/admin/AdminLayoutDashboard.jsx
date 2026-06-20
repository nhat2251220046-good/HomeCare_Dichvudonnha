import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { menuAdmin } from "../../data/index";
import HeaderAdmin from "./HeaderAdmin";
import { useState, useEffect } from "react";

export default function AdminLayoutDashboard() {
  const location = useLocation(); // Hook lấy thông tin đường dẫn (URL) hiện tại của trình duyệt
  const navigate = useNavigate(); // Hook hỗ trợ điều hướng trang programmatic
  const [openMenus, setOpenMenus] = useState({}); // State lưu trữ trạng thái đóng/mở của các menu cha dưới dạng object key-value (index: true/false)

  // useEffect tự động chạy khi đường dẫn URL thay đổi
  useEffect(() => {
    const activeRoute = location.pathname; // Đường dẫn hiện tại của trang (ví dụ: /admin-dashboard/branches)
    const newOpenMenus = {};

    // Duyệt qua danh sách menu để kiểm tra xem có menu con nào đang trùng với URL hiện tại hay không
    menuAdmin.forEach((item, idx) => {
      if (item.children) {
        // Nếu có menu con đang hoạt động, tự động đánh dấu menu cha này ở trạng thái 'true' để bung ra
        newOpenMenus[idx] = item.children.some((child) => child.path === activeRoute);
      }
    });

    // Cập nhật lại state đóng/mở menu nhưng vẫn giữ lại các trạng thái đã thao tác trước đó
    setOpenMenus((prev) => ({ ...prev, ...newOpenMenus }));
  }, [location.pathname]);

  // Hàm toggle (đóng/mở) trạng thái hiển thị của một menu cha dựa theo index của nó
  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Hàm kiểm tra xem một đường dẫn cụ thể có đang trùng với trang hiện tại hay không để áp dụng css active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Component Thanh Header phía trên cùng của Admin */}
      <HeaderAdmin />

      <div className="flex flex-1">
        {/* Thanh Menu điều hướng bên cạnh (Sidebar) */}
        <nav className="w-64 min-h-screen bg-white border-r border-gray-200 shadow-md p-4 flex flex-col gap-2">
          {menuAdmin.map((item, index) => {

            // TRƯỜNG HỢP 1: Menu cấp đơn lẻ (Không có danh sách con `children`, có icon trực tiếp)
            if (item.icon) {
              const Icon = item.icon; // Gán lại icon dưới dạng Component để render hoa văn động
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 border-l-4 ${isActive(item.path)
                    ? "bg-green-100 text-green-700 border-green-500 shadow-sm" // Style khi menu này đang được kích hoạt (Active)
                    : "text-gray-700 border-transparent hover:bg-green-50 hover:text-green-600 hover:border-green-300" // Style mặc định khi hover
                    }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            }

            // TRƯỜNG HỢP 2: Menu dạng nhóm thả xuống (Có danh sách mảng `children`)
            if (item.children) {
              const open = openMenus[index] || false; // Kiểm tra xem menu này có đang được mở ra không
              const firstChildPath = item.children[0]?.path; // Lấy đường dẫn của menu con đầu tiên để tự động chuyển trang khi bấm nút cha
              return (
                <div key={index} className="flex flex-col mb-2">
                  {/* Nút bấm để đóng/mở cụm menu con */}
                  <button
                    onClick={() => {
                      toggleMenu(index); // Đổi trạng thái đóng/mở cụm menu
                      if (firstChildPath) {
                        navigate(firstChildPath); // Tự động điều hướng đến sub-menu đầu tiên của nhóm
                      }
                    }}
                    className="flex justify-between items-center w-full px-4 py-2 text-gray-700 font-semibold rounded-xl hover:bg-green-50 hover:text-green-600 transition-all shadow-sm"
                  >
                    <span>{item.label}</span>
                    {/* Icon mũi tên xoay góc 90 độ khi menu ở trạng thái mở */}
                    <span
                      className={`transform transition-transform duration-200 ${open ? "rotate-90 text-green-500" : ""
                        }`}
                    >
                      &#9654;
                    </span>
                  </button>

                  {/* Vùng hiển thị các menu con (chỉ render ra khi biến `open` là true) */}
                  {open && (
                    <div className="flex flex-col ml-4 mt-1">
                      {item.children.map((child, idx) => {
                        const ChildIcon = child.icon; // Lấy icon của menu con (nếu có)
                        return (
                          <Link
                            key={idx}
                            to={child.path}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive(child.path)
                              ? "bg-green-100 text-green-700 shadow-sm" // Style sub-menu đang active
                              : "text-gray-700 hover:bg-green-50 hover:text-green-600" // Style sub-menu bình thường
                              }`}
                          >
                            {ChildIcon && <ChildIcon size={16} />}
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return null; // Trả về null nếu cấu trúc item menu không hợp lệ
          })}
        </nav>

        {/* Khung nội dung chính của dashboard hiển thị động theo Router con */}
        <main className="flex-1 p-6 bg-gray-50">
          {/* <Outlet /> là nơi các component con cấu hình trong react-router sẽ được render ra */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}