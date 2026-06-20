import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ServiceList() {
  // --- QUẢN LÝ CÁC TRẠNG THÁI (STATES) ---
  const [services, setServices] = useState([]);      // Lưu trữ danh sách toàn bộ dịch vụ từ API Server
  const [loading, setLoading] = useState(true);      // Quản lý trạng thái chờ khi đang nạp dữ liệu
  const [currentPage, setCurrentPage] = useState(1); // Số trang hiện tại người dùng đang đứng
  const itemsPerPage = 10;                           // Giới hạn số lượng dịch vụ hiển thị trên một trang

  // SIDE EFFECT: Tự động tải danh sách dịch vụ ngay khi component render lần đầu tiên
  useEffect(() => {
    fetchServices();
  }, []);

  // --- HÀM XỬ LÝ API: LẤY DANH SÁCH DỊCH VỤ TỪ SERVER ---
  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/services/getall");
      setServices(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy dịch vụ:", err);
      toast.error("Không thể tải dữ liệu dịch vụ!");
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM XỬ LÝ API: XÓA DỊCH VỤ THEO ID ---
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/services/delete/${id}`);
      toast.success("Dịch vụ đã xóa thành công!");

      // TỐI ƯU UX: Tính toán lại trang hiện tại trực tiếp trên client trước khi đồng bộ dữ liệu mới
      setServices((prevServices) => {
        const updatedServices = prevServices.filter((service) => service._id !== id);
        const newTotalPages = Math.ceil(updatedServices.length / itemsPerPage);

        // Nếu xóa hết phần tử của trang cuối cùng, tự động lùi về trang trước đó
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        return updatedServices;
      });

    } catch (err) {
      console.error(err);
      toast.error("Xóa dịch vụ thất bại!");
    }
  };

  // --- LOGIC PHÂN TRANG PHÍA CLIENT (CLIENT-SIDE PAGINATION) ---
  const totalPages = Math.ceil(services.length / itemsPerPage);

  // Trích xuất mảng con tương ứng với phạm vi vị trí của trang hiện tại
  const currentServices = services.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Hàm chuyển đổi trang tăng/giảm (Math.max/Math.min giúp bảo toàn không vượt biên số trang hợp lệ)
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // FALLBACK UI: Màn hình chờ khi dữ liệu đang được tải về từ Server
  if (loading) return <p className="p-6 text-center text-gray-500 font-medium">Đang tải dữ liệu dịch vụ...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Khối tiêu đề và Nút chuyển hướng thêm mới */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Danh sách dịch vụ</h1>
        <Link
          to="/admin-dashboard/services/add"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition text-sm font-medium"
        >
          + Thêm dịch vụ
        </Link>
      </div>

      {/* Vùng hiển thị Bảng dữ liệu dịch vụ */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Tên", "Mô tả", "Giá", "Thời lượng", "Trạng thái", "Hành động"].map(
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
            {currentServices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 font-medium">
                  Chưa có dịch vụ nào trong hệ thống
                </td>
              </tr>
            ) : (
              /* DUYỆT MẢNG VÀ HIỂN THỊ DỮ LIỆU DỊCH VỤ */
              currentServices.map((service) => (
                <tr key={service._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{service.name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{service.description || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {service.price ? service.price.toLocaleString() : "0"} đ
                  </td>
                  <td className="px-4 py-3 text-gray-600">{service.duration ? `${service.duration} phút` : "-"}</td>
                  <td className="px-4 py-3">
                    {/* Badge trạng thái dịch vụ đổ màu động trực quan */}
                    {service.active ? (
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Không hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2 justify-start whitespace-nowrap">
                    <Link
                      to={`/admin-dashboard/services/${service._id}`}
                      className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition shadow-sm"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition shadow-sm"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= CONTROLS ĐIỀU HƯỚNG PHÂN TRANG ================= */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            Prev
          </button>

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