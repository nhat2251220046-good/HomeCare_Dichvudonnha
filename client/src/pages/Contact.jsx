import React, { useState } from "react";
import Meta from "../components/Meta";

export default function Contact() {
  // --- QUẢN LÝ TRẠNG THÁI FORM (STATE) ---
  // Gom các trường dữ liệu của form vào chung một đối tượng Object để tối ưu việc quản lý state
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  // --- HÀM XỬ LÝ SỰ KIỆN THAY ĐỔI INPUT (HANDLERS) ---
  // Kỹ thuật sử dụng Computed Property Name ([e.target.name]) giúp cập nhật đúng trường dựa vào thuộc tính 'name' của thẻ
  const handleChange = (e) => {
    setFormData({
      ...formData,                // Sao chép lại toàn bộ các giá trị hiện tại của form
      [e.target.name]: e.target.value // Chỉ ghi đè giá trị mới lên trường vừa nhập dữ liệu
    });
  };

  // --- HÀM XỬ LÝ GỬI FORM (SUBMIT) ---
  const handleSubmit = (e) => {
    e.preventDefault(); // Chặn hành vi tải lại trang mặc định của thẻ HTML form

    alert("Cảm ơn bạn đã gửi liên hệ!");

    // Đưa toàn bộ các ô nhập liệu về trạng thái chuỗi rỗng sau khi gửi dữ liệu thành công
    setFormData({ name: "", email: "", message: "" });
  };

  // --- GIAO DIỆN CHÍNH (RENDER) ---
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Tiêu đề trang động cho tab trình duyệt, hỗ trợ SEO */}
      <Meta title={"Liên hệ"} />

      {/* KHU VỰC 1: BANNER TIÊU ĐỀ ĐẦU TRANG */}
      <div className="bg-gradient-to-r from-teal-600 to-green-500 text-white py-20 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên hệ với chúng tôi</h1>
        <p className="text-lg md:text-xl max-w-2xl text-center px-4">
          Nếu bạn có câu hỏi hoặc cần hỗ trợ, vui lòng gửi thông tin cho chúng tôi.
        </p>
      </div>

      {/* KHU VỰC 2: NỘI DUNG CHÍNH (Chia thành 2 cột trên giao diện Desktop máy tính) */}
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* CỘT TRÁI: FORM GỬI TIN NHẮN PHẢN HỒI */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-teal-600">Gửi tin nhắn</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input Họ và tên */}
            <input
              type="text"
              name="name" // Trùng khớp hoàn toàn với thuộc tính trong state formData
              value={formData.name}
              onChange={handleChange}
              placeholder="Họ và tên"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff8228] transition"
              required // Bắt buộc người dùng phải điền dữ liệu trước khi submit
            />

            {/* Input Email */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff8228] transition"
              required
            />

            {/* Textarea Nhập nội dung tin nhắn */}
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Nội dung"
              rows="5" // Định kích thước chiều cao ban đầu của khung text là 5 dòng
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff8228] transition"
              required
            />

            {/* Nút gửi thông tin */}
            <button
              type="submit"
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-all duration-300"
            >
              Gửi liên hệ
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: THÔNG TIN LIÊN HỆ & BẢN ĐỒ VỊ TRÍ */}
        <div className="flex flex-col gap-6">
          {/* Thông tin chữ văn bản */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-teal-600">Thông tin liên hệ</h2>
            <p className="text-gray-600 text-sm mb-2 font-medium">Hotline: 1800 5030</p>
            <p className="text-gray-600 text-sm mb-2 font-medium">Email: support@gmail.com</p>
            <p className="text-gray-600 text-sm mb-2 font-medium">Địa chỉ: 111 Xô Viết Nghệ Tĩnh, TP Đà Nẵng</p>
          </div>

          {/* Bản đồ Iframe thu nhỏ (Embedded Google Map) */}
          <div className="w-full h-64 border rounded-lg overflow-hidden shadow-sm">
            <iframe
              title="Bản đồ"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.123456!2d106.123456!3d10.123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z4oCcVHJ1bmcgVGVzdA!5e0!3m2!1sen!2s!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy" // Kỹ thuật trì hoãn tải map cho đến khi người dùng cuộn trang tới vị trí này
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  );
}