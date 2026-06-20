import { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Phone, Briefcase, Building2 } from "lucide-react";
import Meta from "../../components/Meta";

export default function ProfileStaffPage() {
  // --- QUẢN LÝ TRẠNG THÁI (STATES) ---
  const [employee, setEmployee] = useState(null); // Lưu trữ toàn bộ thông tin hồ sơ nhân viên
  const [loading, setLoading] = useState(true); // Trạng thái chờ tải dữ liệu ban đầu

  // --- HÀM LOGIC CHÍNH: LẤY DỮ LIỆU HỒ SƠ ---
  const fetchProfile = async () => {
    try {
      setLoading(true); // Bật trạng thái loading khi bắt đầu kéo dữ liệu

      // Đọc thông tin user đang đăng nhập hiện tại từ sessionStorage
      const sessionUser = JSON.parse(sessionStorage.getItem("user"));

      // Nếu không tìm thấy thông tin session hợp lệ hoặc không có ID, dừng tiến trình
      if (!sessionUser?.id) return;

      // Gọi API lấy dữ liệu nhân viên chi tiết theo ID từ Back-end
      const employeeRes = await axios.get(`http://localhost:5000/api/employees/get/${sessionUser.id}`);
      setEmployee(employeeRes.data); // Cập nhật dữ liệu nhân viên vào State
    } catch (err) {
      console.error("Lỗi khi lấy thông tin hồ sơ:", err);
    } finally {
      setLoading(false); // Đảm bảo luôn tắt trạng thái loading dù API thành công hay thất bại
    }
  };

  // --- SIDE EFFECT: TỰ ĐỘNG CHẠY KHI COMPONENT MOUNT ---
  useEffect(() => {
    fetchProfile(); // Thực thi hàm lấy hồ sơ ngay khi trang được tải lần đầu tiên
  }, []);

  // --- TRẠNG THÁI 1: ĐANG TẢI DỮ LIỆU ---
  if (loading) return <p className="p-6 text-center">⏳ Đang tải hồ sơ...</p>;

  // --- TRẠNG THÁI 2: KHÔNG TÌM THẤY DỮ LIỆU ---
  if (!employee) return <p className="p-6 text-center">Không tìm thấy thông tin nhân viên...</p>;

  // --- HÀM TÁI TẢI DỮ LIỆU (MANUAL REFRESH) ---
  // Hàm xử lý sự kiện khi nhân viên chủ động nhấn nút "Làm mới thông tin"
  const refreshProfile = async () => {
    await fetchProfile();
  };

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="mx-auto p-8">
      {/* Component cập nhật tiêu đề tài liệu SEO động cho trang cá nhân */}
      <Meta title={`Hồ sơ - ${employee?.name}`} />

      {/* KHU VỰC TIÊU ĐỀ & NÚT REFRESH */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Trang cá nhân của bạn</h1>
        <button
          onClick={refreshProfile}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
        >
          Làm mới thông tin
        </button>
      </div>

      {/* THÔNG TIN HỒ SƠ CHI TIẾT dạng Card */}
      <div className="bg-white shadow rounded-lg p-6 flex items-start gap-6">
        {/* Ảnh đại diện (Avatar) - Dự phòng bằng UI Avatars API theo tên nếu không có avatarUrl */}
        <img
          src={
            employee.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}`
          }
          alt={employee.name}
          className="w-24 h-24 rounded-full border-2 border-indigo-500 object-cover"
        />

        {/* Khối văn bản hiển thị các trường thông tin cá nhân kèm Icon từ lucide-react */}
        <div>
          {/* Tên nhân viên */}
          <h1 className="text-2xl font-bold text-gray-800">{employee.name}</h1>

          {/* Email liên hệ */}
          <p className="text-gray-600 flex py-1 items-center gap-2">
            <Mail size={16} /> {employee.email}
          </p>

          {/* Số điện thoại (Hiển thị text dự phòng nếu dữ liệu rỗng) */}
          <p className="text-gray-600 flex py-1 items-center gap-2">
            <Phone size={16} /> {employee.phone || "Chưa có số điện thoại"}
          </p>

          {/* Vai trò / Chức vụ trong hệ thống (In hoa chữ cái đầu bằng class capitalize) */}
          <p className="text-gray-600 flex py-1 items-center gap-2">
            <Briefcase size={16} /> Vai trò: <span className="capitalize">{employee.role}</span>
          </p>

          {/* Chi nhánh làm việc (Kiểm tra điều kiện lồng chuỗi an toàn nhờ Optional Chaining) */}
          <p className="text-gray-600 flex py-1 items-center gap-2">
            <Building2 size={16} /> Chi nhánh: {employee.branch?.name || "Chưa được gán"}
          </p>
        </div>
      </div>
    </div>
  );
}