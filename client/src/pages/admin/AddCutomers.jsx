import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import EmployeeForm from "../../components/admin/CustomerForm";
import { Link } from "lucide-react"; // Lưu ý: Nếu Link này dùng để chuyển hướng, bạn nên import từ "react-router-dom" thay vì "lucide-react" (lucide-react thường là icon)
import toast from "react-hot-toast";

export default function AddCutomers() {
  const navigate = useNavigate();

  // State lưu trữ danh sách các chi nhánh nhận về từ API
  const [branches, setBranches] = useState([]);

  // useEffect dùng để gọi API lấy danh sách chi nhánh ngay khi component được render lần đầu tiên
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/branches/getall")
      .then((res) => setBranches(res.data))
      .catch((err) => console.error("Lỗi lấy danh sách chi nhánh:", err));
  }, []);

  // Hàm xử lý khi người dùng ấn submit form để thêm nhân viên mới
  const handleSubmit = async (data) => {
    try {
      // Gửi yêu cầu POST chứa dữ liệu nhân viên lên server
      await axios.post("http://localhost:5000/api/auth/create", data);

      // Hiển thị thông báo thành công xanh giao diện
      toast.success("Nhân viên đã tạo thành công!");

      // Chờ 0.7 giây (để người dùng kịp nhìn thấy thông báo) rồi chuyển hướng về trang quản lý
      setTimeout(() => navigate("/admin-dashboard/auth"), 700);
    } catch (err) {
      // Log lỗi ra console nếu quá trình gọi API thất bại
      console.error("Lỗi thêm nhân viên:", err);
      toast.error("Có lỗi xảy ra khi thêm nhân viên!");
    }
  };

  return (
    <div className="p-6">
      {/* Phần tiêu đề và nút quay lại */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Thêm nhân viên mới</h1>
        <Link
          to="/admin-dashboard/employees"
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Quay lại
        </Link>
      </div>

      {/* Component Form nhập liệu, truyền vào hàm xử lý submit và danh sách chi nhánh */}
      <EmployeeForm onSubmit={handleSubmit} branches={branches} />
    </div>
  );
}