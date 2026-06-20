import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ServiceForm() {
  // Khởi tạo state lưu trữ dữ liệu của form dịch vụ
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    // duration: 0,
    active: true,
  });

  const navigate = useNavigate(); // Hook hỗ trợ chuyển hướng trang
  const { id } = useParams(); // Lấy mã id từ thanh URL. Nếu tồn tại id => Đang cập nhật, ngược lại => Thêm mới

  // useEffect tự động kích hoạt khi component được tải hoặc khi id thay đổi
  useEffect(() => {
    // Nếu có id trên URL, thực hiện gọi API để lấy thông tin chi tiết của dịch vụ đổ lại vào form
    if (id) {
      axios.get(`http://localhost:5000/api/services/get/${id}`).then((res) => {
        setForm(res.data); // Cập nhật dữ liệu từ backend vào state form
      });
    }
  }, [id]);

  // Hàm xử lý chung khi người dùng thay đổi dữ liệu trong các ô nhập liệu
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      // Kiểm tra kiểu input: Nếu là checkbox thì lấy giá trị 'checked' (true/false), ngược lại lấy 'value' dạng chữ/số
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Hàm xử lý khi người dùng ấn nút gửi form (Submit)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn sự kiện reload trang mặc định của form HTML
    try {
      if (id) {
        // Chế độ Cập nhật: Thực hiện gọi API PUT để lưu thông tin chỉnh sửa
        await axios.put(`http://localhost:5000/api/services/update/${id}`, form);
        toast.success("Cập nhật dịch vụ thành công!");
      } else {
        // Chế độ Tạo mới: Thực hiện gọi API POST để thêm một dịch vụ mới
        await axios.post("http://localhost:5000/api/services/create", form);
        toast.success("Thêm dịch vụ mới thành công!");
      }
      // Sau khi xử lý API thành công, điều hướng người dùng quay trở lại trang quản lý danh sách dịch vụ
      navigate("/admin-dashboard/services");
    } catch (err) {
      // Ghi nhận lỗi ra tab console nếu quá trình gửi dữ liệu lên server thất bại
      console.error("Error saving service:", err);
    }
  };

  return (
    <div className="w-full bg-white shadow-md p-8 rounded-lg">
      {/* Tiêu đề động hiển thị tùy thuộc vào tác vụ Thêm hay Sửa */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {id ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 w-full">
        {/* Tên dịch vụ */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Tên dịch vụ</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nhập tên dịch vụ"
            className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring focus:ring-indigo-200 focus:border-indigo-500"
            required
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả dịch vụ"
            className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring focus:ring-indigo-200 focus:border-indigo-500"
          />
        </div>

        {/* Giá */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Giá (VNĐ)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Nhập giá dịch vụ"
            className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring focus:ring-indigo-200 focus:border-indigo-500"
            required
          />
        </div>

        {/* Thời lượng */}
        {/* <div>
          <label className="block mb-1 font-medium text-gray-700">Thời lượng (phút)</label>
          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            placeholder="Nhập thời lượng"
            className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring focus:ring-indigo-200 focus:border-indigo-500"
          />
        </div> */}

        {/* Trạng thái hoạt động */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
            className="w-5 h-5"
          />
          <label className="font-medium text-gray-700">Dịch vụ hoạt động</label>
        </div>

        {/* Nút submit */}
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