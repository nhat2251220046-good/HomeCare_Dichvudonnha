import { useState } from "react";

export default function FeedbackPage() {
  // --- QUẢN LÝ TRẠNG THÁI (STATES) ---
  // State form lưu trữ toàn bộ giá trị nhập liệu từ các ô input, select và textarea
  const [form, setForm] = useState({
    customerName: "",
    service: "",
    rating: "",
    comment: "",
  });

  // State quản lý việc hiển thị thông báo "Đã gửi thành công" (Alert banner)
  const [submitted, setSubmitted] = useState(false);

  // --- XỬ LÝ SỰ KIỆN NHẬP LIỆU (HANDLERS) ---
  // Hàm cập nhật trạng thái động khi người dùng thay đổi dữ liệu trong form (Computed Property Names)
  const handleChange = (e) => {
    setForm({
      ...form, // Sao chép lại toàn bộ các trường hiện có trong form
      [e.target.name]: e.target.value, // Cập nhật riêng trường dữ liệu đang được chỉnh sửa theo thuộc tính 'name'
    });
  };

  // Hàm xử lý khi người dùng nhấn nút "Gửi phản hồi"
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi tải lại trang (reload) mặc định của trình duyệt khi submit form

    // Tạm thời log dữ liệu phản hồi ra console (Sau này có thể tích hợp gọi API axios.post lên backend tại đây)
    console.log("Feedback submitted:", form);

    setSubmitted(true); // Kích hoạt hiển thị thông báo gửi thành công cho khách hàng thấy

    // Reset toàn bộ các ô nhập liệu trong form về chuỗi rỗng sau khi gửi thành công
    setForm({
      customerName: "",
      service: "",
      rating: "",
      comment: "",
    });
  };

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Tiêu đề trang phản hồi */}
      <h1 className="text-2xl font-bold mb-6 text-center">
        Gửi phản hồi dịch vụ
      </h1>

      {/* Hiển thị Banner thông báo màu xanh khi state submitted chuyển sang true */}
      {submitted && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
          ✅ Cảm ơn bạn đã gửi phản hồi!
        </div>
      )}

      {/* KHU VỰC FORM PHẢN HỒI */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        {/* Trường 1: Nhập Tên khách hàng */}
        <div>
          <label className="block mb-1 font-medium">Tên khách hàng</label>
          <input
            type="text"
            name="customerName" // Trùng khớp với key trong useState
            value={form.customerName} // Ràng buộc dữ liệu 2 chiều (2-way data binding)
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Nhập tên của bạn"
            required // Bắt buộc người dùng phải điền vào ô này
          />
        </div>

        {/* Trường 2: Nhập Tên dịch vụ */}
        <div>
          <label className="block mb-1 font-medium">Dịch vụ</label>
          <input
            type="text"
            name="service"
            value={form.service}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Tên dịch vụ đã sử dụng"
            required
          />
        </div>

        {/* Trường 3: Chọn mức độ Đánh giá (Dropdown Select) */}
        <div>
          <label className="block mb-1 font-medium">Đánh giá</label>
          <select
            name="rating"
            value={form.rating}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Chọn đánh giá</option>
            <option value="5">⭐⭐⭐⭐⭐ - Rất hài lòng</option>
            <option value="4">⭐⭐⭐⭐ - Hài lòng</option>
            <option value="3">⭐⭐⭐ - Bình thường</option>
            <option value="2">⭐⭐ - Chưa tốt</option>
            <option value="1">⭐ - Tệ</option>
          </select>
        </div>

        {/* Trường 4: Nhập Ý kiến phản hồi chi tiết */}
        <div>
          <label className="block mb-1 font-medium">Phản hồi</label>
          <textarea
            name="comment"
            value={form.comment}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Viết phản hồi của bạn..."
            rows="4" // Số dòng hiển thị mặc định của ô Textarea
            required
          />
        </div>

        {/* Nút Submit điều hướng toàn bộ form */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Gửi phản hồi
        </button>
      </form>
    </div>
  );
}