import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Meta from "../../components/Meta";
import toast from "react-hot-toast";
import { Home, Key } from "lucide-react";

export default function LoginService() {
  // --- QUẢN LÝ CÁC TRẠNG THÁI (STATES) ---
  const [form, setForm] = useState({ email: "", password: "" }); // State lưu trữ thông tin biểu mẫu
  const [loading, setLoading] = useState(false);                 // Quản lý hiệu ứng chờ khi gọi API kiểm tra thông tin
  const navigate = useNavigate();

  // Cập nhật State biểu mẫu động dựa trên thuộc tính 'name' của từng thẻ input
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // --- HÀM XỬ LÝ SỰ KIỆN: GỬI BIỂU MẪU ĐĂNG NHẬP (SUBMIT FORM) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi reload trang mặc định của thẻ <form>
    setLoading(true);

    try {
      // Gửi thông tin tài khoản qua API với cấu hình nhận cookie định danh (withCredentials)
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form,
        { withCredentials: true }
      );

      const user = res.data.employee;

      // Lưu trữ thông tin cơ bản của người dùng vào Session Storage (Mất đi khi đóng trình duyệt)
      sessionStorage.setItem("user", JSON.stringify(user));

      // Bắn thông báo đăng nhập kèm chức vụ
      toast.success(`Đăng nhập thành công với vai trò: ${user.role}`, { duration: 3000 });

      // ĐIỀU HƯỚNG ROUTER THEO PHÂN QUYỀN (ROLE-BASED REDIRECTION)
      // Sử dụng thuộc tính replace: true nhằm xóa lịch sử trang login, tránh việc ấn nút Back quay lại login sau khi vào dashboard
      if (user.role === "admin") navigate("/admin-dashboard", { replace: true });
      else if (user.role === "manager") navigate("/manager-dashboard", { replace: true });
      else navigate("/staff-dashboard", { replace: true });

    } catch (err) {
      // Trích xuất thông báo lỗi chi tiết từ backend nếu có, ngược lại dùng chuỗi mặc định
      const message = err.response?.data?.message || "Đăng nhập thất bại! Vui lòng thử lại.";
      toast.error(message, { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  // --- SIDE EFFECT: TỰ ĐỘNG ĐIỀU HƯỚNG NẾU ĐÃ CÓ PHIÊN ĐĂNG NHẬP CŨ (AUTO-LOGIN) ---
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);

      // FIX: Bổ sung đầy đủ cả 3 vai trò (Đặc biệt là manager bị thiếu ở bản gốc) để tránh kẹt giao diện khi tải lại trang
      if (user.role === "admin") navigate("/admin-dashboard", { replace: true });
      else if (user.role === "manager") navigate("/manager-dashboard", { replace: true });
      else if (user.role === "staff") navigate("/staff-dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1470&q=80')",
      }}
    >
      {/* Component quản lý thẻ Head HTML (SEO & Title) */}
      <Meta title="Đăng nhập dịch vụ dọn nhà" description="Đăng nhập hệ thống" />

      {/* Lớp phủ mờ màu tối giúp form đăng nhập nổi bật hơn trên nền ảnh */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 p-6">
        {/* Khối hình ảnh minh họa bên trái (Chỉ hiển thị từ màn hình máy tính bảng/PC trở lên) */}
        <div className="hidden md:flex flex-col items-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2907/2907043.png"
            alt="house cleaning"
            className="w-64 h-64 object-contain animate-fadeIn"
          />
          <p className="mt-4 text-gray-100 text-center max-w-xs font-light">
            Quản lý dịch vụ dọn nhà chuyên nghiệp, nhanh chóng và đáng tin cậy.
          </p>
        </div>

        {/* Khối Card chứa biểu mẫu đăng nhập (Hiệu ứng kính mờ Backdrop Blur thời thượng) */}
        <div className="bg-gradient-to-br from-white/80 to-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-80 md:w-96 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">
            Đăng nhập hệ thống
          </h2>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            {/* Input điền Tài khoản / Email */}
            <div className="flex items-center border border-gray-300 rounded-xl px-4 h-12 focus-within:border-blue-400 transition-colors bg-white/60">
              <Home className="text-gray-400 mr-2" />
              <input
                type="text"
                name="email"
                placeholder="Email hoặc tên đăng nhập"
                value={form.email}
                onChange={handleChange}
                className="outline-none w-full text-gray-700 placeholder-gray-400 bg-transparent"
                required
              />
            </div>

            {/* Input điền Mật khẩu */}
            <div className="flex items-center border border-gray-300 rounded-xl px-4 h-12 focus-within:border-blue-400 transition-colors bg-white/60">
              <Key className="text-gray-400 mr-2" />
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={handleChange}
                className="outline-none w-full text-gray-700 placeholder-gray-400 bg-transparent"
                required
              />
            </div>

            {/* Nút nhấn gửi biểu mẫu dữ liệu */}
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-green-400 hover:opacity-95 text-white h-12 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="mt-6 text-gray-500 text-sm text-center">
            Dịch vụ dọn nhà chuyên nghiệp - sạch sẽ và nhanh chóng
          </p>
        </div>
      </div>
    </div>
  );
}