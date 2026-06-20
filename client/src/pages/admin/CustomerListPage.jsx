import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function CustomerListPage() {
  // State lưu trữ danh sách toàn bộ khách hàng lấy từ server
  const [customers, setCustomers] = useState([]);

  // State quản lý trạng thái tải dữ liệu (Hiển thị loading khi đang gọi API)
  const [loading, setLoading] = useState(true);

  // State quản lý số trang hiện tại của bộ phân trang (Mặc định ở trang 1)
  const [currentPage, setCurrentPage] = useState(1);

  // Số lượng khách hàng hiển thị tối đa trên một trang
  const itemsPerPage = 10;

  // Tự động gọi hàm lấy danh sách khách hàng ngay sau khi component hiển thị lần đầu
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Hàm gọi API lấy danh sách toàn bộ khách hàng từ backend
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/customers/getall");
      setCustomers(res.data); // Lưu dữ liệu vào state customers
    } catch (err) {
      console.error("Lỗi khi lấy danh sách khách hàng:", err);
      toast.error("Lấy danh sách khách hàng thất bại");
    } finally {
      setLoading(false); // Tắt trạng thái loading bất kể API thành công hay thất bại
    }
  };

  // Hàm xử lý khi người dùng ấn nút Xóa một khách hàng
  const handleDelete = async (id) => {
    // Hiển thị hộp thoại xác nhận (Confirm) trước khi xóa dữ liệu thực tế
    if (!window.confirm("Bạn có chắc muốn xóa khách hàng này?")) return;
    try {
      // Gửi request DELETE lên server theo ID khách hàng
      await axios.delete(`http://localhost:5000/api/customers/delete/${id}`);
      toast.success("Xóa khách hàng thành công!");
      fetchCustomers(); // Gọi lại hàm lấy danh sách để cập nhật dữ liệu mới nhất trên giao diện
    } catch (err) {
      console.error("Lỗi khi xóa khách hàng:", err);
      toast.error("Xóa khách hàng thất bại");
    }
  };

  // --- LOGIC PHÂN TRANG (PAGINATION) CLIENT-SIDE ---
  // Tính tổng số trang dựa trên tổng số khách hàng và số item mỗi trang
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  // Cắt mảng khách hàng gốc để chỉ lấy dữ liệu của trang hiện tại
  const currentCustomers = customers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Hàm chuyển về trang trước đó (Giới hạn tối thiểu là trang 1)
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));

  // Hàm chuyển sang trang kế tiếp (Giới hạn tối đa là tổng số trang)
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // Giao diện hiển thị tạm thời khi ứng dụng đang kết nối với API
  if (loading)
    return <p className="p-6 text-center text-gray-500">Đang tải danh sách khách hàng...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Tiêu đề trang và Nút thêm khách hàng mới */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Quản lý Khách hàng</h1>
        <Link
          to="/admin-dashboard/customers/add"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Thêm khách hàng
        </Link>
      </div>

      {/* Bảng danh sách khách hàng */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {/* Duyệt mảng để render nhanh các tiêu đề cột (Headers) */}
              {["Tên", "Email", "SĐT", "Địa chỉ", "Hành động"].map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Trường hợp danh sách trống (không có khách hàng nào sau khi phân trang) */}
            {currentCustomers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  Không có khách hàng nào.
                </td>
              </tr>
            )}

            {/* Duyệt mảng currentCustomers của trang hiện tại để hiển thị dữ liệu */}
            {currentCustomers.map((cust) => (
              <tr key={cust._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2">{cust.name || "-"}</td>
                <td className="px-4 py-2">{cust.email || "-"}</td>
                <td className="px-4 py-2">{cust.phone || "-"}</td>
                <td className="px-4 py-2">{cust.address || "-"}</td>
                {/* Cột hành động: Chỉnh sửa hoặc Xóa */}
                <td className="px-4 py-2 flex gap-2 justify-center">
                  <Link
                    to={`/admin-dashboard/customers/${cust._id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(cust._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bộ điều khiển Phân trang (Chỉ hiển thị khi có từ 2 trang trở lên) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {/* Nút lùi trang (Prev) */}
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>

          {/* Render danh sách các số trang (Ví dụ: [1, 2, 3]) */}
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              // Đổi màu nền nút bấm nếu trùng với số trang hiện tại để người dùng nhận biết
              className={`px-3 py-1 rounded ${currentPage === idx + 1
                ? "bg-green-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              {idx + 1}
            </button>
          ))}

          {/* Nút tiến trang (Next) */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}