import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// DỮ LIỆU GIẢ LẬP (MOCK DATA) - Sử dụng để kiểm thử giao diện trước khi kết nối API thật
const mockOrders = [
  {
    _id: "1",
    customer: { name: "Nguyễn Văn A" },
    branch: { name: "Chi nhánh Quận 1" },
    totalAmount: 100000,
    paymentMethod: "Tiền mặt",
    status: "pending", // Trạng thái: Đang chờ xử lý
    products: [{ product: { _id: "p1", name: "Dọn dẹp phòng khách" }, quantity: 1, price: 100000 }],
  },
  {
    _id: "2",
    customer: { name: "Trần Thị B" },
    branch: { name: "Chi nhánh Quận 3" },
    totalAmount: 200000,
    paymentMethod: "Ví MoMo",
    status: "completed", // Trạng thái: Đã hoàn thành
    products: [{ product: { _id: "p2", name: "Vệ sinh máy giặt kịch sàn" }, quantity: 1, price: 200000 }],
  },
];

export default function OrderDetail() {
  // --- LẤY THAM SỐ URL & QUẢN LÝ TRẠNG THÁI ---
  const { id } = useParams(); // Trích xuất ID đơn hàng từ URL params
  const [order, setOrder] = useState(null); // State lưu trữ thông tin chi tiết của đơn hàng tìm được

  // SIDE EFFECT: Tìm kiếm thông tin đơn hàng trong mảng Mock Data mỗi khi ID thay đổi
  useEffect(() => {
    const found = mockOrders.find((o) => o._id === id);
    setOrder(found || null);
  }, [id]);

  // --- HÀM XỬ LÝ: THAY ĐỔI TRẠNG THÁI ĐƠN HÀNG LOCAL ---
  const handleStatusChange = (newStatus) => {
    // Tạm thời cập nhật trạng thái ngay tại client (Sau này sẽ thay bằng một lệnh gọi API axios.put)
    setOrder((prev) => ({ ...prev, status: newStatus }));
  };

  // FALLBACK UI: Hiển thị màn hình chờ nếu chưa tìm thấy dữ liệu đơn hàng
  if (!order) return <p className="p-6 text-center text-gray-500 font-medium">Đang tải chi tiết đơn hàng...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-3xl flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Chi tiết đơn hàng</h1>
        <Link
          to="/admin-dashboard/orders"
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium text-sm shadow-sm"
        >
          Quay lại
        </Link>
      </div>

      {/* Khối Thông tin chi tiết Đơn hàng (Card Container) */}
      <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-md space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 pb-4">
          <p className="text-gray-600"><strong>Khách hàng:</strong> <span className="text-gray-900 ml-1">{order.customer?.name || "Khách lẻ"}</span></p>
          <p className="text-gray-600"><strong>Chi nhánh:</strong> <span className="text-gray-900 ml-1">{order.branch?.name || "-"}</span></p>
          <p className="text-gray-600"><strong>Phương thức thanh toán:</strong> <span className="text-gray-900 ml-1">{order.paymentMethod}</span></p>

          {/* Cải tiến hiển thị Trạng thái bằng Badge màu sắc trực quan */}
          <div className="text-gray-600 flex items-center gap-1">
            <strong>Trạng thái:</strong>
            {order.status === "completed" && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Đã hoàn thành</span>
            )}
            {order.status === "pending" && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Đang xử lý</span>
            )}
            {order.status === "canceled" && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">Đã hủy đơn</span>
            )}
          </div>
        </div>

        {/* Khối hiển thị Danh sách Dịch vụ đã đặt */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Dịch vụ sử dụng:</h3>
          <ul className="space-y-2">
            {order.products.map((p) => (
              <li key={p.product._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-700 font-medium">
                  {p.product.name} <span className="text-gray-400 font-normal">x {p.quantity}</span>
                </span>
                <span className="text-gray-900 font-semibold">{p.price.toLocaleString()} ₫</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Khối Tổng tiền hiển thị góc phải */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xl font-bold text-gray-800">Tổng tiền thanh toán:</span>
          <span className="text-2xl font-extrabold text-indigo-600">{order.totalAmount.toLocaleString()} ₫</span>
        </div>

        {/* Khối Nút thao tác thay đổi trạng thái nhanh */}
        {/* Chỉ hiển thị các nút tác vụ nếu đơn hàng chưa rơi vào 2 trạng thái đóng là 'hoàn thành' hoặc 'hủy bỏ' */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          {order.status !== "completed" && order.status !== "canceled" && (
            <>
              <button
                onClick={() => handleStatusChange("completed")}
                className="flex-1 md:flex-none px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition shadow-sm"
              >
                Hoàn thành
              </button>
              <button
                onClick={() => handleStatusChange("canceled")}
                className="flex-1 md:flex-none px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition shadow-sm"
              >
                Hủy đơn
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}