import { useEffect, useState } from "react";
import axios from "axios";
import { User, Briefcase, Building2, Clock, CheckCircle, ListChecks } from "lucide-react";

export default function StaffDashboard() {
  // --- QUẢN LÝ TRẠNG THÁI (STATES) ---
  const [employee, setEmployee] = useState(null);       // Lưu trữ dữ liệu hồ sơ và lịch ca làm của nhân viên
  const [assignedOrders, setAssignedOrders] = useState([]); // Danh sách các đơn hàng được gán cho nhân viên này
  const [loading, setLoading] = useState(true);         // Trạng thái chờ tải dữ liệu khi vào trang

  // --- SIDE EFFECT: TỰ ĐỘNG GỌI API KHI TẢI TRANG ---
  useEffect(() => {
    // Đọc thông tin tài khoản từ sessionStorage để lấy ID nhân viên
    const sessionUser = sessionStorage.getItem("user");
    if (!sessionUser) return;

    const { id } = JSON.parse(sessionUser);

    // Hàm bất đồng bộ thực hiện tải song song/nối tiếp dữ liệu từ các API
    const fetchData = async () => {
      try {
        // 1. Gọi API lấy thông tin chi tiết của nhân viên (bao gồm cả mảng shifts)
        const empRes = await axios.get(`http://localhost:5000/api/employees/get/${id}`);
        setEmployee(empRes.data);

        // 2. Gọi API lấy danh sách đơn hàng được phân công
        const orderRes = await axios
          .get(`http://localhost:5000/api/orders/assigned/${id}`)
          .catch(() => ({
            // MOCK DATA: Tự động trả về dữ liệu dự phòng nếu API đơn hàng bị lỗi hoặc chưa có dữ liệu backend
            data: [
              { _id: "DH001", status: "pending" },
              { _id: "DH002", status: "completed" },
            ],
          }));
        setAssignedOrders(orderRes.data || []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu tổng quan:", err);
      } finally {
        setLoading(false); // Đóng màn hình loading sau khi hoàn tất các đợt gọi dữ liệu
      }
    };

    fetchData();
  }, []);

  // --- TRẠNG THÁI CHỜ (LOADING SCREEN) ---
  if (loading) return <p className="p-6 text-center">⏳ Đang tải trang chủ...</p>;

  // --- HÀM TÁI TẢI DỮ LIỆU THỦ CÔNG (MANUAL REFRESH) ---
  const refreshStaffData = async () => {
    setLoading(true);
    try {
      const sessionUser = JSON.parse(sessionStorage.getItem("user"));
      if (!sessionUser?.id) return;

      // Khởi chạy lại các request để đồng bộ dữ liệu mới nhất từ database
      const empRes = await axios.get(`http://localhost:5000/api/employees/get/${sessionUser.id}`);
      setEmployee(empRes.data);

      const orderRes = await axios.get(`http://localhost:5000/api/orders/assigned/${sessionUser.id}`);
      setAssignedOrders(orderRes.data);
    } catch (err) {
      console.error("Lỗi làm mới dữ liệu staff:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- ĐO LƯỜNG & PHÂN LOẠI THỐNG KÊ (DERIVED STATE) ---
  // Đếm số lượng đơn hàng đã hoàn thành và đơn hàng đang xử lý dựa trên mảng assignedOrders
  const completedOrders = assignedOrders.filter(o => o.status === "completed").length;
  const processingOrders = assignedOrders.filter(o => o.status !== "completed").length;

  // --- GIAO DIỆN CHÍNH (RENDER) ---
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* KHU VỰC 1: TIÊU ĐỀ CHÀO MỪNG & NÚT ĐỒNG BỘ */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          👋 Xin chào, <span className="text-green-600">{employee?.name}</span>
        </h1>
        <button
          onClick={refreshStaffData}
          className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Làm mới ca làm
        </button>
      </div>

      {/* KHU VỰC 2: THÔNG TIN TÓM TẮT NHÂN VIÊN */}
      <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 hover:shadow-2xl transition">
        {/* Ảnh đại diện: Ưu tiên avatarUrl từ DB, nếu không có sẽ sinh tự động theo tên */}
        <img
          src={
            employee?.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(employee?.name)}&background=34d399&color=fff`
          }
          alt={employee?.name}
          className="w-28 h-28 rounded-full border-4 border-green-400 object-cover"
        />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{employee?.name}</h2>
          <p className="text-gray-600 flex items-center gap-2 py-1"><User size={18} /> {employee?.email}</p>
          <p className="text-gray-600 flex items-center gap-2 py-1"><Briefcase size={18} /> {employee?.role}</p>
          <p className="text-gray-600 flex items-center gap-2 py-1"><Building2 size={18} /> {employee?.branch?.name || "Chưa gán chi nhánh"}</p>
        </div>
      </div>

      {/* KHU VỰC 3: BA THẺ THỐNG KÊ NHANH (STATS GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          className="bg-gradient-to-r from-green-400 to-green-500"
          icon={<Clock size={32} />}
          value={employee?.shifts?.length || 0}
          label="Tổng số ca đã làm"
        />
        <StatsCard
          className="bg-gradient-to-r from-blue-400 to-blue-500"
          icon={<CheckCircle size={32} />}
          value={completedOrders}
          label="Đơn đã hoàn thành"
        />
        <StatsCard
          className="bg-gradient-to-r from-yellow-400 to-yellow-500"
          icon={<ListChecks size={32} />}
          value={processingOrders}
          label="Đơn đang xử lý"
        />
      </div>

      {/* KHU VỰC 4: DANH SÁCH CA LÀM SẮP TỚI (Giới hạn lấy tối đa 3 ca bằng .slice) */}
      <Card title="Ca làm sắp tới" icon={<Clock size={20} />} color="green">
        {employee?.shifts?.length > 0 ? (
          <ul className="divide-y text-gray-700">
            {employee.shifts.slice(0, 3).map((shift, idx) => (
              <li key={idx} className="py-3 flex justify-between hover:bg-green-50 rounded px-2 transition">
                {/* Định dạng hiển thị ngày tháng theo chuẩn vi-VN */}
                <span>{new Date(shift.date).toLocaleDateString("vi-VN")}</span>
                <span className="text-sm text-gray-500">{shift.startTime} - {shift.endTime}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Chưa có ca làm nào.</p>
        )}
      </Card>

      {/* KHU VỰC 5: DANH SÁCH ĐƠN HÀNG ĐƯỢC PHÂN CÔNG (Giới hạn hiển thị tối đa 5 đơn) */}
      <Card title="Đơn được phân công" icon={<ListChecks size={20} />} color="blue">
        {assignedOrders.length > 0 ? (
          <ul className="divide-y text-gray-700">
            {assignedOrders.slice(0, 5).map(order => (
              <li key={order._id} className="py-3 flex justify-between hover:bg-blue-50 rounded px-2 transition">
                <span>Mã đơn: <span className="font-semibold">{order._id}</span></span>
                {/* Đổi màu badge linh hoạt dựa theo trạng thái xử lý của đơn hàng */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${order.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {order.status === "completed" ? "Hoàn thành" : "Đang xử lý"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Không có đơn nào được phân công.</p>
        )}
      </Card>
    </div>
  );
}

// --- SUB-COMPONENT 1: CARD THỐNG KÊ (REUSABLE STATS CARD) ---
function StatsCard({ className, icon, value, label }) {
  return (
    <div className={`text-white p-6 rounded-2xl shadow-lg flex flex-col items-center hover:shadow-2xl transition ${className}`}>
      {icon}
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="opacity-90 text-center">{label}</p>
    </div>
  );
}

// --- SUB-COMPONENT 2: CARD NỀN TRẮNG CHỨA NỘI DUNG (REUSABLE BOX CARD) ---
function Card({ title, icon, color, children }) {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl transition">
      {/* Màu tiêu đề chữ biến đổi linh hoạt theo prop color truyền vào */}
      <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 text-${color}-600`}>
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}