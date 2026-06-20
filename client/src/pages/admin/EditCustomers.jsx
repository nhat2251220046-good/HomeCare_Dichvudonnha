import { useNavigate, useParams, Link } from "react-router-dom"; // SỬA: Import Link từ react-router-dom thay vì lucide-react
import { useEffect, useState } from "react";
import axios from "axios";
import CustomerForm from "../../components/admin/CustomerForm"; // ĐỔI TÊN: EmployeeForm -> CustomerForm cho đúng ngữ cảnh
import toast from 'react-hot-toast';

export default function EditCustomers() {
  // --- LẤY THAM SỐ TRÊN URL & HOOK ĐIỀU HƯỚNG ---
  const { id } = useParams(); // Lấy ID khách hàng từ URL path parameter
  const navigate = useNavigate();

  // --- QUẢN LÝ CÁC TRẠNG THÁI (STATES) ---
  const [customer, setCustomer] = useState(null); // ĐỔI TÊN: employee -> customer
  const [branches, setBranches] = useState([]);

  // SIDE EFFECT: Gọi API lấy dữ liệu chi tiết khách hàng và danh sách chi nhánh khi ID thay đổi
  useEffect(() => {
    // Lấy thông tin chi tiết của khách hàng cụ thể theo ID
    axios.get(`http://localhost:5000/api/customers/get/${id}`)
      .then((res) => setCustomer(res.data))
      .catch((err) => console.error("Lỗi lấy thông tin khách hàng:", err));

    // Lấy danh sách các chi nhánh (phục vụ trường hợp form cần chọn chi nhánh quản lý)
    axios.get("http://localhost:5000/api/branches/getall")
      .then((res) => setBranches(res.data))
      .catch((err) => console.error("Lỗi lấy danh sách chi nhánh:", err));
  }, [id]);

  // --- HÀM XỬ LÝ API: GỬI DỮ LIỆU CẬP NHẬT LÊN SERVER ---
  const handleSubmit = async (data) => {
    try {
      // Gọi API gửi yêu cầu cập nhật thông tin khách hàng (phương thức PUT)
      await axios.put(`http://localhost:5000/api/customers/update/${id}`, data);

      toast.success("Khách hàng đã được cập nhật thành công!"); // SỬA: Đổi nội dung thông báo thành "Khách hàng"

      // Delay nhẹ 0.7 giây để người dùng kịp nhìn thấy thông báo toast trước khi chuyển trang
      setTimeout(() => navigate("/admin-dashboard/customers"), 700); // SỬA: Điều hướng về danh sách khách hàng
    } catch (err) {
      console.error("Lỗi cập nhật khách hàng:", err);
      toast.error("Cập nhật thông tin thất bại!");
    }
  };

  // Hiển thị trạng thái chờ nếu API chưa trả về xong dữ liệu cấu trúc khách hàng
  if (!customer) return <p className="p-6 text-center text-gray-500 font-medium">Đang tải thông tin khách hàng...</p>;

  return (
    <div className="p-6">
      {/* Khối thanh tiêu đề hành chính */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cập nhật khách hàng</h1> {/* SỬA: Tiêu đề hợp lý */}
        <Link
          to="/admin-dashboard/customers" // SỬA: Quay lại trang quản lý khách hàng
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium text-sm"
        >
          Quay lại
        </Link>
      </div>

      {/* Form chỉnh sửa dữ liệu được truyền các props cấu hình cần thiết */}
      <CustomerForm
        onSubmit={handleSubmit}
        initialData={customer}
        branches={branches}
      />
    </div>
  );
}