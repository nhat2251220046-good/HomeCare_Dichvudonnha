import { useState, useEffect } from "react";

export default function CustomerForm({ onSubmit, initialData }) {
  // Khởi tạo state lưu trữ toàn bộ dữ liệu nhập vào của form khách hàng
  const [form, setForm] = useState({
    clerkId: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // useEffect tự động chạy khi dữ liệu ban đầu (initialData) truyền từ component cha thay đổi
  // Thường dùng khi component này được tái sử dụng cho chức năng Sửa (Update) để đổ dữ liệu cũ vào các ô input
  useEffect(() => {
    if (initialData) {
      setForm({
        clerkId: initialData.clerkId || "",
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
      });
    }
  }, [initialData]);

  // Hàm xử lý sự kiện khi người dùng gõ/thay đổi giá trị ở bất kỳ ô input nào trong form
  // Cập nhật giá trị động dựa vào thuộc tính 'name' của thẻ input đó
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Hàm xử lý khi người dùng ấn nút Submit để gửi form
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi reload trang mặc định của trình duyệt
    onSubmit(form); // Gọi hàm callback onSubmit được truyền từ component cha và gửi kèm dữ liệu form hiện tại
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto bg-white p-6 rounded-xl shadow-md space-y-4 w-full max-w-md">
      {/* Trường nhập mã Clerk ID */}
      <div>
        <label className="block font-medium mb-1">Clerk ID</label>
        <input type="text" name="clerkId" value={form.clerkId} onChange={handleChange} required
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-indigo-500" />
      </div>

      {/* Trường nhập Tên khách hàng */}
      <div>
        <label className="block font-medium mb-1">Tên</label>
        <input type="text" name="name" value={form.name} onChange={handleChange}
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-indigo-500" />
      </div>

      {/* Trường nhập Email */}
      <div>
        <label className="block font-medium mb-1">Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange}
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-indigo-500" />
      </div>

      {/* Trường nhập Số điện thoại */}
      <div>
        <label className="block font-medium mb-1">Số điện thoại</label>
        <input type="text" name="phone" value={form.phone} onChange={handleChange}
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-indigo-500" />
      </div>

      {/* Trường nhập Địa chỉ */}
      <div>
        <label className="block font-medium mb-1">Địa chỉ</label>
        <input type="text" name="address" value={form.address} onChange={handleChange}
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:border-indigo-500" />
      </div>

      {/* Nút submit - Chữ hiển thị thay đổi động tùy thuộc vào việc có dữ liệu initialData truyền vào hay không */}
      <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
        {initialData ? "Cập nhật khách hàng" : "Thêm khách hàng"}
      </button>
    </form>
  );
}