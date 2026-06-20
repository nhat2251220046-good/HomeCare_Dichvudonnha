import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  User,
  MapPin,
  Wallet,
  Loader2,
  XCircle,
  UserRound,
  Phone,
  Mail,
  Star,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Meta from "../../components/Meta";

export default function OrderDetailUser() {
  const { id } = useParams(); // Lấy ID đơn hàng từ URL params
  const navigate = useNavigate(); // Hook điều hướng của react-router-dom

  // --- QUẢN LÝ TRẠNG THÁI (STATES) ---
  const [order, setOrder] = useState(null); // Lưu trữ thông tin chi tiết đơn hàng
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu ban đầu
  const [serviceReview, setServiceReview] = useState({ rating: 5, comment: "" }); // Form đánh giá dịch vụ
  const [staffReview, setStaffReview] = useState({ rating: 5, comment: "" }); // Form đánh giá nhân viên
  const [showCancelModal, setShowCancelModal] = useState(false); // Trạng thái ẩn/hiện Modal hủy đơn
  const [cancelReason, setCancelReason] = useState(""); // Lý do hủy đơn hàng
  const [canceling, setCanceling] = useState(false); // Trạng thái gửi yêu cầu hủy lên server (loading button)

  // --- HÀM XỬ LÝ SỰ KIỆN (HANDLERS) ---

  // Lấy chi tiết đơn hàng từ API (Hàm tái sử dụng)
  const refreshOrderData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error("Lỗi cập nhật lại dữ liệu đơn:", err);
    }
  };

  // Gửi đánh giá chất lượng dịch vụ
  const handleServiceReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/orders/${id}/review`, serviceReview);
      toast.success("Đánh giá dịch vụ thành công!");
      await refreshOrderData(); // Tải lại dữ liệu để cập nhật giao diện hiển thị đánh giá
      setServiceReview({ rating: 5, comment: "" }); // Reset form về mặc định
    } catch (err) {
      toast.error("Lỗi khi đánh giá dịch vụ!");
    }
  };

  // Gửi đánh giá nhân viên thực hiện dịch vụ
  const handleStaffReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/orders/${id}/staff-review`, staffReview);
      toast.success("Đánh giá nhân viên thành công!");
      await refreshOrderData(); // Tải lại dữ liệu
      setStaffReview({ rating: 5, comment: "" }); // Reset form về mặc định
    } catch (err) {
      toast.error("Lỗi khi đánh giá nhân viên!");
    }
  };

  // Gửi yêu cầu cập nhật trạng thái hủy đơn hàng
  const handleCancelOrder = async (e) => {
    e.preventDefault();
    setCanceling(true);
    try {
      await axios.patch(`http://localhost:5000/api/orders/${id}`, {
        status: "canceled",
        cancelReason: cancelReason,
        canceledAt: new Date(),
        canceledBy: "customer",
      });
      toast.success("Hủy đơn hàng thành công!");
      setShowCancelModal(false); // Đóng modal hủy đơn
      await refreshOrderData(); // Tải lại thông tin mới nhất
    } catch (err) {
      toast.error("Lỗi khi hủy đơn hàng!");
    } finally {
      setCanceling(false); // Tắt trạng thái loading button
    }
  };

  // --- SIDE EFFECT ---
  // Tự động gọi API lấy thông tin chi tiết đơn hàng ngay khi truy cập trang hoặc ID thay đổi
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Lỗi lấy chi tiết đơn:", err);
      } finally {
        setLoading(false); // Kết thúc trạng thái loading
      }
    };
    fetchOrder();
  }, [id]);

  // --- HÀM GIAO DIỆN (RENDER HELPERS) ---
  // Hàm hiển thị Badge trạng thái đơn hàng dựa trên CSS Tailwind
  const renderStatus = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-full">
            <Clock size={16} className="mr-1" /> Chờ xác nhận
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            <CheckCircle2 size={16} className="mr-1" /> Đã nhận
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-teal-700 bg-teal-100 rounded-full">
            <Clock size={16} className="mr-1" /> Đang thực hiện
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
            <CheckCircle2 size={16} className="mr-1" /> Hoàn thành
          </span>
        );
      case "canceled":
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full">
            <XCircle size={16} className="mr-1" /> Đã hủy
          </span>
        );
      default:
        return status;
    }
  };

  // Kiểm tra xem đơn hàng đã tồn tại đánh giá (dịch vụ/nhân viên) trên cơ sở dữ liệu chưa
  const serviceReviewExists = Boolean(order?.review?.rating || order?.review?.comment?.trim());
  const staffReviewExists = Boolean(order?.staffReview?.rating || order?.staffReview?.comment?.trim());

  // --- GIAO DIỆN KHI ĐANG TẢI DỮ LIỆU ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-teal-600" size={40} />
      </div>
    );
  }

  // --- GIAO DIỆN KHI KHÔNG CÓ ĐƠN HÀNG ---
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Không tìm thấy đơn hàng.</p>
      </div>
    );
  }

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Meta title={"Chi tiết đơn hàng"} />

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">

        {/* KHU VỰC HEADER (NÚT BACK & TRẠNG THÁI) */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)} // Quay lại trang trước đó trong lịch sử duyệt
            className="flex items-center text-gray-600 hover:text-teal-600"
          >
            <ArrowLeft className="mr-2" size={20} /> Quay lại
          </button>

          <div className="flex items-center gap-3">
            {renderStatus(order.status)}
            {/* Chỉ hiển thị nút hủy đơn nếu trạng thái không phải hoàn thành hoặc đã hủy */}
            {order.status !== "completed" && order.status !== "canceled" && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition"
              >
                Hủy đơn
              </button>
            )}
          </div>
        </div>

        {/* THÔNG BÁO GỢI Ý ĐÁNH GIÁ (KHI ĐƠN HÀNG HOÀN THÀNH) */}
        {order.status === "completed" && (!serviceReviewExists || (order.staff && !staffReviewExists)) && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle2 className="text-green-600 mr-3" size={24} />
              <div>
                <h3 className="text-green-800 font-medium">Đơn hàng đã hoàn thành!</h3>
                <p className="text-green-700 text-sm">
                  {!serviceReviewExists && order.staff && !staffReviewExists
                    ? "Hãy đánh giá cả dịch vụ và nhân viên để giúp chúng tôi cải thiện chất lượng."
                    : !serviceReviewExists
                      ? "Hãy đánh giá chất lượng dịch vụ để giúp chúng tôi cải thiện."
                      : "Hãy đánh giá nhân viên đã phục vụ bạn."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* THÔNG BÁO CHI TIẾT LÝ DO HỦY ĐƠN */}
        {order.status === "canceled" && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="text-red-600 mr-3" size={24} />
              <div>
                <h3 className="text-red-800 font-medium">Bạn đã hủy đơn hàng thành công!</h3>
                <p className="text-red-700 text-sm">
                  {order.cancelReason
                    ? `Lý do hủy: ${order.cancelReason}`
                    : "Đơn hàng đã được hủy. Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PHẦN 1: CHI TIẾT THÔNG TIN ĐƠN HÀNG */}
        <div className="space-y-4 text-gray-700 mt-6">
          {/* Định dạng ngày tháng giờ theo chuẩn VN */}
          <p className="flex items-center">
            <Calendar className="mr-2 text-gray-400" size={18} />
            Thời gian:{" "}
            <span className="ml-1 font-medium">
              {new Date(order.scheduledAt).toLocaleDateString("vi-VN")}{" "}
              {new Date(order.startTime ? order.startTime : order.scheduledAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>

          <p className="flex items-center">
            <User className="mr-2 text-gray-400" size={18} />
            Khách hàng:{" "}
            <span className="ml-1 font-medium">{order.customer?.name}</span>
          </p>

          {/* Gộp chuỗi địa chỉ động */}
          <p className="flex items-center">
            <MapPin className="mr-2 text-gray-400" size={18} />
            Địa chỉ:{" "}
            <span className="ml-1 font-medium">
              {order.detailAddress ? `${order.detailAddress}, ` : ""}
              {order.ward ? `${order.ward}, ` : ""}
              {order.district ? `${order.district}, ` : ""}
              {order.province || order.customer?.address || "Chưa có địa chỉ"}
            </span>
          </p>

          <p className="flex items-center">
            <Wallet className="mr-2 text-gray-400" size={18} />
            Thanh toán:{" "}
            <span className="ml-1 font-medium">
              {order.paymentMethod === "COD" ? "Khi hoàn thành" : "Online"} -{" "}
              {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
            </span>
          </p>

          <p className="text-lg font-semibold text-gray-800">
            Tổng tiền: {order.price?.toLocaleString("vi-VN") || 0} VND
          </p>

          {order.notes && (
            <p className="bg-gray-50 p-3 rounded-lg text-sm">
              <span className="font-medium">Ghi chú:</span> {order.notes}
            </p>
          )}
        </div>

        {/* PHẦN 2: THÔNG TIN NHÂN VIÊN PHỤ TRÁCH */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Nhân viên phụ trách</h2>
          {order.staff ? (
            <div className="bg-gray-50 p-4 rounded-lg border flex items-start space-x-4">
              <UserRound className="text-teal-600 mt-1" size={28} />
              <div>
                <p className="font-medium text-gray-900">{order.staff.name || "Chưa có tên"}</p>
                <p className="flex items-center text-sm text-gray-600">
                  <Phone size={14} className="mr-1 text-gray-400" /> {order.staff.phone || "Không có số"}
                </p>
                <p className="flex items-center text-sm text-gray-600">
                  <Mail size={14} className="mr-1 text-gray-400" /> {order.staff.email || "Không có email"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">⏳ Chưa phân công nhân viên.</p>
          )}
        </div>

        {/* PHẦN 3: HÌNH ẢNH NGHIỆM THU (NẾU CÓ) */}
        {order.status === "completed" && order.completionImages?.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📸 Hình ảnh phòng sau khi dọn</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {order.completionImages.map((image, idx) => (
                <div
                  key={idx}
                  className="relative bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => window.open(image.url, "_blank")} // Nhấp để xem ảnh kích thước gốc ở tab mới
                >
                  <img
                    src={image.url}
                    alt={`Ảnh ${idx + 1}`}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white text-xs p-2">
                    {new Date(image.uploadedAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHẦN 4: ĐÁNH GIÁ (BIỂU MẪU GỬI HOẶC HIỂN THỊ KẾT QUẢ ĐÃ ĐÁNH GIÁ) */}
        {order.status === "completed" && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Đánh giá dịch vụ</h2>
            <div className="space-y-6">

              {/* Form tạo đánh giá dịch vụ (Nếu chưa từng đánh giá) */}
              {!serviceReviewExists && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Đánh giá chất lượng dịch vụ</h3>
                  <form onSubmit={handleServiceReviewSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Đánh giá sao</label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setServiceReview({ ...serviceReview, rating: star })}
                            className="focus:outline-none transition"
                          >
                            <Star
                              size={28}
                              className={`${star <= serviceReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                } cursor-pointer hover:text-yellow-300`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bình luận về dịch vụ</label>
                      <textarea
                        value={serviceReview.comment}
                        onChange={(e) => setServiceReview({ ...serviceReview, comment: e.target.value })}
                        className="w-full border rounded-lg p-2"
                        rows={3}
                        placeholder="Hãy chia sẻ trải nghiệm của bạn về dịch vụ..."
                        required
                      />
                    </div>
                    <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">
                      Gửi đánh giá dịch vụ
                    </button>
                  </form>
                </div>
              )}

              {/* Form tạo đánh giá nhân viên (Nếu có nhân viên phụ trách & chưa đánh giá nhân viên) */}
              {!staffReviewExists && order.staff && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Đánh giá nhân viên</h3>
                  <form onSubmit={handleStaffReviewSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Đánh giá nhân viên {order.staff.name}</label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setStaffReview({ ...staffReview, rating: star })}
                            className="focus:outline-none transition"
                          >
                            <Star
                              size={28}
                              className={`${star <= staffReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                } cursor-pointer hover:text-yellow-300`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bình luận về nhân viên</label>
                      <textarea
                        value={staffReview.comment}
                        onChange={(e) => setStaffReview({ ...staffReview, comment: e.target.value })}
                        className="w-full border rounded-lg p-2"
                        rows={3}
                        placeholder="Hãy chia sẻ trải nghiệm của bạn về nhân viên..."
                        required
                      />
                    </div>
                    <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">
                      Gửi đánh giá nhân viên
                    </button>
                  </form>
                </div>
              )}

              {/* Hiển thị kết quả Đánh giá dịch vụ cũ đã lưu */}
              {serviceReviewExists && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-green-800">Đánh giá dịch vụ của bạn</h3>
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={`${star <= order.review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{order.review.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Đánh giá vào {new Date(order.review.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}

              {/* Hiển thị kết quả Đánh giá nhân viên cũ đã lưu */}
              {staffReviewExists && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-blue-800">Đánh giá nhân viên của bạn</h3>
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={`${star <= order.staffReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{order.staffReview.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Đánh giá vào {new Date(order.staffReview.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* POPUP MODAL: XỬ LÝ HỦY ĐƠN HÀNG (HIỂN THỊ OVERLAY TOÀN MÀN HÌNH) */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Hủy đơn hàng</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
            </p>
            <form onSubmit={handleCancelOrder}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do hủy đơn (không bắt buộc)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  rows={3}
                  placeholder="Ví dụ: Thay đổi lịch hẹn, không cần dịch vụ nữa..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Không, giữ đơn
                </button>
                <button
                  type="submit"
                  disabled={canceling}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-red-400"
                >
                  {canceling ? "Đang hủy..." : "Xác nhận hủy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}