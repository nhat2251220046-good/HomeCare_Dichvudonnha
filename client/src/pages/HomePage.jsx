import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Meta from "../components/Meta";
import { heroImages, features, howItWorks, testimonials, faqs } from "../data/index";
import axios from "axios";

// LƯU Ý SỬA LỖI: Đã loại bỏ import 'services' từ file data vì trùng tên với state API bên dưới.

export default function HomePage() {
  // --- QUẢN LÝ TRẠNG THÁI (STATES) ---
  const [openIndex, setOpenIndex] = useState(null); // Quản lý đóng/mở câu hỏi FAQ theo vị trí Index
  const [services, setServices] = useState([]);     // Lưu trữ danh sách dịch vụ động lấy từ API cơ sở dữ liệu
  const [loading, setLoading] = useState(true);      // Trạng thái chờ khi đang đồng bộ dữ liệu mạng

  // --- SIDE EFFECT: LẤY DỮ LIỆU DỊCH VỤ TỪ BACKEND ---
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/services/getall");
        setServices(res.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách dịch vụ:", err);
      } finally {
        setLoading(false); // Kết thúc trạng thái tải dù request thành công hay thất bại
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 overflow-hidden">
      {/* Cấu hình SEO Meta Title cho Trang chủ */}
      <Meta title={"Trang chủ"} />

      {/* 🌈 NỀN GRADIENT ĐỘNG (ANIMATED BACKGROUND EFFECT) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100 via-white to-teal-50 animate-gradient-x"></div>

      {/* ✨ HIỆU ỨNG CÁC ĐỐM SÁNG TRÔI BỒNG BỀNH (FLOATING LIGHT BLOBS) */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-float"></div>

      {/* 🏠 KHU VỰC HERO BANNER (SLIDER TRÌNH CHIẾU ẢNH CHÍNH) */}
      <section className="relative w-full h-[90vh] overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          autoplay={{ delay: 4500 }}
          effect="fade" // Hiệu ứng chuyển ảnh mờ dần (Fade Out/In)
          loop          // Lặp lại vô hạn vòng quay slider
          pagination={{ clickable: true }} // Bật các dấu chấm chuyển trang nhỏ ở dưới slider
          className="h-full"
        >
          {heroImages.map((img, i) => (
            <SwiperSlide key={i}>
              <div className="relative w-full h-full">
                {/* Ảnh nền hiệu ứng Parallax zoom xa gần tuần hoàn */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.img
                    src={img}
                    alt="HomeCare Banner"
                    className="w-full h-full object-cover object-center scale-110"
                    animate={{ scale: [1.1, 1.2, 1.1] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                  />
                </div>
                {/* Lớp phủ đen mờ (Overlay) & Nội dung chữ Text ở giữa Banner */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent flex flex-col items-center justify-center text-white text-center">
                  <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-6xl md:text-7xl font-extrabold tracking-tight drop-shadow-2xl px-4"
                  >
                    Giải pháp giúp việc chuyên nghiệp
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="mt-6 text-lg md:text-2xl text-gray-200 max-w-2xl leading-relaxed px-4"
                  >
                    Nhanh chóng • An toàn • Minh bạch
                  </motion.p>

                  {/* Nút hành động nổi bật nhảy nhẹ (Spring Physics) khi di chuột */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 250 }}
                    className="mt-10"
                  >
                    <Link
                      to="/service"
                      className="px-10 py-3 bg-gradient-to-r from-[#ff8228] via-orange-500 to-red-500 rounded-full shadow-lg hover:shadow-2xl text-white font-semibold tracking-wide transition-all duration-300 animate-pulse-soft"
                    >
                      🚀 Đặt dịch vụ ngay
                    </Link>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 💡 KHU VỰC TÍNH NĂNG ĐẶC TRƯNG (FEATURES CARD SECTION) */}
      {/* Xuất hiện hiệu ứng Fade In lướt lên từ từ khi người dùng cuộn màn hình đến phần này (whileInView) */}
      <section className="max-w-7xl mx-auto px-6 py-28 grid sm:grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.08, rotate: 1 }}
            className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl hover:shadow-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-3"
          >
            <div className="relative w-20 h-20 mb-5">
              <img src={f.img} alt={f.title} className="w-full h-full rounded-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-300/30 to-transparent rounded-full blur-sm"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{f.title}</h3>
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* 🧩 KHU VỰC QUY TRÌNH HOẠT ĐỘNG (HOW IT WORKS SECTION) */}
      <section className="bg-gradient-to-b from-white to-orange-50 py-28 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] opacity-10"></div>
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-16"
        >
          Quy trình 3 bước đơn giản
        </motion.h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
          {howItWorks.map((s, i) => (
            <Link key={i} to="/service" className="block group">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="relative bg-white/80 border border-orange-100 backdrop-blur-md rounded-3xl shadow-xl p-10 overflow-hidden hover:border-orange-400 transition"
              >
                {/* Con số bước thực hiện nhảy lên xuống nhịp nhàng tuần hoàn */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-7xl font-extrabold text-[#ff8228] mb-5"
                >
                  {s.step}
                </motion.div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed">{s.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* 💼 KHU VỰC HIỂN THỊ DANH SÁCH DỊCH VỤ DỰA TRÊN DỮ LIỆU ĐỘNG (SERVICES SECTION) */}
      <section className="relative max-w-7xl mx-auto px-6 py-28">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-16"
        >
          Dịch vụ nổi bật
        </motion.h2>

        {loading ? (
          /* Trạng thái Loading xương cá/chờ văn bản khi API chưa phản hồi xong */
          <div className="text-center text-gray-500 font-medium">Đang tải danh sách dịch vụ...</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <motion.div
                key={s._id || i}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
                className="relative overflow-hidden rounded-3xl shadow-lg group cursor-pointer h-80"
              >
                {/* Hình ảnh đại diện dịch vụ (Sử dụng ảnh mặc định nếu backend trống hình) */}
                <img
                  src={s.image || "https://www.btaskee.com/wp-content/uploads/2020/11/chon-dich-vu-grocery.png"}
                  alt={s.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Tiêu đề chân ảnh hiển thị ở trạng thái bình thường */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white group-hover:opacity-0 transition-opacity duration-300">
                  <h3 className="text-2xl font-semibold mb-2">{s.name}</h3>
                </div>

                {/* KHUNG MODAL POPUP CHI TIẾT HIỆN LÊN TRÊN KHI DI CHUỘT VÀO (HOVER EFFECT) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 text-white text-center"
                >
                  <div className="max-w-[90%]">
                    <Link
                      to={`/booking/${s._id}`}
                      className="block text-xl font-bold mb-3 bg-gradient-to-r from-orange-300 to-yellow-400 bg-clip-text text-transparent"
                    >
                      {s.name}
                    </Link>

                    {/* Cắt ngắn bớt chuỗi ký tự mô tả để vừa vặn khung Card */}
                    <p className="text-gray-200 mb-3 text-sm leading-relaxed">
                      {s.description?.length > 100
                        ? s.description.slice(0, 100) + "..."
                        : s.description || "Chưa có mô tả chi tiết cho dịch vụ này."}
                    </p>

                    {/* Hiển thị giá tiền format chuẩn Việt Nam */}
                    {s.price && (
                      <p className="text-orange-400 font-bold mb-1">
                        Giá: {s.price.toLocaleString("vi-VN")}₫
                      </p>
                    )}

                    {/* Hiển thị điểm số đánh giá trung bình từ đánh giá của khách */}
                    {s.averageRating > 0 ? (
                      <p className="text-yellow-400 text-sm mb-3">
                        ⭐ {s.averageRating.toFixed(1)} ({s.reviewCount} lượt)
                      </p>
                    ) : (
                      <p className="text-gray-300 text-sm mb-3">Chưa có đánh giá</p>
                    )}

                    <Link
                      to={`/booking/${s._id}`}
                      className="inline-block bg-gradient-to-r from-orange-500 to-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-full hover:scale-105 transition-transform"
                    >
                      Đặt ngay
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 💬 KHU VỰC Ý KIẾN KHÁCH HÀNG (TESTIMONIALS SLIDER SECTION) */}
      <section className="bg-gradient-to-br from-teal-50 via-white to-orange-50 py-28">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-14">
          Khách hàng nói gì về chúng tôi
        </h2>
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4500 }}
          loop
          slidesPerView={1}
          breakpoints={{ 768: { slidesPerView: 2 } }} // Giao diện máy tính hiển thị song song 2 card đánh giá
          spaceBetween={40}
          className="max-w-6xl mx-auto px-6"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-white/90 rounded-3xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition duration-300"
              >
                <div className="flex items-center mb-4">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full mr-4 object-cover" />
                  <div>
                    <h3 className="font-semibold text-gray-800">{t.name}</h3>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic leading-relaxed">“{t.text}”</p>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ❓ KHU VỰC CÂU HỎI THƯỜNG GẶP (ACCORDION FAQ SECTION) */}
      <section className="max-w-3xl mx-auto px-6 py-28">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-12">
          Câu hỏi thường gặp
        </h2>
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="mb-5 bg-white/80 rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl hover:bg-orange-50/50 transition-all duration-200"
            onClick={() => setOpenIndex(openIndex === i ? null : i)} // Đóng nếu bấm lại mục cũ, mở nếu chọn mục mới
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">{faq.q}</h3>
              {/* Mũi tên xoay ngược 180 độ khi mở nội dung câu hỏi */}
              <motion.span animate={{ rotate: openIndex === i ? 180 : 0 }} className="text-gray-600 text-xs">
                ▼
              </motion.span>
            </div>
            {openIndex === i && (
              <p className="mt-4 text-gray-600 text-sm leading-relaxed border-t pt-3 border-gray-200 animate-fade-in">
                {faq.a}
              </p>
            )}
          </motion.div>
        ))}
      </section>

      {/* ⚡ KHU VỰC CHÂN TRANG KÊU GỌI HÀNH ĐỘNG (FOOTER CTA SECTION) */}
      <footer className="relative overflow-hidden bg-gradient-to-r from-[#ff8228] to-orange-600 text-white text-center py-24">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold mb-6"
        >
          Sẵn sàng trải nghiệm dịch vụ tiện lợi?
        </motion.h3>
        <motion.div whileHover={{ scale: 1.1 }} className="inline-block">
          <Link
            to="/service"
            className="px-10 py-3 bg-white text-orange-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-all block"
          >
            Đặt ngay
          </Link>
        </motion.div>
      </footer>
    </div>
  );
}