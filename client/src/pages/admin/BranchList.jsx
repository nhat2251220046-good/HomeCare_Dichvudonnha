import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function BranchList() {
  // --- QUẢN LÝ CÁC TRẠNG THÁI (STATES) ---
  const [branches, setBranches] = useState([]);    // Danh sách toàn bộ chi nhánh từ Server
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại (mặc định trang 1)
  const [isLoading, setIsLoading] = useState(false); // Trạng thái chờ khi tải dữ liệu
  const itemsPerPage = 10;                        // Số lượng chi nhánh hiển thị trên mỗi trang

  // SIDE EFFECT: Tự động gọi API lấy danh sách chi nhánh khi component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // --- HÀM XỬ LÝ API: LẤY DANH SÁCH CHI NHÁNH ---
  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/branches/getall");
      setBranches(res.data);
    } catch (err) {
      console.error("Error fetching branches:", err);
      toast.error("Không thể tải danh sách chi nhánh!");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HÀM XỬ LÝ API: XÓA CHI NHÁNH THEO ID ---
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa chi nhánh này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/branches/delete/${id}`);
        fetchBranches(); // Tải lại danh sách sau khi xóa thành công
        toast.success("Chi nhánh đã xoá thành công!");
      } catch (err) {
        console.error("Error deleting branch:", err);
        toast.error("Xóa chi nhánh thất bại!");
      }
    }
  };

  // --- LOGIC PHÂN TRANG PHÍA CLIENT (CLIENT-SIDE PAGINATION) ---
  const totalPages = Math.ceil(branches.length / itemsPerPage);

  // Trích xuất mảng con cho trang hiện tại
  const currentBranches = branches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Điều hướng trang (Giới hạn biên an toàn bằng Math.max và Math.min)
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      {/* Khối Tiêu đề & Nút Thêm mới */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Danh sách chi nhánh</h1>
        <Link
          to="/admin-dashboard/branches/add"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition content-center"
        >
          + Thêm chi nhánh
        </Link>
      </div>

      {/* Vùng hiển thị Bảng Dữ liệu */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Tên chi nhánh", "Địa chỉ", "Điện thoại", "Doanh thu", "Hành động"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {/* TRƯỜNG HỢP ĐANG TẢI DỮ LIỆU */}
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                  Đang tải dữ liệu chi nhánh...
                </td>
              </tr>
            ) : currentBranches.length === 0 ? (
              /* TRƯỜNG HỢP DANH SÁCH TRỐNG */
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                  Chưa có chi nhánh nào được ghi nhận
                </td>
              </tr>
            ) : (
              /* ĐỔ DỮ LIỆU DANH SÁCH */
              currentBranches.map((branch) => (
                <tr key={branch._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{branch.name}</td>
                  <td className="px-6 py-4 text-gray-600">{branch.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{branch.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                    {branch.revenue != null ? branch.revenue.toLocaleString() : "0"} đ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center flex gap-2 justify-start">
                    <Link
                      to={`/admin-dashboard/branches/${branch._id}`}
                      className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition shadow-sm"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(branch._id)}
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

      {/* ================= THANH ĐIỀU HƯỚNG PHÂN TRANG ================= */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            Trước
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
            Sau
          </button>
        </div>
      )}
    </div>
  );
}