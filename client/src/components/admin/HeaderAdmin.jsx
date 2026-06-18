import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { User, LogOut, Home } from "lucide-react"; // Import các icon từ thư viện lucide-react

export default function HeaderService() {
  // 1. KHỞI TẠO CÁC STATE VÀ REF
  const [user, setUser] = useState(null); // State lưu trữ thông tin người dùng hiện tại
  const [open, setOpen] = useState(false); // State quản lý trạng thái Đóng/Mở của Dropdown Menu
  const navigate = useNavigate(); // Hook hỗ trợ chuyển hướng trang trong React Router
  const dropdownRef = useRef(null); // Ref dùng để gắn vào thẻ DOM của Dropdown, phục vụ việc bắt sự kiện click ra ngoài

  // 2. USEEFFECT: XỬ LÝ LẤY DATA KHI LÀM MỚI TRANG VÀ ĐÓNG MENU KHI CLICK RA NGOÀI
  useEffect(() => {
    // Lấy thông tin user đã lưu trong sessionStorage (nếu có) và parse từ chuỗi JSON thành Object
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    // Hàm kiểm tra nếu click chuột ra ngoài vùng Dropdown thì sẽ tự động đóng menu
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false); // Đóng menu dropdown
      }
    };

    // Đăng ký sự kiện click chuột (mousedown) trên toàn bộ tài liệu (document)
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup function: Hủy bỏ sự kiện khi component bị unmount để tránh rò rỉ bộ nhớ (memory leak)
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. HÀM XỬ LÝ ĐĂNG XUẤT (LOGOUT)
  const handleLogout = () => {
    sessionStorage.removeItem("user"); // Xóa thông tin user khỏi sessionStorage
    navigate("/manager-login"); // Điều hướng người dùng quay lại trang đăng nhập của quản lý
  };

  // 4. GIAO DIỆN COMPONENT (RENDER HTML)
  return (
    <header className="bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-3">

        {/* LOGO VÀ LIÊN KẾT ĐẾN TRANG DASHBOARD CHÍNH */}
        <Link to="/admin-dashboard" className="flex items-center gap-2">
          <Home size={28} className="text-white" />
          <h2 className="text-2xl sm:text-3xl font-bold">CleanService</h2>
          <span className="hidden sm:inline text-white/80 font-medium">Quản lý</span>
        </Link>

        {/* KHU VỰC DROPDOWN THÔNG TIN USER (Chỉ hiển thị khi đã đăng nhập / có biến user) */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            {/* Nút bấm hiển thị Avatar và Tên của User, kích hoạt đóng/mở menu */}
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition shadow-sm backdrop-blur"
            >
              <img
                src={
                  user.imageUrl ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=50" // Ảnh mặc định nếu user chưa có ảnh riêng
                }
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <span className="font-semibold">{user.name}</span>
            </button>

            {/* DANH SÁCH MENU DROPDOWN (Chỉ hiển thị khi state open = true) */}
            {open && (
              <ul className="absolute right-0 mt-2 w-48 bg-white text-gray-800 border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                {/* Liên kết đến trang Hồ sơ cá nhân */}
                <li>
                  <Link
                    to="/admin-dashboard/profile"
                    onClick={() => setOpen(false)} // Tự động đóng menu sau khi click chọn link
                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition"
                  >
                    <User size={18} className="text-green-500" /> Hồ sơ
                  </Link>
                </li>
                {/* Nút thực hiện Đăng xuất */}
                <li
                  className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer transition text-red-500"
                  onClick={handleLogout}
                >
                  <LogOut size={18} /> Đăng xuất
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  );
}