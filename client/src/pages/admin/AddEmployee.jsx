import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import EmployeeForm from "../../components/admin/EmployeeForm";
import { Link } from "react-router-dom"; // Đã sửa lỗi import Link từ "lucide-react" sang "react-router-dom" để component chạy đúng
import toast from "react-hot-toast";

export default function AddEmployee() {
  const navigate = useNavigate();

  // Khởi tạo state để lưu trữ danh sách các chi nhánh (branches) phục vụ cho form chọn lựa
  const [branches, setBranches] = useState([]);

  // Gọi API lấy danh sách toàn bộ chi nhánh ngay sau khi component được hiển thị (render) lần đầu
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/branches/getall")
      .then((res) => setBranches(res.data))
      .catch((err) => console.error("Lỗi lấy danh sách chi nhánh:", err)); // Thêm catch để tránh crash ứng dụng khi lỗi API
  }, []);

  // Hàm xử lý sự kiện submit dữ liệu form để thêm mới nhân viên
  const handleSubmit = async (data) => {
    try {
      // Gửi request POST kèm theo dữ liệu nhân viên (data) lên server
      await axios.post("http://localhost:5000/api/employees/create", data);

      // Hiển thị thông báo thành công dạng toast
      toast.success("Nhân viên đã tạo thành công!");

      // Trì hoãn 0.7 giây để người dùng kịp nhìn thấy thông báo thành công, sau đó chuyển hướng về trang danh sách nhân viên
      setTimeout(() => navigate("/admin-dashboard/employees"), 700);
    } catch (err) {
      // Log lỗi chi tiết ra console và thông báo thất bại cho người dùng nếu xảy ra lỗi hệ thống
      console.error("Lỗi thêm nhân viên:", err);
      toast.error("Có lỗi xảy ra khi thêm nhân viên!");
    }
  };

  return (
    <div className="p-6">
      {/* Khu vực Header của trang: Gồm tiêu đề và nút quay lại */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Thêm nhân viên mới</h1>
        <Link
          to="/admin-dashboard/employees"
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Quay lại
        </Link>
      </div>

      {/* Truyền hàm handleSubmit và mảng dữ liệu chi nhánh vào Component Form nhập liệu của Nhân viên */}
      <EmployeeForm onSubmit={handleSubmit} branches={branches} />
    </div>
  );
}