import { useNavigate, useParams, Link } from "react-router-dom"; // SỬA: Import Link từ react-router-dom để điều hướng thay vì lucide-react
import { useEffect, useState } from "react";
import axios from "axios";
import EmployeeForm from "../../components/admin/EmployeeForm"; // Form chứa các trường nhập liệu của nhân viên
import toast from 'react-hot-toast';

export default function EditEmployee() {
  // --- LẤY THAM SỐ URL VÀ KHỞI TẠO ĐIỀU HƯỚNG ---
  const { id } = useParams(); // Trích xuất ID nhân viên từ đường dẫn URL dạng /employees/:id
  const navigate = useNavigate();

  // --- QUẢN LÝ CÁC TRẠNG THÁI (STATES) ---
  const [employee, setEmployee] = useState(null); // Lưu dữ liệu chi tiết của nhân viên cần sửa
  const [branches, setBranches] = useState([]);   // Lưu danh sách chi nhánh để hiển thị trong Select Option của Form

  // SIDE EFFECT: Gọi dữ liệu bất đồng bộ từ API Server khi component mount hoặc khi ID thay đổi
  useEffect(() => {
    // 1. Lấy thông tin hiện tại của nhân viên theo ID để đổ vào Form chỉnh sửa (initialData)
    axios.get(`http://localhost:5000/api/employees/get/${id}`)
      .then((res) => setEmployee(res.data))
      .catch((err) => console.error("Lỗi lấy thông tin nhân viên:", err));

    // 2. Lấy danh sách toàn bộ chi nhánh để gán nhân viên vào làm việc tại cơ sở tương ứng
    axios.get("http://localhost:5000/api/branches/getall")
      .then((res) => setBranches(res.data))
      .catch((err) => console.error("Lỗi lấy danh sách chi nhánh:", err));
  }, [id]);

  // --- HÀM XỬ LÝ API: CẬP NHẬT THÔNG TIN NHÂN VIÊN ---
  const handleSubmit = async (data) => {
    try {
      // Gửi yêu cầu cập nhật thông tin nhân viên (phương thức PUT) lên API Backend
      await axios.put(`http://localhost:5000/api/employees/update/${id}`, data);

      // Hiển thị thông báo Toast thành công màu xanh
      toast.success("Nhân viên đã được cập nhật thành công!");

      // Trì hoãn 0.7 giây giúp người dùng kịp đọc thông báo trước khi tự động chuyển hướng về trang danh sách
      setTimeout(() => navigate("/admin-dashboard/employees"), 700);
    } catch (err) {
      console.error("Lỗi cập nhật nhân viên:", err);
      toast.error("Cập nhật thông tin nhân viên thất bại!");
    }
  };

  // Hiển thị màn hình chờ (Fallback UI) nếu dữ liệu nhân viên từ API chưa được tải xong
  if (!employee) return <p className="p-6 text-center text-gray-500 font-medium">Đang tải thông tin nhân viên...</p>;

  return (
    <div className="p-6">
      {/* Khối Header điều hướng */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cập nhật nhân viên</h1>
        <Link
          to="/admin-dashboard/employees" // SỬA: Thẻ Link của react-router-dom hoạt động chính xác với prop 'to'
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium text-sm"
        >
          Quay lại
        </Link>
      </div>

      {/* Component Form dùng chung cho cả luồng Add/Edit.
        Truyền các dữ liệu ban đầu (initialData) và mảng chi nhánh vào thông qua các React Props.
      */}
      <EmployeeForm
        onSubmit={handleSubmit}
        initialData={employee}
        branches={branches}
      />
    </div>
  );
}