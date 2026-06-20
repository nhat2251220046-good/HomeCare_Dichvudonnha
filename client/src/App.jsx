import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NotFound from './pages/NotFound'
import MainLayout from './components/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminLayoutDashboard from './components/admin/AdminLayoutDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import LoginAdmin from './pages/admin/LoginAdmin'
import { useUser } from '@clerk/clerk-react';

// --- HÀM BỌC AN TOÀN CHO CLERK AUTHENTICATION (SAFE HOOK WRAPPER) ---
// Giải pháp chống crash ứng dụng khi chạy ở môi trường Local/Dev mà chưa cấu hình ClerkProvider.
// Hàm tự động chuyển hướng đọc dữ liệu user từ sessionStorage nếu thư viện Clerk ném lỗi.
function useSafeUser() {
  try {
    return useUser(); // Gọi hook gốc từ thư viện Clerk React
  } catch (e) {
    try {
      // Cơ chế dự phòng (Fallback): Đọc tài khoản mock trong sessionStorage nếu không có Clerk
      const raw = sessionStorage.getItem("clerkUser") || sessionStorage.getItem("user");
      if (!raw) return { user: null };
      const parsed = JSON.parse(raw);

      // Đồng bộ và giả lập cấu trúc Object giống hệt như dữ liệu trả về từ Clerk
      return {
        user: {
          id: parsed.id || parsed._id || "dev-user",
          firstName: parsed.firstName || parsed.name?.split(" ")?.[0] || parsed.fullName || "Dev",
          lastName: parsed.lastName || parsed.name?.split(" ")?.slice(1).join(" ") || "",
          fullName: parsed.fullName || parsed.name || `${parsed.firstName || "Dev"} ${parsed.lastName || ""}`.trim(),
          emailAddresses: [{ emailAddress: parsed.email || parsed.primaryEmailAddress?.emailAddress || parsed.emailAddresses?.[0]?.emailAddress || "dev@example.com" }],
          primaryEmailAddress: { emailAddress: parsed.email || parsed.primaryEmailAddress?.emailAddress || "dev@example.com" },
          primaryPhoneNumber: { phoneNumber: parsed.phone || parsed.primaryPhoneNumber?.phoneNumber || "" },
        },
        isSignedIn: true, // Xác nhận giả lập trạng thái đã đăng nhập thành công
      };
    } catch (err) {
      return { user: null };
    }
  }
}

import SyncCustomer from './components/SyncCustomer'
import { Toaster } from 'react-hot-toast';
import StaffLayout from './components/staff/StaffLayout'
import StaffLayoutDashboard from './components/staff/StaffLayoutDashboard'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminNotFound from './pages/admin/AdminNotFound'
import CustomerListPage from './pages/admin/CustomerListPage'
import EditCustomers from './pages/admin/EditCustomers'
import AddCutomers from './pages/admin/AddCutomers'
import BranchList from './pages/admin/BranchList'
import BranchForm from './components/admin/BranchForm'
import ProfilePage from './pages/admin/ProfilePage'
import ServiceList from './pages/admin/ListService'
import ServiceForm from './components/admin/ServiceForm'
import OrderList from './pages/admin/OrderList'
import OrderDetail from './pages/admin/OrderDetail'
import EmployeeList from './pages/admin/EmployeeList'
import AddEmployee from './pages/admin/AddEmployee'
import EditEmployee from './pages/admin/EditEmployee'
import ProfileStaffPage from './pages/staff/ProfileStaffPage'
import StaffHome from './pages/staff/StaffDashboard'
import StaffWorkPage from './pages/staff/StaffWorkPage'
import StaffSchedulePage from './pages/staff/StaffSchedulePage'
import FeedbackPage from './pages/staff/FeedbackPage'
import AssignShiftsPage from './pages/admin/AssignShiftsPage'
import AdminChat from './pages/admin/AdminChat'
import Service from './pages/customer/Service'
import Booking from './pages/customer/Booking'
import BookingSuccess from './pages/customer/BookingSuccess'
import OrderHistory from './pages/customer/OrderHistory'
import OrderDetailUser from './pages/customer/OrderDetailUser'
import ServiceDetail from './pages/customer/ServiceDetail'

