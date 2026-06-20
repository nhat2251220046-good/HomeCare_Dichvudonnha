import { useEffect, useState } from "react";
import axios from "axios";
import Meta from "../../components/Meta";

export default function StaffWorkPage() {
  // --- QUẢN LÝ TRẠNG THÁI (STATES) ---
  const [orders, setOrders] = useState([]);       // Lưu trữ danh sách gốc tất cả đơn hàng nhận từ API
  const [filter, setFilter] = useState("today"); // Trạng thái bộ lọc thời gian: 'today' (mặc định) | 'week' | 'all'

  // --- QUẢN LÝ SESSION TÀI KHOẢN ---
  // Lấy thông tin tài khoản đang đăng nhập từ sessionStorage
  const storedUser = sessionStorage.getItem("user");
  const user = storedUser
    ? JSON.parse(storedUser)
    : {
      // Mock dữ liệu dự phòng cục bộ khi chạy môi trường dev nếu không tìm thấy session
      id: "68c55b7d8d0d6ec66353bce7",
      name: "Nguyễn Văn A",
    };
  const staffId = user.id || user._id; // Trích xuất ID linh hoạt theo cấu trúc đối tượng dữ liệu

  // --- SIDE EFFECT: TỰ ĐỘNG GỌI API LẤY TOÀN BỘ ĐƠN HÀNG ---
  useEffect(() => {
    const fetchOrders = async () => {
      if (!staffId) return;
      try {
        // Gửi request lấy tất cả lịch sử công việc của nhân viên này từ server
        const res = await axios.get(`http://localhost:5000/api/orders/staff/${staffId}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Lỗi khi fetch danh sách công việc:", err);
      }
    };
    fetchOrders();
  }, [staffId]); // Mảng phụ thuộc theo dõi staffId nếu có sự thay đổi tài khoản

  // --- LOGIC BỘ LỌC THỜI GIAN (COMPUTED PROPERTY / DERIVED STATE) ---
  // Lọc trực tiếp mảng 'orders' gốc dựa theo state 'filter' hiện tại mà không làm mất dữ liệu ban đầu
  const filteredOrders = orders.filter((o) => {
    const date = new Date(o.scheduledAt); // Thời gian lên lịch của đơn hàng
    const today = new Date();             // Thời gian hiện tại của hệ thống

    // Trường hợp 1: Lọc theo ngày hôm nay
    if (filter === "today") {
      return date.toDateString() === today.toDateString(); // So sánh định dạng chuỗi Ngày-Tháng-Năm
    }

    // Trường hợp 2: Lọc theo tuần hiện tại (Từ Chủ Nhật đầu tuần đến Thứ Bảy cuối tuần)
    else if (filter === "week") {
      const weekStart = new Date(today);
      // Đưa mốc thời gian về ngày đầu tuần (Chủ nhật) bằng cách trừ đi số ngày đã qua trong tuần (.getDay())
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0); // Đặt mốc giờ về 00:00:00 đầu ngày để so sánh chính xác

      const weekEnd = new Date(weekStart);
      // Cộng thêm 6 ngày vào ngày đầu tuần để xác định mốc ngày cuối tuần (Thứ bảy)
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999); // Đặt mốc giờ về cuối ngày

      return date >= weekStart && date <= weekEnd; // Trả về true nếu ngày hẹn nằm trong khoảng tuần này
    }

    // Trường hợp 3: Hiển thị tất cả lịch sử công việc ('all')
    return true;
  });

  // --- SUB-COMPONENT: BADGE TRẠNG THÁI MÀU SẮC (STATUS BADGE) ---
  const StatusBadge = ({ status }) => {
    // Ánh xạ bảng mã màu nền và màu chữ CSS tương ứng với từng trạng thái
    const colors = {
      assigning: "bg-gray-100 text-gray-700",
      pending: "bg-yellow-100 text-yellow-700",
      accepted: "bg-blue-100 text-blue-700",
      in_progress: "bg-indigo-100 text-indigo-700",
      completed: "bg-green-100 text-green-700",
      canceled: "bg-red-100 text-red-700",
    };

    // Ánh xạ chuỗi nhãn hiển thị tiếng Việt trên giao diện
    const labels = {
      assigning: "Đang phân công",
      pending: "Chờ xử lý",
      accepted: "Đã nhận",
      in_progress: "Đang làm",
      completed: "Hoàn thành",
      canceled: "Đã hủy",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>
        {labels[status] || status}
      </span>
    );
  };

  // --- GIAO DIỆN CHÍNH (RENDER UI) ---
  return (
    <div className="p-6 space-y-6">
      {/* Thẻ Meta cập nhật SEO Header tiêu đề trang */}
      <Meta title="Lịch làm việc của bạn" description="Lịch làm việc của bạn" />

      <h1 className="text-2xl font-bold">
        📋 Lịch sử làm việc của <span className="text-blue-600">{user.name}</span>
      </h1>

      {/* KHU VỰC BỘ LỌC (SELECT DROPDOWN FILTER) */}
      <div className="flex items-center gap-3">
        <label className="font-medium">Hiển thị:</label>
        <select
          className="border rounded p-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={filter}
          onChange={(e) => setFilter(e.target.value)} // Thay đổi state bộ lọc khi người dùng chọn mục khác
        >
          <option value="today">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="all">Tất cả lịch sử</option>
        </select>
      </div>

      {/* KHU VỰC BẢNG HIỂN THỊ DỮ LIỆU LỊCH SỬ CÔNG VIỆC */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mt-4">
        <table className="w-full border-collapse">
          {/* Đầu bảng (Table Header) */}
          <thead className="bg-gray-100">
            <tr className="border-b">
              <th className="p-2 text-left">Khách hàng</th>
              <th className="p-2 text-left">Dịch vụ</th>
              <th className="p-2 text-left">Chi nhánh</th>
              <th className="p-2 text-left">Ngày & giờ</th>
              <th className="p-2 text-left">Trạng thái</th>
            </tr>
          </thead>
          {/* Thân bảng (Table Body) */}
          <tbody>
            {filteredOrders.length > 0 ? (
              // Vòng lặp duyệt qua danh sách mảng đã được lọc để render hàng (row) dữ liệu
              filteredOrders.map((o) => (
                <tr key={o._id} className="border-b hover:bg-gray-50 transition duration-150">
                  {/* Tên khách hàng (Hiển thị kí tự dự phòng '—' nếu null/undefined) */}
                  <td className="p-2">{o.customer?.name || "—"}</td>

                  {/* Tên dịch vụ kèm theo định dạng tiền tệ vi-VNđ */}
                  <td className="p-2">
                    {o.service?.name} {o.service?.price && `(${o.service.price.toLocaleString("vi-VN")}đ)`}
                  </td>

                  {/* Tên Chi nhánh */}
                  <td className="p-2">{o.branch?.name || "—"}</td>

                  {/* Ngày giờ thực hiện công việc chuyển đổi theo chuẩn vi-VN */}
                  <td className="p-2">{new Date(o.scheduledAt).toLocaleString("vi-VN")}</td>

                  {/* Cột hiển thị Badge trạng thái công việc */}
                  <td className="p-2">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))
            ) : (
              /* Trạng thái trống khi bộ lọc không khớp với bất kỳ bản ghi nào */
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  Không có lịch sử công việc phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}