import React, { useEffect, useState } from "react";
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  ListChecks,
  UserRound,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Meta from "../../components/Meta";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderHistory({ customerId }) {
  // --- QUẢN LÝ TRẠNG THÁI (STATES) ---
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng của khách hàng
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu (loading)
  const navigate = useNavigate(); // Hook hỗ trợ chuyển hướng trang

  // --- SIDE EFFECT: LẤY DỮ LIỆU ĐƠN HÀNG ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Ưu tiên lấy customerId từ props, nếu không có sẽ tìm trong localStorage
        const effectiveCustomerId =
          customerId || localStorage.getItem("customerId") || "";

        // Nếu hoàn toàn không tìm thấy ID khách hàng, dừng xử lý và trả về mảng rỗng
        if (!effectiveCustomerId) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // Gọi API lấy danh sách đơn hàng theo mã khách hàng
        const res = await axios.get(
          `http://localhost:5000/api/orders/customer/${effectiveCustomerId}`
        );
        setOrders(res.data || []);
      } catch (err) {
        console.error("Lỗi lấy đơn hàng:", err);
      } finally {
        setLoading(false); // Tắt màn hình loading sau khi hoàn thành kết nối API
      }
    };
    fetchOrders();
  }, [customerId]);

  // --- HÀM GIAO DIỆN (RENDER HELPERS) ---
  // Hàm hiển thị Badge trạng thái tương ứng với màu sắc và icon riêng biệt
  const renderStatus = (status) => {
    // Bản đồ cấu hình class CSS Tailwind cho từng trạng thái
    const styles = {
      pending: "text-yellow-700 bg-yellow-100",
      accepted: "text-blue-700 bg-blue-100",
      in_progress: "text-teal-700 bg-teal-100",
      completed: "text-green-700 bg-green-100",
      canceled: "text-red-700 bg-red-100",
    };
    // Bản đồ cấu hình Icon tương ứng
    const icons = {
      pending: <Clock size={14} className="mr-1" />,
      accepted: <CheckCircle2 size={14} className="mr-1" />,
      in_progress: <Clock size={14} className="mr-1" />,
      completed: <CheckCircle2 size={14} className="mr-1" />,
      canceled: <XCircle size={14} className="mr-1" />,
    };
    // Bản đồ hiển thị văn bản tiếng Việt
    const labels = {
      pending: "Chờ xác nhận",
      accepted: "Đã nhận",
      in_progress: "Đang thực hiện",
      completed: "Hoàn thành",
      canceled: "Đã hủy",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${styles[status]}`}
      >
        {icons[status]} {labels[status]}
      </span>
    );
  };

  // --- GIAO DIỆN KHI ĐANG TẢI DỮ LIỆU ---
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        {/* Icon xoay tròn tạo hiệu ứng chờ đợi */}
        <Loader2 className="animate-spin text-teal-600 mb-2" size={40} />
        <p className="text-gray-500">Đang tải đơn hàng của bạn...</p>
      </div>
    );

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
      {/* Component cập nhật tiêu đề tài liệu SEO cho trang lịch sử */}
      <Meta title={"Lịch sử đơn hàng"} />

      <div className="max-w-6xl mx-auto">
        {/* TIÊU ĐỀ TRANG (HEADER) */}
        <div className="flex items-center justify-center mb-10">
          <ListChecks className="text-teal-600 mr-2" size={34} />
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Lịch sử đơn dịch vụ
          </h1>
        </div>

        {/* NỘI DUNG CHÍNH (CONTENT) */}
        {orders.length === 0 ? (
          /* TRƯỜNG HỢP 1: KHÔNG CÓ ĐƠN HÀNG (Mảng rỗng) */
          <motion.div
            initial={{ opacity: 0, y: 20 }} // Trạng thái trước khi xuất hiện
            animate={{ opacity: 1, y: 0 }}   // Trạng thái hiển thị hoàn tất
            className="text-center text-gray-500 bg-white py-16 rounded-2xl shadow-lg"
          >
            <Clock size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">
              Bạn chưa có đơn dịch vụ nào được tạo.
            </p>
          </motion.div>
        ) : (
          /* TRƯỜNG HỢP 2: CÓ DANH SÁCH ĐƠN HÀNG */
          <AnimatePresence>
            {/* Grid Container hỗ trợ hiển thị responsive và chuyển động layout smoothly */}
            <motion.div
              layout
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {orders.map((order, i) => (
                /* Card đơn hàng đơn lẻ tích hợp hiệu ứng chuyển động mượt từ Framer Motion */
                <motion.div
                  key={order._id}
                  layout
                  initial={{ opacity: 0, y: 40 }} // Bay lên từ phía dưới khi mount
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} // Hiệu ứng xuất hiện so le (staggered delay) theo thứ tự mảng
                  whileHover={{ scale: 1.02, y: -4 }} // Phóng to nhẹ và nhấc lên khi hover chuột
                  onClick={() => navigate(`/orders/${order._id}`)} // Nhấp vào card để chuyển đến trang chi tiết
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 cursor-pointer transition-all duration-300 overflow-hidden"
                >
                  {/* PHẦN ĐẦU CARD: Tên dịch vụ & Trạng thái */}
                  <div className="p-5 border-b flex justify-between items-start bg-gradient-to-r from-teal-50 to-white">
                    <div>
                      <h2 className="font-semibold text-lg text-teal-700 group-hover:text-teal-800 transition">
                        {order.service?.name}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Mã đơn: {order._id.slice(-6).toUpperCase()} {/* Cắt lấy 6 ký tự cuối của ID làm mã hiển thị ngắn */}
                      </p>
                    </div>
                    {renderStatus(order.status)}
                  </div>

                  {/* PHẦN THÂN CARD: Chi tiết ngày hẹn, nhân viên, phương thức thanh toán */}
                  <div className="p-5 text-sm text-gray-600 space-y-3">
                    {/* Định dạng ngày giờ hiển thị theo chuẩn Việt Nam (vi-VN) */}
                    <p className="flex items-center">
                      <Calendar size={16} className="mr-2 text-gray-400" />
                      {new Date(order.scheduledAt).toLocaleDateString("vi-VN")}{" "}
                      lúc{" "}
                      {new Date(
                        order.startTime ? order.startTime : order.scheduledAt
                      ).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {/* Thông tin nhân viên phụ trách thực hiện dọn dẹp */}
                    <p className="flex items-center">
                      <UserRound size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium mr-1">Nhân viên:</span>
                      {order.staff
                        ? order.staff.name || order.staff.email
                        : "⏳ Chờ phân công"}
                    </p>

                    {/* Phương thức thanh toán được chọn */}
                    <p className="flex items-center">
                      <CreditCard size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium mr-1">Thanh toán:</span>
                      {order.paymentMethod === "COD"
                        ? "Khi hoàn thành"
                        : "Online (Momo)"}
                    </p>

                    {/* Tổng tiền thanh toán (Được định dạng dấu phân cách nghìn) */}
                    <div className="pt-3 border-t">
                      <p className="font-semibold text-gray-800 text-lg flex justify-between">
                        Tổng tiền:
                        <span className="text-teal-600">
                          {order.price?.toLocaleString("vi-VN") || "0"}₫
                        </span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}