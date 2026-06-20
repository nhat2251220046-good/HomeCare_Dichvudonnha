import { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Phone, Briefcase, Building2, Clock } from "lucide-react";

export default function ProfilePage() {
  // --- QUẢN LÝ TRẠNG THÁI (STATES) ---
  const [employee, setEmployee] = useState(null); // State lưu trữ toàn bộ hồ sơ chi tiết của nhân viên hiện tại

  // SIDE EFFECT: Lấy định danh từ session và gọi API truy vấn thông tin chi tiết
  useEffect(() => {
    // Trích xuất chuỗi JSON từ sessionStorage và chuyển đổi ngược thành Object
    const user = JSON.parse(sessionStorage.getItem("user"));
    console.log("Phiên đăng nhập hiện tại: ", user);

    if (user) {
      // TỐI ƯU LOGIC: Kiểm tra cả _id (MongoDB mặc định) và id để tránh lỗi gọi API sai đường dẫn
      const userId = user._id || user.id;

      axios
        .get(`http://localhost:5000/api/employees/get/${userId}`)
        .then((res) => setEmployee(res.data))
        .catch((err) => console.error("Lỗi khi lấy thông tin hồ sơ:", err));
    }
  }, []);

  // FALLBACK UI: Hiển thị màn hình chờ khi API đang thực hiện tải dữ liệu
  if (!employee) return <p className="p-6 text-center text-gray-500 font-medium">Đang tải hồ sơ nhân viên...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">

      {/* ================= KHỐI THÔNG TIN CƠ BẢN (PROFILE CARD) ================= */}
      <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-all duration-300">
        {/* Ảnh đại diện (Avatar): Ưu tiên dùng ảnh từ DB, nếu trống sẽ tự tạo ảnh động theo tên chữ cái đầu */}
        <img
          src={
            employee.avatar ||
            "https://ui-avatars.com/api/?background=random&color=fff&name=" + encodeURIComponent(employee.name)
          }
          alt={employee.name}
          className="w-24 h-24 rounded-full border-4 border-indigo-100 object-cover shadow-sm"
        />

        {/* Danh sách thông tin chi tiết */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{employee.name}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-gray-600 text-sm">
            <p className="flex items-center justify-center sm:justify-start gap-2 py-1">
              <Mail size={16} className="text-indigo-500" /> <span className="truncate">{employee.email}</span>
            </p>
            <p className="flex items-center justify-center sm:justify-start gap-2 py-1">
              <Phone size={16} className="text-indigo-500" /> {employee.phone || "Chưa có số điện thoại"}
            </p>
            <p className="flex items-center justify-center sm:justify-start gap-2 py-1">
              <Briefcase size={16} className="text-indigo-500" />
              <span>Vai trò: <strong className="capitalize text-gray-800">{employee.role}</strong></span>
            </p>
            <p className="flex items-center justify-center sm:justify-start gap-2 py-1">
              <Building2 size={16} className="text-indigo-500" />
              <span>Chi nhánh: <strong className="text-gray-800">{employee.branch?.name || "Chưa được gán"}</strong></span>
            </p>
          </div>
        </div>
      </div>

      {/* ================= KHỐI LỊCH SỬ CA LÀM (SHIFT HISTORY) ================= */}
      <div className="mt-8 bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Clock size={20} className="text-indigo-600" />
          Lịch sử ca làm việc
        </h2>

        {/* Kiểm tra sự tồn tại của mảng danh sách ca làm việc */}
        {employee.shifts && employee.shifts.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Ngày làm việc</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Giờ bắt đầu</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Giờ kết thúc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {employee.shifts.map((shift, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    {/* Định dạng lại dữ liệu chuỗi ngày tháng sang chuẩn hiển thị của Việt Nam (DD/MM/YYYY) */}
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {new Date(shift.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{shift.startTime}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{shift.endTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Giao diện thay thế trong trường hợp mảng trống hoặc không tồn tại dữ liệu ca làm */
          <p className="text-gray-500 text-center py-6 font-light italic">
            Chưa có ca làm nào được phân công hoặc ghi nhận trong hệ thống.
          </p>
        )}
      </div>
    </div>
  );
}