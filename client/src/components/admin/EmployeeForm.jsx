import { useState, useEffect } from "react";

export default function EmployeeForm({ onSubmit, initialData, branches }) {
  // 1. KHỞI TẠO STATE CHO FORM (Chứa toàn bộ dữ liệu của nhân viên)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
    password: "",
    role: "staff",
    branch: "",
    shifts: [], // Danh sách các ca làm việc
  });

  // 2. TỰ ĐỘNG ĐỔ DỮ LIỆU VÀO FORM KHI CÓ DATA CHỈNH SỬA (EDIT MODE)
  useEffect(() => {
    if (initialData) {
      // Nếu có dữ liệu cũ truyền vào -> Chuyển sang chế độ Cập nhật
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        avatarUrl: initialData.avatarUrl || "",
        password: "", // Luôn để trống password vì lý do bảo mật
        role: initialData.role || "staff",
        branch: initialData.branch?._id || "", // Lấy ID của chi nhánh
        // Định dạng lại mảng ca làm việc để hiển thị lên thẻ input HTML
        shifts: (initialData.shifts || []).map(s => ({
          // Chuyển format ngày từ ISO (Database) sang dạng YYYY-MM-DD để hiển thị trên input type="date"
          date: s.date ? new Date(s.date).toISOString().split("T")[0] : "",
          startTime: s.startTime || "",
          endTime: s.endTime || "",
        })),
      });
    } else {
      // Nếu không có initialData -> Reset form về trống (Chế độ Thêm mới)
      setForm({
        name: "",
        email: "",
        phone: "",
        avatarUrl: "",
        password: "",
        role: "staff",
        branch: "",
        shifts: [],
      });
    }
  }, [initialData]);

  // 3. HÀM XỬ LÝ SỰ KIỆN THAY ĐỔI CÁC THÔNG TIN CƠ BẢN (Name, Email, Phone,...)
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 4. HÀM XỬ LÝ SỰ KIỆN THAY ĐỔI THÔNG TIN TRONG TỪNG CA LÀM VIỆC (SHIFTS)
  const handleShiftChange = (index, field, value) => {
    const newShifts = [...form.shifts];
    newShifts[index][field] = value; // Cập nhật trường (date, startTime, hoặc endTime) tại vị trí index
    setForm({ ...form, shifts: newShifts });
  };

  // 5. HÀM THÊM MỘT CA LÀM VIỆC MỚI VÀO DANH SÁCH
  const addShift = () => {
    setForm({
      ...form,
      shifts: [...form.shifts, { date: "", startTime: "", endTime: "" }],
    });
  };

  // 6. HÀM XÓA MỘT CA LÀM VIỆC KHỎI DANH SÁCH THEO INDEX
  const removeShift = (index) => {
    setForm({
      ...form,
      shifts: form.shifts.filter((_, i) => i !== index),
    });
  };

  // 7. HÀM XỬ LÝ KHI NGƯỜI DÙNG BẤM NÚT SUBMIT (GỬI FORM)
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi reload trang mặc định của trình duyệt

    const payload = { ...form };

    // Nếu là chế độ chỉnh sửa và người dùng để trống ô mật khẩu -> Xóa trường password để tránh ghi đè mật khẩu cũ
    if (!payload.password) delete payload.password;

    // Chuyển đổi định dạng ngày (string từ input) sang Object Date trước khi gửi lên Backend
    payload.shifts = payload.shifts.map((s) => ({
      date: s.date ? new Date(s.date) : null,
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    // Gọi hàm callback từ component cha để xử lý tiếp (Gọi API thêm/sửa)
    onSubmit(payload);
  };

  // 8. GIAO DIỆN (RENDER)
  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto bg-white p-6 rounded-xl shadow-md space-y-4 w-full"
    >
      {/* Ô nhập tên nhân viên */}
      <div>
        <label className="block font-medium mb-1">Tên nhân viên</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-indigo-500"
        />
      </div>

      {/* Ô nhập Email */}
      <div>
        <label className="block font-medium mb-1">Địa chỉ Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-indigo-500"
        />
      </div>

      {/* Ô nhập Số điện thoại */}
      <div>
        <label className="block font-medium mb-1">Số điện thoại</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-indigo-500"
        />
      </div>

      {/* Ô nhập đường dẫn ảnh đại diện */}
      <div>
        <label className="block font-medium mb-1">Ảnh đại diện (Đường dẫn URL)</label>
        <input
          type="text"
          name="avatarUrl"
          value={form.avatarUrl}
          onChange={handleChange}
          placeholder="https://example.com/avatar.jpg"
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-indigo-500"
        />
      </div>

      {/* Ô nhập mật khẩu */}
      <div>
        <label className="block font-medium mb-1">
          Mật khẩu {initialData ? "(Để trống nếu không muốn thay đổi)" : ""}
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-indigo-500"
          placeholder={initialData ? "Nhập mật khẩu mới nếu muốn đổi" : "Nhập mật khẩu cho nhân viên"}
          required={!initialData} // Bắt buộc nhập nếu là Thêm mới, không bắt buộc nếu là Chỉnh sửa
        />
      </div>

      {/* Ô chọn vai trò/phân quyền */}
      <div>
        <label className="block font-medium mb-1">Vai trò hệ thống</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-indigo-500"
        >
          <option value="admin">Quản trị viên (Admin)</option>
          <option value="manager">Quản lý (Manager)</option>
          <option value="cashier">Thu ngân (Cashier)</option>
          <option value="staff">Nhân viên (Staff)</option>
        </select>
      </div>

      {/* Ô chọn chi nhánh làm việc */}
      <div>
        <label className="block font-medium mb-1">Chi nhánh trực thuộc</label>
        <select
          name="branch"
          value={form.branch}
          onChange={handleChange}
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-indigo-500"
        >
          <option value="">-- Chọn chi nhánh --</option>
          {branches?.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Khu vực quản lý danh sách các Ca làm việc (Shifts) */}
      <div>
        <label className="block font-medium mb-1">Lịch trình ca làm việc</label>
        {form.shifts.map((shift, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            {/* Chọn Ngày làm việc */}
            <input
              type="date"
              value={shift.date}
              required
              onChange={(e) => handleShiftChange(index, "date", e.target.value)}
              className="border rounded p-1"
            />
            {/* Chọn Giờ bắt đầu */}
            <input
              type="time"
              value={shift.startTime}
              required
              onChange={(e) => handleShiftChange(index, "startTime", e.target.value)}
              className="border rounded p-1"
            />
            {/* Chọn Giờ kết thúc */}
            <input
              type="time"
              value={shift.endTime}
              required
              onChange={(e) => handleShiftChange(index, "endTime", e.target.value)}
              className="border rounded p-1"
            />
            {/* Nút xóa ca làm việc này */}
            <button
              type="button"
              onClick={() => removeShift(index)}
              className="text-red-500 hover:underline font-bold px-2"
              title="Xóa ca này"
            >
              X
            </button>
          </div>
        ))}
        {/* Nút thêm một hàng ca làm việc mới */}
        <button
          type="button"
          onClick={addShift}
          className="text-indigo-600 hover:underline mt-1 text-sm font-medium"
        >
          + Thêm ca làm việc
        </button>
      </div>

      {/* Nút Submit gửi toàn bộ form */}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors font-medium mt-4"
      >
        {initialData ? "Cập nhật thông tin" : "Tạo mới nhân viên"}
      </button>
    </form>
  );
}