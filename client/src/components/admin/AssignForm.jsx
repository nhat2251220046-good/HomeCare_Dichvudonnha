import { useEffect, useState } from "react";
import axios from "axios";
import { X, Loader2 } from "lucide-react";

export default function AssignForm({ orderId, onClose, onSuccess }) {
  // --- Khởi tạo các State quản lý dữ liệu ---
  const [order, setOrder] = useState(null); // Lưu thông tin chi tiết của đơn hàng hiện tại
  const [employees, setEmployees] = useState([]); // Lưu danh sách nhân viên thuộc chi nhánh
  const [staffId, setStaffId] = useState(""); // Lưu ID của nhân viên được chọn để phân công
  const [status, setStatus] = useState(""); // Lưu trạng thái đơn hàng được chọn
  const [scheduledAt, setScheduledAt] = useState(""); // Lưu thời gian hẹn làm việc (định dạng local cho input)
  const [loadingEmployees, setLoadingEmployees] = useState(false); // Trạng thái loading khi tải danh sách nhân viên
  const [saving, setSaving] = useState(false); // Trạng thái loading khi đang lưu dữ liệu (gọi API update)

  // 👉 Hàm chuẩn chuyển UTC (từ database) → local ISO string (hiển thị đúng trên input datetime-local của trình duyệt)
  const toLocalISOString = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000; // Tính độ lệch múi giờ tính bằng miliseconds
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16); // Trả về dạng YYYY-MM-DDTHH:mm
  };

  // 👉 Hàm chuẩn chuyển local (từ input trình duyệt) → UTC trước khi gửi lên server lưu vào database
  const toUTCISOString = (localString) => {
    if (!localString) return null;
    const date = new Date(localString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + tzOffset).toISOString(); // Trả về chuỗi ISO dạng UTC chuẩn toàn cầu
  };

  // useEffect chạy khi có orderId: Gọi hàm tải thông tin chi tiết của đơn hàng
  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  // useEffect tự động chạy lại khi thay đổi thời gian đặt lịch hoặc thay đổi chi nhánh của đơn hàng
  useEffect(() => {
    if (order?.branch?._id) {
      fetchEmployees(order.branch._id, scheduledAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduledAt, order?.branch?._id]);

  // Hàm API lấy thông tin chi tiết đơn hàng theo orderId
  const fetchOrder = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
      const data = res.data;

      // Cập nhật các state liên quan dựa trên dữ liệu đơn hàng nhận được
      setOrder(data);
      setStaffId(data.staff?._id || "");
      setStatus(data.status || "pending");
      setScheduledAt(toLocalISOString(data.scheduledAt)); // Chuyển đổi thời gian về local trước khi nạp vào input

      // Nếu đơn hàng có thông tin chi nhánh, tiến hành tải danh sách nhân viên của chi nhánh đó luôn
      if (data.branch?._id) {
        await fetchEmployees(data.branch._id, data.scheduledAt);
      }
    } catch (err) {
      console.error("❌ Lỗi fetch order:", err);
    }
  };

  // Hàm API lấy danh sách nhân viên thuộc chi nhánh dựa trên trạng thái bận rảnh của ngày được chọn
  const fetchEmployees = async (branchId, scheduledAtInput) => {
    try {
      setLoadingEmployees(true);

      // Xác định ngày mục tiêu để kiểm tra lịch bận rảnh (ưu tiên thời gian đang chọn trên input)
      let targetDate = scheduledAtInput || order?.scheduledAt;
      let dateStr = "";

      if (targetDate) {
        // Lấy ngày đúng theo múi giờ địa phương Việt Nam (tránh bị lệch ngày do múi giờ UTC khi cắt chuỗi)
        const d = new Date(targetDate);
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localDate = new Date(d.getTime() - tzOffset);
        dateStr = localDate.toISOString().slice(0, 10); // Cắt lấy chuỗi dạng YYYY-MM-DD
      } else {
        // Nếu không có thời gian, mặc định lấy ngày hôm nay theo múi giờ địa phương
        const now = new Date();
        const tzOffset = now.getTimezoneOffset() * 60000;
        const localDate = new Date(now.getTime() - tzOffset);
        dateStr = localDate.toISOString().slice(0, 10);
      }

      let list = [];
      try {
        // Thử gọi API lấy danh sách kèm trạng thái bận/rảnh theo ngày (availability)
        const res = await axios.get(
          `http://localhost:5000/api/employees/branch/${branchId}/availability?date=${dateStr}`
        );
        list = Array.isArray(res.data) ? res.data : [];
      } catch {
        // Phương án dự phòng (fallback) nếu API kiểm tra lịch bận rảnh không hoạt động hoặc lỗi
        // Lấy toàn bộ nhân viên của chi nhánh và tạm thời coi tất cả đều rảnh (busy: false)
        const res2 = await axios.get(
          `http://localhost:5000/api/employees/branch/${branchId}`
        );
        list = (res2.data || []).map((e) => ({
          _id: e._id,
          name: e.name,
          busy: false,
        }));
      }

      // Duyệt danh sách, gắn cờ 'isCurrent' để đánh dấu nhân viên nào đang đảm nhận đơn hàng hiện tại
      const withFlags = list.map((e) => ({
        ...e,
        isCurrent: order?.staff?._id === e._id,
      }));

      // Trường hợp nhân viên cũ đã đổi chi nhánh hoặc không nằm trong danh sách trả về,
      // vẫn cần push họ vào danh sách hiển thị để tránh bị mất thông tin trên giao diện select.
      if (order?.staff && !withFlags.some((e) => e._id === order.staff._id)) {
        withFlags.push({
          _id: order.staff._id,
          name: order.staff.name,
          busy: false,
          isCurrent: true,
        });
      }

      setEmployees(withFlags); // Cập nhật danh sách nhân viên vào state để render
    } catch (err) {
      console.error("❌ Lỗi fetch employees:", err);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false); // Tắt trạng thái loading nhân viên
    }
  };

  // Hàm xử lý lưu thông tin phân công đơn hàng khi bấm nút "Lưu"
  const handleSave = async () => {
    try {
      setSaving(true);
      // Xây dựng payload để gửi lên server, chuyển thời gian hẹn về dạng UTC chuẩn hóa
      const payload = {
        staffId,
        scheduledAt: toUTCISOString(scheduledAt),
      };

      // Chỉ gửi thuộc tính status khi người dùng chọn một giá trị hợp lệ cụ thể
      if (status && status.trim()) {
        payload.status = status;
      }

      // Giữ tương thích với backend phiên bản cũ nếu backend đọc dữ liệu thông qua trường 'staff' thay vì 'staffId'
      if (staffId) {
        payload.staff = staffId;
      }

      // Gọi API PATCH để cập nhật một phần dữ liệu của đơn hàng
      await axios.patch(`http://localhost:5000/api/orders/${orderId}`, payload);

      await fetchOrder(); // Tải lại thông tin đơn hàng mới nhất sau khi lưu thành công
      onSuccess?.(); // Kích hoạt hàm callback báo thành công từ component cha (nếu có)
      onClose?.(); // Đóng Modal form lại
    } catch (err) {
      console.error("❌ Lỗi update order:", err);
    } finally {
      setSaving(false); // Tắt trạng thái loading lưu dữ liệu
    }
  };

  // Nếu chưa lấy được thông tin đơn hàng, không render gì cả (tránh lỗi crash giao diện do thiếu data)
  if (!order) return null;

  // Biến check xem đơn hàng hiện tại đã có nhân viên phụ trách hay chưa
  const hasAssignedStaff = Boolean(staffId || order?.staff?._id);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg animate-fadeIn">
        {/* Phần đầu Modal (Header) */}
        <div className="flex justify-between items-center border-b px-5 py-3 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-700">
            Phân công đơn hàng
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Thân Modal (Body) chứa form nhập liệu */}
        <div className="p-5 space-y-4">
          {/* Hiển thị các thông tin cố định của đơn hàng */}
          <InfoField label="Khách hàng" value={order.customer?.name} />
          <InfoField label="Dịch vụ" value={order.service?.name} />
          <InfoField label="Chi nhánh" value={order.branch?.name} />

          {/* Chọn thời gian làm việc */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Thời gian làm
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Khi thay đổi ngày, hệ thống sẽ kiểm tra lại nhân viên bận/rảnh.
            </p>
          </div>

          {/* Chọn nhân viên phụ trách */}
          <div>
            <label className="block text-sm font-medium mb-1">Nhân viên</label>

            {loadingEmployees ? (
              /* Hiển thị trạng thái đang tải danh sách nhân viên */
              <div className="flex items-center justify-center gap-2 border rounded-lg bg-gray-50 p-2 text-gray-600">
                <Loader2 size={16} className="animate-spin" />
                <span>Đang tải danh sách...</span>
              </div>
            ) : (
              /* Dropdown chọn nhân viên */
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Chưa phân công --</option>
                {employees.map((emp) => {
                  // Vô hiệu hóa (disabled) nếu nhân viên bận lịch khác VÀ không phải là nhân viên đang xử lý đơn này
                  const disabled = emp.busy && !emp.isCurrent;
                  return (
                    <option
                      key={emp._id}
                      value={emp._id}
                      disabled={disabled}
                      className={disabled ? "text-gray-400" : "text-gray-900"}
                    >
                      {emp.name}
                      {emp.isCurrent
                        ? " (Đang phụ trách đơn này)"
                        : emp.busy
                          ? " (Đã được phân công)"
                          : ""}
                    </option>
                  );
                })}
              </select>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Nhân viên có nhãn <i>(Đã được phân công)</i> là đã có lịch làm
              trong ngày và không thể chọn được.
            </p>
          </div>

          {/* Chọn trạng thái đơn hàng */}
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Giữ nguyên trạng thái --</option>
              <option value="assigning">Đang phân công</option>
              <option value="pending">Chờ xử lý</option>
              <option value="accepted">Đã nhận</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="canceled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Phần chân Modal (Footer) chứa các nút hành động */}
        <div className="flex justify-end gap-2 border-t px-5 py-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-white ${saving
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              } transition`}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component phụ trách hiển thị các trường thông tin dạng Read-only (chỉ đọc)
function InfoField({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <p className="p-2 bg-gray-100 rounded-lg text-gray-800">
        {value || "—"}
      </p>
    </div>
  );
}