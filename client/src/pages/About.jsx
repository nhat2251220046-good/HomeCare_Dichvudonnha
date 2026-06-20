import React from "react";
import Meta from "../components/Meta";

export default function About() {
  return (
    // Lớp bọc chính (Wrapper): Cấu hình chiều cao tối thiểu bằng màn hình, nền trắng và chữ xám đen chủ đạo
    <div className="min-h-screen bg-white text-gray-800">

      {/* Cập nhật tiêu đề trang động cho trình duyệt để tối ưu SEO */}
      <Meta title={"Giới thiệu"} />

      {/* KHU VỰC 1: BANNER ĐẦU TRANG (HERO SECTION) */}
      {/* Sử dụng hiệu ứng dải màu (gradient) chuyển từ xanh lục bảo (teal) sang xanh lá (green) */}
      <div className="bg-gradient-to-r from-teal-600 to-green-500 text-white py-20 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">Về HomeCare</h1>
        <p className="text-lg md:text-xl max-w-2xl text-center px-4">
          HomeCare – Dịch vụ dọn nhà và vệ sinh chuyên nghiệp, tiện lợi cho mọi gia đình và văn phòng.
        </p>
      </div>

      {/* KHU VỰC 2: SỨ MỆNH & TẦM NHÌN (MISSION & VISION) */}
      {/* Phân tách thành 2 cột trên màn hình máy tính (md:grid-cols-2) và gom lại thành 1 cột trên điện thoại */}
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Khối Sứ mệnh */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold mb-4 text-teal-600 border-b-2 border-teal-100 pb-2 inline-block">
            Sứ mệnh
          </h2>
          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
            Chúng tôi cung cấp dịch vụ dọn nhà, vệ sinh định kỳ và dọn văn phòng chất lượng cao,
            giúp cuộc sống của bạn trở nên tiện lợi, gọn gàng và sạch sẽ.
          </p>
        </div>

        {/* Khối Tầm nhìn */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold mb-4 text-teal-600 border-b-2 border-teal-100 pb-2 inline-block">
            Tầm nhìn
          </h2>
          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
            Trở thành nền tảng dịch vụ vệ sinh và dọn dẹp uy tín hàng đầu Việt Nam,
            mang đến trải nghiệm nhanh chóng và chuyên nghiệp cho mọi khách hàng.
          </p>
        </div>
      </div>

      {/* KHU VỰC 3: GIÁ TRỊ CỐT LÕI (CORE VALUES) */}
      {/* Nền xám nhạt (bg-gray-50) để tách biệt với phần Sứ mệnh phía trên */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-8 text-center text-teal-600">
            Giá trị cốt lõi
          </h2>

          {/* Grid chia làm 3 cột tương ứng với 3 giá trị cốt lõi lớn */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

            {/* Giá trị 1: Chuyên nghiệp */}
            <div className="bg-white p-6 border rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transform transition duration-300">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">💼</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Chuyên nghiệp</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Đội ngũ nhân viên được đào tạo bài bản, phục vụ tận tâm.
              </p>
            </div>

            {/* Giá trị 2: Tiện lợi */}
            <div className="bg-white p-6 border rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transform transition duration-300">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Tiện lợi</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Đặt dịch vụ nhanh chóng qua app hoặc website, mọi lúc mọi nơi.
              </p>
            </div>

            {/* Giá trị 3: Tin cậy */}
            <div className="bg-white p-6 border rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transform transition duration-300">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Tin cậy</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Cam kết chất lượng, đảm bảo sự hài lòng tuyệt đối của khách hàng.
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}