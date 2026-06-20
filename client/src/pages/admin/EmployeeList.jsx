import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function EmployeeList() {
  // --- QUẢN LÝ TRẠNG THÁI (STATES) ---
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Tự động gọi API lấy danh sách khi component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // --- HÀM XỬ LÝ API: LẤY DANH SÁCH NHÂN VIÊN ---
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/employees/getall");
      setEmployees(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách nhân viên:", err);
      toast.error("Không thể tải danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM XỬ LÝ API: XÓA NHÂN VIÊN ---
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/delete/${id}`);

      // FIX: Đổi từ toast.error sang toast.success cho đồng bộ giao diện thành công
      toast.success("Nhân viên đã xoá thành công!");

      // Tính toán lại trang trước khi fetch lại dữ liệu mới
      setEmployees((prevEmployees) => {
        const updatedEmployees = prevEmployees.filter((emp) => emp._id !== id);
        const newTotalPages = Math.ceil(updatedEmployees.length / itemsPerPage);

        // FIX: Nếu trang hiện tại lớn hơn tổng số trang mới (do xóa hết phần tử trang cuối), lùi về 1 trang
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        return updatedEmployees;
      });

    } catch (err) {
      console.error("Lỗi khi xóa nhân viên:", err);
      toast.error("Xóa nhân viên thất bại!");
    }
  };

  // --- LOGIC PHÂN TRANG PHÍA CLIENT ---
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const currentEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // FALLBACK UI: Màn hình chờ dữ liệu
  if (loading) return <p className="p-6 text-center text-gray-500 font-medium">Đang tải...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Khối Header điều hướng */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý Nhân viên</h1>
        <Link
          to="/admin-dashboard/employees/add"
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-sm font-medium"
        >
          + Thêm nhân viên
        </Link>
      </div>

      {/* Bảng danh sách dữ liệu */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Tên", "Email", "SĐT", "Vai trò", "Chi nhánh", "Hành động"].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {currentEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 font-medium">
                  Không có nhân viên nào trong danh sách.
                </td>
              </tr>
            ) : (
              currentEmployees.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{emp.name}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.phone || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold uppercase text-gray-700">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{emp.branch?.name || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap flex gap-2 justify-center">
                    <Link
                      to={`/admin-dashboard/employees/${emp._id}`}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition shadow-sm"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(emp._id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition shadow-sm"
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

      {/* Thanh điều hướng phân trang */}
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
                  ? "bg-green-600 text-white shadow"
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