function App() {
  const { user } = useSafeUser(); // Trích xuất thông tin người dùng hiện tại

  return (
    <>
      <div className="">
        {/* Khối đồng bộ dữ liệu tài khoản từ Clerk Authentication sang MongoDB Backend khi đăng nhập */}
        {user && <SyncCustomer />}

        {/* --- ĐỊNH NGHĨA HỆ THỐNG TUYẾN ĐƯỜNG (ROUTES CONFIGURATION) --- */}
        <Routes>

          {/* =============== CỤM 1: ROUTES CHO KHÁCH HÀNG (CUSTOMER LAYOUT) =============== */}
          {/* Tất cả các trang bên dưới đều thừa kế Header/Footer chung từ MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/service" element={<Service />} />
            <Route path="/service/:id" element={<ServiceDetail />} />

            {/* Luồng Đặt lịch & Lịch sử đơn hàng của Khách hàng */}
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/orders-susscess" element={<BookingSuccess />} />
            <Route path="/orders" element={<OrderHistory customerId={user?.id} />} />
            <Route path="/orders/:id" element={<OrderDetailUser />} />

            {/* Route bắt lỗi 404 cho phân hệ khách hàng khi gõ sai URL */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Trang đăng nhập dành riêng cho bộ phận Quản lý & Nhân viên */}
          <Route path="/manager-login" element={<LoginAdmin />} />

          {/* =============== CỤM 2: ROUTES CHO QUẢN TRỊ VIÊN (ADMIN INDUSTRIAL ROUTING) =============== */}
          {/* ProtectedRoute chặn quyền truy cập trực tiếp nếu tài khoản không mang role "admin" */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              {/* Sử dụng cấu trúc Nested Route lồng nhau để giữ nguyên Sidebar/Navbar hành chính của Admin */}
              <Route path="/admin-dashboard" element={<AdminLayoutDashboard />}>
                <Route index element={<AdminDashboard />} /> {/* Route mặc định hiển thị báo cáo tổng quan */}
                <Route path='profile' element={<ProfilePage />} />

                {/* Phân hệ Quản lý Tài khoản Nhân viên */}
                <Route path='employees' element={<EmployeeList />} />
                <Route path='employees/add' element={<AddEmployee />} />
                <Route path='employees/:id' element={<EditEmployee />} />

                {/* Phân hệ Quản lý Hồ sơ Khách hàng */}
                <Route path='customers' element={<CustomerListPage />} />
                <Route path='customers/add' element={<AddCutomers />} />
                <Route path='customers/:id' element={<EditCustomers />} />

                {/* Phân hệ Quản lý Hệ thống Chi nhánh cửa hàng */}
                <Route path='branches' element={<BranchList />} />
                <Route path="branches/add" element={<BranchForm />} />
                <Route path="branches/:id" element={<BranchForm />} />

                {/* Phân hệ Thiết lập Danh mục Dịch vụ và Bảng giá */}
                <Route path="services" element={<ServiceList />} />
                <Route path="services/add" element={<ServiceForm />} />
                <Route path="services/:id" element={<ServiceForm />} />

                {/* Phân hệ Quản lý & Duyệt Đơn đặt lịch (Orders) */}
                <Route path="orders" element={<OrderList />} />
                <Route path="orders/:id" element={<OrderDetail />} />

                {/* Tính năng Điều phối & Phân chia ca làm việc cho nhân viên */}
                <Route path="assign-shifts" element={<AssignShiftsPage />} />

                {/* Kênh Chat trực tuyến hỗ trợ khách hàng */}
                <Route path="chat" element={<AdminChat />} />

                {/* Route bắt lỗi 404 bên trong giao diện trang Dashboard Admin */}
                <Route path="*" element={<AdminNotFound />} />
              </Route>
            </Route>
          </Route>

          {/* =============== CỤM 3: ROUTES CHO NHÂN VIÊN GIA CÔNG (STAFF ROUTING) =============== */}
          {/* Chỉ cho phép tài khoản có role "staff" đi qua bộ lọc bảo vệ */}
          <Route element={<ProtectedRoute allowedRoles={["staff"]} />} >
            <Route element={<StaffLayout />}>
              <Route path="/staff-dashboard" element={<StaffLayoutDashboard />}>
                <Route index element={<StaffHome />} /> {/* Màn hình chính ghi nhận tổng số công việc trong ngày */}
                <Route path='tasks' element={<StaffWorkPage />} />     {/* Danh sách đầu việc cần thực hiện */}
                <Route path='schedule' element={<StaffSchedulePage />} /> {/* Xem lịch trực ca tuần/tháng */}
                <Route path='profile' element={<ProfileStaffPage />} />   {/* Sửa thông tin cá nhân nhân viên */}
                <Route path='feedback' element={<FeedbackPage />} />     {/* Xem đánh giá chấm điểm từ khách hàng */}
              </Route>
            </Route>
          </Route>
        </Routes>
      </div>

      {/* --- THÀNH PHẦN TOAST THÔNG BÁO TOÀN CỤC (GLOBAL ALERTS) --- */}
      <Toaster
        position="top-right" // Vị trí hiển thị popup góc trên cùng bên phải màn hình
        toastOptions={{
          duration: 3000,     // Tự động ẩn thông báo sau 3 giây
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
            padding: '12px 16px',
          },
        }}
      />
    </>
  )
}

export default App