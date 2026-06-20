import { useEffect, useState } from "react";
import axios from "axios";
import AssignForm from "../../components/admin/AssignForm";

export default function AssignShiftsPage() {
  // State lưu trữ danh sách đơn hàng nhận về từ API
  const [orders, setOrders] = useState([]);

  // State lưu ID của đơn hàng đang được chọn để chỉnh sửa/phân công
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Hàm gọi API lấy danh sách toàn bộ đơn hàng từ backend
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      setOrders(res.data); // Cập nhật danh sách đơn hàng vào state
    } catch (err) {
      console.error("Lỗi fetch orders", err); // Ghi nhận lỗi nếu gọi API thất bại
    }
  };

  // useEffect tự động kích hoạt hàm fetchOrders ngay khi trang được tải xong
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📋 Danh sách đơn hàng</h1>

      {/* Kiểm tra nếu không có đơn hàng nào thì hiển thị thông báo trống */}
      {orders.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border rounded-lg bg-gray-50">
          Không có đơn hàng nào
        </div>
      ) : (
        /* Khu vực hiển thị bảng danh sách đơn hàng (hỗ trợ scroll ngang trên mobile) */
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">Khách hàng</th>
                <th className="p-3 text-left">Dịch vụ</th>
                <th className="p-3 text-left">Nhân viên</th>
                <th className="p-3 text-left">Thời gian</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {/* Duyệt qua mảng orders để render từng dòng dữ liệu (Row) */}
              {orders.map((order, idx) => (
                <tr
                  key={order._id}
                  // Áp dụng màu nền xen kẽ (Zebra striping) giúp bảng dễ nhìn hơn
                  className={`border-t hover:bg-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                >
                  <td className="p-3">{order.customer?.name}</td>
                  <td className="p-3">{order.service?.name}</td>

                  {/* Hiển thị tên nhân viên, nếu chưa có thì hiện chữ "Chưa phân công" dạng in nghiêng */}
                  <td className="p-3">
                    {order.staff?.name || (
                      <span className="text-gray-400 italic">Chưa phân công</span>
                    )}
                  </td>

                  {/* Định dạng ngày tháng hiển thị theo chuẩn Việt Nam (DD/MM/YYYY, HH:MM:SS) */}
                  <td className="p-3">
                    {order.scheduledAt
                      ? new Date(order.scheduledAt).toLocaleString("vi-VN")
                      : "—"}
                  </td>

                  {/* Badge hiển thị màu sắc dựa theo trạng thái đơn hàng */}
                  <td className="p-3">
                    <StatusBadge status={order.status} />
                  </td>

                  {/* Nút bấm để gán ID đơn hàng hiện tại vào state selectedOrder, mở Form phân công */}
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedOrder(order._id)}
                      className="px-3 py-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Nếu có đơn hàng được chọn, hiển thị Component Form phân công ca trực (Modal/Form) */}
      {selectedOrder && (
        <AssignForm
          orderId={selectedOrder}
          onClose={() => setSelectedOrder(null)} // Tắt form bằng cách reset state về null
          onSuccess={fetchOrders} // Reset lại danh sách đơn hàng sau khi phân công thành công
        />
      )}
    </div>
  );
}

/**
 * Component con phụ trợ: Hiển thị Badge trạng thái đi kèm màu sắc tương ứng
 */
function StatusBadge({ status }) {
  // Bản đồ màu sắc (mapping) đại diện cho từng loại trạng thái hệ thống
  const colors = {
    pending: "bg-yellow-100 text-yellow-700",
    assigned: "bg-blue-100 text-blue-700",
    "in-progress": "bg-indigo-100 text-indigo-700",
    completed: "bg-green-100 text-green-700",
    canceled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"
        }`}
    >
      {status}
    </span>
  );
}