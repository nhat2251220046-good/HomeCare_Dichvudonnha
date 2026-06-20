import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Meta from "../../components/Meta";

export default function BookingSuccess() {
  const navigate = useNavigate(); // Hook hỗ trợ chuyển hướng trang trong React Router

  return (
    // Container chính: Nền Gradient từ xanh lá sang xanh ngọc nhạt, căn giữa toàn bộ nội dung trong viewport
    <div className=" bg-gradient-to-br from-green-50 py-10 via-teal-50 to-green-100 flex items-center justify-center px-4">
      {/* Component quản lý mã SEO/Metadata cho trang thành công */}
      <Meta title={"Thanh toán thành công"} />

      {/* Hộp thoại thông báo (Card white): Bo góc lớn, đổ bóng 2xl, hiệu ứng hiện hình mượt mà (animate-fadeIn) */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center animate-fadeIn">

        {/* KHU VỰC ICON SUCCESS VỚI HIỆU ỨNG ĐỘNG */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Icon dấu tích xanh lá cây kích thước lớn, có bóng và chuyển động nhấp nhô (animate-bounce) */}
            <CheckCircle
              size={96}
              className="text-green-500 drop-shadow-md animate-bounce"
            />
            {/* Vòng tròn lan tỏa hiệu ứng phía sau icon (Glow effect & animate-ping) */}
            <div className="absolute inset-0 rounded-full bg-green-200 opacity-30 blur-2xl animate-ping"></div>
          </div>
        </div>

        {/* NỘI DUNG TIÊU ĐỀ & LỜI CẢM ƠN */}
        <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
          🎉 Đặt dịch vụ thành công!
        </h1>
        <p className="text-gray-600 leading-relaxed mb-8">
          Cảm ơn bạn đã tin tưởng sử dụng dịch vụ.
          Nhân viên sẽ sớm liên hệ xác nhận đơn hàng cho bạn.
        </p>

        {/* BỘ NÚT ĐIỀU HƯỚNG HÀNH ĐỘNG (ACTION BUTTONS) */}
        <div className="flex gap-4">
          {/* Nút 1: Chuyển hướng người dùng quay lại Trang chủ chính (/) */}
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl shadow-md transition transform hover:scale-105"
          >
            ⬅ Về trang chủ
          </button>

          {/* Nút 2: Chuyển hướng người dùng đến Trang quản lý lịch sử đơn hàng cá nhân (/orders) */}
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:scale-105"
          >
            Xem đơn hàng ➜
          </button>
        </div>
      </div>
    </div>
  );
}