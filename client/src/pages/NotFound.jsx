import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    // Container chính: Căn giữa nội dung, tạo khoảng cách phía trên (mt-20) và thiết lập nền xanh nhạt (bg-green-50)
    <div className="flex flex-col items-center justify-center container mx-auto mt-20 bg-green-50 px-4">

      {/* Vùng chứa nội dung text và hình ảnh */}
      <div className="text-center">
        {/* Mã lỗi 404 kích thước siêu lớn kèm hiệu ứng đổ bóng (drop-shadow-lg) */}
        <h1 className="text-8xl md:text-9xl font-extrabold text-green-700 mb-6 drop-shadow-lg">
          404
        </h1>

        {/* Thông báo lỗi chính (Hỗ trợ responsive kích thước chữ) */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Oops! Trang không tìm thấy.
        </h2>

        {/* Mô tả chi tiết nguyên nhân lỗi */}
        <p className="text-gray-600 mb-6">
          Có thể đường dẫn bị sai hoặc trang đã bị xoá.
        </p>

        {/* Hình vẽ SVG minh họa lỗi (Một vòng tròn xanh có dấu X màu vàng ở giữa)
          Đi kèm hiệu ứng hoạt họa nhấp nhô liên tục (animate-[bounce_2s_ease-in-out_infinite]) từ Tailwind
        */}
        <svg
          className="w-64 md:w-50 mt-20 mx-auto mb-8 animate-[bounce_2s_ease-in-out_infinite] translate-y-[-5px]"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
        >
          {/* Vẽ vòng tròn viền xanh lá (stroke="#4ade80") */}
          <circle cx="256" cy="256" r="200" strokeWidth="20" stroke="#4ade80" />

          {/* Vẽ nét gạch chéo thứ nhất của dấu X màu vàng (stroke="#facc15") */}
          <line x1="176" y1="176" x2="336" y2="336" strokeWidth="20" stroke="#facc15" strokeLinecap="round" />

          {/* Vẽ nét gạch chéo thứ hai của dấu X màu vàng */}
          <line x1="336" y1="176" x2="176" y2="336" strokeWidth="20" stroke="#facc15" strokeLinecap="round" />
        </svg>

        {/* Nút bấm (Link) điều hướng người dùng quay trở lại trang chủ hệ thống (to="/") */}
        <Link
          to="/"
          className="inline-block bg-yellow-400 text-green-800 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-yellow-300 transition-all duration-300"
        >
          Quay lại Trang Chủ
        </Link>
      </div>

      {/* Dòng chữ chân trang (Footer) hướng dẫn liên hệ bộ phận hỗ trợ kỹ thuật */}
      <p className="mt-12 text-gray-500 text-sm md:text-base">
        Nếu bạn gặp sự cố, vui lòng liên hệ với chúng tôi qua{" "}
        <span className="text-green-700 font-semibold">support@gmail.com</span>
      </p>
    </div>
  );
}