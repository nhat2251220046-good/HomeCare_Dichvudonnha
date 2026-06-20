import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Sparkles, Clock, ShieldCheck, Star } from "lucide-react";

export default function Service() {
  // --- QUẢN LÝ TRẠNG THÁI (STATES) ---
  const [services, setServices] = useState([]); // Danh sách toàn bộ dịch vụ lấy từ API
  const [loading, setLoading] = useState(true); // Trạng thái chờ tải dữ liệu (loading)
  const [error, setError] = useState(null);     // Trạng thái lưu trữ lỗi nếu API gặp sự cố

  // --- SIDE EFFECT: GỌI API LẤY DANH SÁCH DỊCH VỤ ---
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setError(null); // Reset trạng thái lỗi về null trước khi gọi API mới

        // Gửi request GET tới server với cấu hình thời gian chờ tối đa là 5 giây (timeout)
        const res = await axios.get("http://localhost:5000/api/services/getall", {
          timeout: 5000
        });

        // Cập nhật danh sách dịch vụ nếu response hợp lệ, ngược lại gán mảng rỗng
        setServices(res.data || []);
      } catch (err) {
        console.error("Lỗi khi tải dịch vụ:", err);
        // Lưu thông báo lỗi thân thiện với người dùng vào state
        setError("Không thể tải dịch vụ. Vui lòng kiểm tra kết nối với máy chủ.");
        setServices([]); // Đảm bảo services là mảng rỗng để tránh lỗi giao diện
      } finally {
        setLoading(false); // Hoàn thành chu trình tải dữ liệu (Tắt màn hình Loading)
      }
    };
    fetchServices();
  }, []);

  // --- MÀN HÌNH KHẢO SÁT 1: ĐANG TẢI DỮ LIỆU (LOADING) ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {/* Hiệu ứng animate-pulse giúp đoạn text nhấp nháy tạo cảm giác chờ đợi mượt mà */}
        <p className="text-gray-600 animate-pulse text-lg font-medium">
          Đang tải dịch vụ...
        </p>
      </div>
    );
  }

  // --- MÀN HÌNH KHẢO SÁT 2: GẶP LỖI HỆ THỐNG (ERROR) ---
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Vẫn giữ phần Banner Hero của trang để giao diện không bị trống trải */}
        <section className="relative bg-gradient-to-r from-teal-600 to-emerald-500 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.toptal.com/designers/subtlepatterns/patterns/clean-textile.png')] opacity-10"></div>
          <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
            <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg tracking-tight">
              Dịch vụ vệ sinh chuyên nghiệp
            </h1>
          </div>
        </section>

        {/* Hộp thông báo lỗi màu đỏ nổi bật cảnh báo lỗi kết nối */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium mb-2">⚠️ Lỗi tải dữ liệu</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH CHÍNH: HIỂN THỊ DANH SÁCH DỊCH VỤ ---
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 1. HERO BANNER - KHU VỰC TIÊU ĐỀ ĐẦU TRANG */}
      <section className="relative bg-gradient-to-r from-teal-600 to-emerald-500 text-white py-20 overflow-hidden">
        {/* Lớp nền mờ họa tiết nhẹ (pattern) */}
        <div className="absolute inset-0 bg-[url('https://www.toptal.com/designers/subtlepatterns/patterns/clean-textile.png')] opacity-10"></div>
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg tracking-tight">
            Dịch vụ vệ sinh chuyên nghiệp
          </h1>
          <p className="text-lg mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Tận hưởng không gian sạch sẽ & tiện nghi cùng đội ngũ chuyên nghiệp,
            tận tâm – mang lại sự thoải mái tuyệt đối cho gia đình bạn.
          </p>
          {/* Nút điều hướng nhanh đến trang liên hệ */}
          <Link
            to="/contact"
            className="bg-white text-teal-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            Liên hệ ngay
          </Link>
        </div>
      </section>

      {/* 2. SERVICES SECTION - CHI TIẾT CÁC GÓI DỊCH VỤ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-14 text-gray-800">
            Dịch vụ của chúng tôi
          </h2>

          {services.length === 0 ? (
            /* Trường hợp danh sách trống */
            <p className="text-center text-gray-600">Hiện chưa có dịch vụ nào.</p>
          ) : (
            /* Grid hiển thị danh sách dạng Card (Responsive tốt trên mobile, tablet và desktop) */
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Link
                  key={service._id}
                  to={`/service/${service._id}`} // Chuyển tiếp tới trang chi tiết của từng dịch vụ cụ thể
                  className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-transparent hover:border-teal-500 p-8 flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Hiệu ứng ánh sáng màu gradient phủ nhẹ lên khi rê chuột vào card (hover) */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-teal-300 to-emerald-300 transition-all duration-500"></div>

                  {/* KHU VỰC 1: ICON DỊCH VỤ */}
                  <div className="bg-teal-100 text-teal-600 p-4 rounded-full mb-6 self-center group-hover:bg-teal-600 group-hover:text-white transition-all duration-500">
                    <Sparkles size={36} />
                  </div>

                  {/* KHU VỰC 2: TÊN DỊCH VỤ */}
                  <h3 className="text-2xl font-semibold mb-3 text-gray-800 text-center group-hover:text-teal-600 transition-all duration-300">
                    {service.name}
                  </h3>

                  {/* KHU VỰC 3: MÔ TẢ NGẮN (Khóa hiển thị tối đa 3 dòng bằng line-clamp-3) */}
                  <p className="text-gray-600 text-sm text-center mb-4 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>

                  {/* KHU VỰC 4: TIÊU CHÍ CAM KẾT (Bao gồm Icon nhỏ từ lucide-react) */}
                  <div className="flex justify-center gap-5 text-gray-500 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={16} /> Nhanh chóng
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={16} /> Uy tín
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={16} /> 5⭐
                    </span>
                  </div>

                  {/* KHU VỰC 5: GIÁ DỊCH VỤ (Định dạng phân tách hàng nghìn .toLocaleString) */}
                  <p className="font-bold text-teal-600 text-2xl text-center mb-4">
                    {service.price.toLocaleString()}đ
                  </p>

                  {/* KHU VỰC 6: NÚT "XEM CHI TIẾT" GIẢ LẬP */}
                  <span className="mt-auto mx-auto inline-block bg-teal-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-md hover:bg-teal-700 transition-all duration-300 hover:scale-105">
                    Xem chi tiết
                  </span>

                  {/* KHU VỰC 7: BADGE "HOT 🔥" (Tự động hiển thị ngẫu nhiên so le cách nhau 3 phần tử) */}
                  {index % 3 === 0 && (
                    <span className="absolute top-4 right-4 bg-amber-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                      Hot 🔥
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}