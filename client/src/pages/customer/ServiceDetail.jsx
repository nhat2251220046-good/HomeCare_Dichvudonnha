import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Star,
  CheckCircle,
  Clock,
  Tag,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import Meta from "../../components/Meta";
import toast from "react-hot-toast";

export default function ServiceDetail() {
  // --- LẤY PARAMS & KHỞI TẠO STATE ---
  const { id } = useParams(); // Lấy mã ID dịch vụ từ URL route params
  const [service, setService] = useState(null); // Lưu trữ dữ liệu chi tiết dịch vụ
  const [reviews, setReviews] = useState([]);   // Danh sách đánh giá (phục vụ render riêng biệt)
  const [loading, setLoading] = useState(true); // Trạng thái màn hình loading dữ liệu

  // State quản lý dữ liệu Form nhập đánh giá mới của khách hàng
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  // --- SIDE EFFECT: LẤY CHI TIẾT DỊCH VỤ ---
  useEffect(() => {
    const fetchService = async () => {
      try {
        // Gọi API lấy thông tin chi tiết dịch vụ cụ thể dựa vào ID
        const res = await axios.get(`http://localhost:5000/api/services/get/${id}`);
        setService(res.data);
        setReviews(res.data.reviews || []); // Gán danh sách reviews nếu có, ngược lại để mảng rỗng
      } catch (err) {
        console.error("Lỗi lấy chi tiết dịch vụ:", err);
      } finally {
        setLoading(false); // Kết thúc trạng thái tải dữ liệu
      }
    };
    fetchService();
  }, [id]);

  // --- XỬ LÝ SỰ KIỆN FORM (HANDLERS) ---
  // Hàm cập nhật động các trường dữ liệu khi người dùng nhập Form (2-way data binding)
  const handleChange = (e) =>
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });

  // Hàm xử lý gửi form đánh giá dịch vụ lên Server
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn hành vi reload trang mặc định của form HTML
    try {
      const res = await axios.post(
        `http://localhost:5000/api/services/${id}/reviews`,
        reviewForm
      );
      // Đẩy đánh giá mới vừa tạo lên đầu danh sách hiển thị (Unshift logic)
      setReviews([res.data, ...reviews]);
      // Reset sạch Form về trạng thái mặc định ban đầu
      setReviewForm({ name: "", rating: 5, comment: "" });
      toast.success("Cảm ơn bạn đã đánh giá!");
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
      toast.error("Không thể gửi đánh giá!");
    }
  };

  // --- TÍNH TOÁN ĐIỂM ĐÁNH GIÁ TRUNG BÌNH (AVERAGE RATING) ---
  const avgRating =
    reviews.length > 0
      ? (
        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      ).toFixed(1) // Làm tròn lấy 1 chữ số sau dấu phẩy (Ví dụ: 4.8)
      : null;

  // --- GIAO DIỆN CHỜ TẢI DỮ LIỆU ---
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 animate-pulse text-xl">Đang tải dịch vụ...</p>
      </div>
    );

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Cập nhật tiêu đề tài liệu động theo tên dịch vụ */}
      <Meta title={`Dịch vụ ${service?.name}`} />

      {/* Giai đoạn 1: HERO CONTAINER (Banner giới thiệu dịch vụ) */}
      <section className="relative bg-gradient-to-br from-teal-600 to-emerald-500 text-white py-28 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-6xl mx-auto px-6 text-center z-10"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 drop-shadow-lg">
            {service?.name}
          </h1>
          <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto mb-8 leading-relaxed">
            {service?.description}
          </p>

          {/* Điểm số đánh giá sao trung bình (Chỉ hiện khi có tối thiểu 1 review) */}
          {avgRating && (
            <div className="flex items-center justify-center gap-3 text-yellow-300 font-semibold mb-6">
              <Star className="fill-yellow-300" size={26} />
              <span className="text-2xl">{avgRating}/5</span>
              <span className="text-sm text-gray-100">({reviews.length} đánh giá)</span>
            </div>
          )}

          {/* Nút Đặt lịch dịch vụ điều hướng sang trang Booking */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              to={`/booking/${service?._id}`}
              className="inline-flex items-center gap-3 mt-4 bg-white text-teal-700 font-semibold px-10 py-4 rounded-full shadow-lg hover:bg-gray-100 transition"
            >
              <CheckCircle size={22} /> Đặt ngay
            </Link>
          </motion.div>
        </motion.div>
        {/* Layer hình nền lưới chấm tạo điểm nhấn mỹ thuật */}
        <div className="absolute inset-0 bg-[url('https://www.toptal.com/designers/subtlepatterns/patterns/dot-grid.png')] opacity-10"></div>
      </section>

      {/* Giai đoạn 2: SERVICE GALLERY (Thư viện hình ảnh thực tế bằng Swiper Slider) */}
      {service?.images?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-6 py-20"
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Sparkles className="text-teal-600" /> Hình ảnh dịch vụ
          </h2>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{ delay: 3000 }} // Tự động chuyển hình sau 3 giây
            pagination={{ clickable: true }} // Cho phép bấm vào các dấu chấm chuyển slide
            breakpoints={{
              640: { slidesPerView: 2 },  // Trên màn hình Tablet hiện 2 ảnh
              1024: { slidesPerView: 3 }, // Trên màn hình Desktop lớn hiện 3 ảnh
            }}
          >
            {service.images.map((img, i) => (
              <SwiperSlide key={i}>
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={img}
                  alt={`Service ${i}`}
                  className="rounded-3xl shadow-lg w-full h-64 object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      )}

      {/* Giai đoạn 3: HIGHLIGHTS INFO (4 Khối cam kết tiêu chí cốt lõi) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-6 py-16"
      >
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Clock, title: "Thời gian", text: service?.duration || "1 giờ" },
            { icon: Tag, title: "Phân loại", text: service?.category || "Dịch vụ chung" },
            { icon: User, title: "Đánh giá", text: `${reviews.length} người dùng` },
            { icon: ShieldCheck, title: "Cam kết", text: "Uy tín & chất lượng" },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition text-center"
            >
              <item.icon size={40} className="text-teal-600 mx-auto mb-3" />
              <h4 className="font-semibold text-lg mb-1 text-gray-700">{item.title}</h4>
              <p className="text-gray-500">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Giai đoạn 4: DETAIL CONTENT & REVIEWS */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-6 pb-20"
      >
        <div className="bg-white rounded-3xl shadow-xl p-10">
          {/* Trạng thái hoạt động & Giá tiền */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-gray-50 rounded-xl border text-center">
              <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
              <p
                className={`font-semibold text-lg ${service?.active ? "text-green-600" : "text-red-600"
                  }`}
              >
                {service?.active ? "Đang cung cấp" : "Tạm ngưng"}
              </p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-gray-50 rounded-xl border text-center">
              <p className="text-sm text-gray-500 mb-1">Giá dịch vụ</p>
              <p className="text-3xl font-bold text-teal-600">
                {service?.price?.toLocaleString()}đ
              </p>
            </motion.div>
          </div>

          {/* Khối văn bản mô tả chi tiết */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold mb-4 text-gray-800">
              Chi tiết dịch vụ
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg">
              {service?.description || "Chưa có mô tả chi tiết."}
            </p>
          </div>

          {/* KHU VỰC ĐÁNH GIÁ (REVIEW SECTION) */}
          <div>
            <h3 className="text-3xl font-bold mb-6 text-gray-800">
              Đánh giá dịch vụ
            </h3>

            {/* FORM GỬI ĐÁNH GIÁ MỚI */}
            <form
              onSubmit={handleSubmit}
              className="bg-gray-50 p-8 rounded-2xl mb-10 shadow-md"
            >
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Tên của bạn"
                  value={reviewForm.name}
                  onChange={handleChange}
                  required
                  className="p-4 border rounded-xl w-full focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <select
                  name="rating"
                  value={reviewForm.rating}
                  onChange={handleChange}
                  className="p-4 border rounded-xl w-full focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} ★
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                name="comment"
                placeholder="Viết nhận xét..."
                value={reviewForm.comment}
                onChange={handleChange}
                required
                rows={4}
                className="p-4 border rounded-xl w-full mb-4 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                type="submit"
                className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-10 py-3 rounded-xl font-semibold shadow-lg"
              >
                Gửi đánh giá
              </motion.button>
            </form>

            {/* DANH SÁCH CÁC ĐÁNH GIÁ ĐÃ CÓ */}
            {reviews.length > 0 ? (
              <ul className="space-y-6">
                {reviews.map((r, i) => (
                  <motion.li
                    key={r._id || i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 bg-white border rounded-2xl shadow hover:shadow-lg transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar ký tự đầu tiên viết hoa của khách hàng */}
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-lg">
                          {r.name?.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-semibold text-teal-700 text-lg">{r.name}</p>
                      </div>
                      {/* Xử lý thuật toán lặp chuỗi ký tự hiển thị sao đặc (★) và sao rỗng (☆) */}
                      <p className="text-yellow-500 font-medium text-lg">
                        {"★".repeat(r.rating)}{" "}
                        <span className="text-gray-300">
                          {"☆".repeat(5 - r.rating)}
                        </span>
                      </p>
                    </div>
                    <p className="text-gray-700 text-lg">{r.comment}</p>
                  </motion.li>
                ))}
              </ul>
            ) : (
              /* Trạng thái trống chưa có bình luận */
              <p className="text-gray-500 italic text-lg">
                Chưa có đánh giá nào.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}