import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function BranchForm() {
  // Khởi tạo state lưu trữ dữ liệu của form chi nhánh
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    revenue: 0,
  });

  const navigate = useNavigate(); // Hook điều hướng trang của react-router-dom
  const { id } = useParams(); // Lấy id từ URL. Nếu có id => đang ở chế độ chỉnh sửa (Update), ngược lại là thêm mới (Create)

  // useEffect tự động chạy khi component mount hoặc khi id thay đổi
  useEffect(() => {
    // Nếu có id trên URL, tiến hành gọi API lấy thông tin chi tiết chi nhánh để đổ vào form
    if (id) {
      axios.get(`http://localhost:5000/api/branches/get/${id}`).then((res) => {
        setForm(res.data); // Cập nhật dữ liệu nhận được từ API vào state form
      });
    }
  }, [id]);

  // Hàm xử lý sự kiện khi người dùng thay đổi giá trị trong các ô input
  const handleChange = (e) => {
    // Cập nhật thuộc tính tương ứng (dựa vào thuộc tính 'name' của input) trong state form
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi người dùng submit (ấn nút gửi) form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi reload trang mặc định của form
    try {
      if (id) {
        // Nếu có id: Thực hiện gọi API PUT để cập nhật thông tin chi nhánh
        await axios.put(`http://localhost:5000/api/branches/update/${id}`, form);
        toast.success("Cập nhật chi nhánh thành công!"); // Hiển thị thông báo thành công
      } else {
        // Nếu không có id: Thực hiện gọi API POST để tạo mới chi nhánh
        await axios.post("http://localhost:5000/api/branches/create", form);
        toast.success("Thêm chi nhánh thành công!"); // Hiển thị thông báo thành công
      }
      // Sau khi xử lý API thành công, điều hướng người dùng về trang danh sách chi nhánh
      navigate("/admin-dashboard/branches");
    } catch (err) {
      // Log lỗi ra console nếu quá trình lưu dữ liệu thất bại
      console.error("Error saving branch:", err);
    }
  };

  return (
    <div className="w-full bg-white shadow-md p-8 rounded-lg">
      {/* Tiêu đề thay đổi linh hoạt tùy thuộc vào việc đang thêm mới hay cập nhật */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {id ? "Cập nhật chi nhánh" : "Thêm chi nhánh mới"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 w-full">
        {/* Tên chi nhánh */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Tên chi nhánh
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nhập tên chi nhánh"
            className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring focus:ring-indigo-200 focus:border-indigo-500"
            required
          />
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Địa chỉ</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ"
            className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring focus:ring-indigo-200 focus:border-indigo-500"
            required
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Số điện thoại
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
            className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring focus:ring-indigo-200 focus:border-indigo-500"
          />
        </div>

        {/* Doanh thu */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Doanh thu
          </label>
          <input
            type="number"
            name="revenue"
            value={form.revenue}
            onChange={handleChange}
            placeholder="Nhập doanh thu"
            className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring focus:ring-indigo-200 focus:border-indigo-500"
          />
        </div>

        {/* Nút submit - Chữ hiển thị thay đổi động theo trạng thái id */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
        >
          {id ? "Cập nhật" : "Thêm mới"}
        </button>
      </form>
    </div>
  );
}