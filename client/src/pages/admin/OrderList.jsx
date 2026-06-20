import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// DỮ LIỆU GIẢ LẬP (MOCK DATA) - Đồng bộ với ngữ cảnh hệ thống dịch vụ dọn nhà
const mockOrders = [
  {
    _id: "1",
    customer: { name: "Nguyễn Văn A" },
    branch: { name: "Chi nhánh Quận 1" },
    products: [{ product: { name: "Dọn dẹp căn hộ định kỳ" }, quantity: 1 }],
    totalAmount: 100000,
    status: "pending",
  },
  {
    _id: "2",
    customer: { name: "Trần Văn B" },
    branch: { name: "Chi nhánh Quận 3" },
    products: [{ product: { name: "Vệ sinh kính chung cư" }, quantity: 1 }],
    totalAmount: 200000,
    status: "completed",
  },
];

export default function OrderList() {
  // --- QUẢN LÝ CÁC TRẠNG THÁI (STATES) ---
  const [orders, setOrders] = useState([]);          // State lưu trữ danh sách đơn hàng
  const [currentPage, setCurrentPage] = useState(1); // Quản lý số trang hiện tại (Mặc định trang 1)
  const itemsPerPage = 10;                           // Giới hạn hiển thị 10 đơn hàng trên mỗi trang

  // SIDE EFFECT: Đổ dữ liệu giả lập vào State ngay sau khi component mount vào giao diện
  useEffect(() => {
    setOrders(mockOrders); // Sau này sẽ thay thế bằng một hàm gọi API (ví dụ: axios.get)
  }, []);

  // --- LOGIC PHÂN TRANG PHÍA CLIENT ---
  // Tính toán tổng số lượng trang dựa trên độ dài mảng dữ liệu
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  // Trích xuất danh sách đơn hàng của riêng trang hiện tại để đem đi render
  const currentOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Các hàm điều hướng quay lại (Prev) hoặc đi tới (Next) trang
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Tiêu đề trang chính */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Đơn đặt dịch vụ</h1>

      {/* Vùng hiển thị Bảng dữ liệu quản trị */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["#", "Khách hàng", "Chi nhánh", "Dịch vụ", "Tổng tiền", "Trạng thái", "Hành động"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {/* TRƯỜNG HỢP DANH SÁCH TRỐNG */}
            {currentOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500 font-medium">
                  Chưa có đơn đặt dịch vụ nào trong hệ thống
                </td>
              </tr>
            )}

            {/* DUYỆT MẢNG VÀ HIỂN THỊ TỪNG ĐƠN HÀNG */}
            {currentOrders.map((order, idx) => (
              <tr key={order._id} className="hover:bg-gray-50 transition">
                {/* Tính toán số thứ tự tăng tiến liên tục bất kể đang đứng ở phân trang nào */}
                <td className="px-4 py-3 text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{order.customer?.name || "Khách lẻ"}</td>
                <td className="px-4 py-3 text-gray-600">{order.branch?.name || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {order.products.map((p, index) => (
                    <div key={index} className="font-light">
                      {p.product.name} <span className="text-gray-400">x{p.quantity}</span>
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">{order.totalAmount.toLocaleString()} ₫</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {/* Tối ưu UI: Đổ màu trạng thái động sinh động bằng badge bo góc */}
                  {order.status === "completed" ? (
                    <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Đã hoàn thành
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Đang xử lý
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {/* Nút chuyển hướng xem chi tiết đơn hàng tương ứng dựa theo Id */}
                  <Link
                    to={`/admin-dashboard/orders/${order._id}`}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg shadow-sm hover:bg-indigo-700 transition font-medium"
                  >
                    Xem
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= THANH CONTROLS ĐIỀU HƯỚNG PHÂN TRANG ================= */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            Prev
          </button>

          {/* Duyệt mảng động dựa trên totalPages để sinh ra danh sách các nút số thứ tự trang */}
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentPage === idx + 1
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}