import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import Meta from "../../components/Meta";

// Đăng ký các thành phần (plugins/modules) bắt buộc của Chart.js để có thể vẽ được biểu đồ
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
  // Khởi tạo state chứa dữ liệu thống kê tổng quan (Mock data)
  const [stats] = useState({
    products: 120,     // Tổng số sản phẩm
    categories: 15,    // Tổng số danh mục
    suppliers: 8,      // Tổng số nhà cung cấp
    customers: 200,    // Tổng số khách hàng
  });

  // Cấu hình dữ liệu cho biểu đồ Cột (Bar Chart) - Thống kê sản phẩm theo danh mục
  const barData = {
    labels: ["Rau củ quả", "Sữa", "Đồ uống", "Thực phẩm chức năng"], // Các trục X (nhãn)
    datasets: [
      {
        label: "Số lượng sản phẩm",
        data: [40, 25, 35, 20], // Dữ liệu số lượng tương ứng với từng nhãn
        backgroundColor: "#34D399", // Màu sắc của các cột (màu green-400 trong Tailwind)
      },
    ],
  };

  // Cấu hình dữ liệu cho biểu đồ Tròn (Pie Chart) - Thống kê phân loại hạng khách hàng
  const pieData = {
    labels: ["Normal", "Silver", "Gold", "VIP"], // Các phân khúc khách hàng
    datasets: [
      {
        label: "Hạng khách hàng",
        data: [120, 50, 20, 10], // Số lượng khách hàng tương ứng cho mỗi hạng
        backgroundColor: ["#D1FAE5", "#6EE7B7", "#10B981", "#047857"], // Mảng màu sắc cho từng phần của biểu đồ tròn
      },
    ],
  };

  return (
    <div className="p-6 flex-1">
      {/* Component Meta dùng để thay đổi tiêu đề trang và từ khóa SEO */}
      <Meta title="Admin Dashboard" keywords="Admin Dashboard" />

      {/* Phần tiêu đề chính của Dashboard */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* Khu vực hiển thị các thẻ Thống kê tổng quan (Stats Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Thẻ thống kê Sản phẩm */}
        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="text-gray-500">Products</h3>
          <p className="text-2xl font-bold">{stats.products}</p>
        </div>

        {/* Thẻ thống kê Danh mục */}
        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="text-gray-500">Categories</h3>
          <p className="text-2xl font-bold">{stats.categories}</p>
        </div>

        {/* Thẻ thống kê Nhà cung cấp */}
        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="text-gray-500">Suppliers</h3>
          <p className="text-2xl font-bold">{stats.suppliers}</p>
        </div>

        {/* Thẻ thống kê Khách hàng */}
        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="text-gray-500">Customers</h3>
          <p className="text-2xl font-bold">{stats.customers}</p>
        </div>
      </div>

      {/* Khu vực hiển thị các biểu đồ (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Khối biểu đồ Cột (Bar Chart) */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm theo danh mục</h2>
          {/* Component Bar từ react-chartjs-2 với cấu hình responsive và ẩn phần chú thích (legend) */}
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>

        {/* Khối biểu đồ Tròn (Pie Chart) */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Khách hàng theo hạng</h2>
          {/* Component Pie từ react-chartjs-2 với cấu hình responsive và đẩy vị trí chú thích xuống dưới đáy */}
          <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
        </div>
      </div>
    </div>
  );
}