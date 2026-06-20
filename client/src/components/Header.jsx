import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react"; // 👉 icon đẹp
import NotificationBell from "./NotificationBell";

export default function Header() {
  // Mảng chứa danh sách các đường dẫn điều hướng trên thanh điều hướng
  const navLinks = [
    { title: "TRANG CHỦ", href: "/" },
    { title: "DỊCH VỤ DỌN NHÀ", href: "/service" },
    { title: "GIỚI THIỆU", href: "/about" },
    { title: "LIÊN HỆ", href: "/contact" },
  ];

  // Các trạng thái đóng/mở menu mobile và hiệu ứng cuộn trang (scroll)
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hàm bọc an toàn cho useClerk để tránh crash ứng dụng ở môi trường dev khi chưa cấu hình Clerk
  function useSafeClerk() {
    try {
      return useClerk();
    } catch (e) {
      return {
        openSignIn: () => {
          // Tạo tài khoản khách giả lập để kiểm thử (Mock Data Dev)
          const dev = {
            id: "dev-customer-1",
            firstName: "Khách",
            lastName: "Thử",
            fullName: "Khách Thử",
            emailAddresses: [{ emailAddress: "dev@example.com" }],
            primaryEmailAddress: { emailAddress: "dev@example.com" },
            primaryPhoneNumber: { phoneNumber: "0123456789" },
          };
          try {
            sessionStorage.setItem("clerkUser", JSON.stringify(dev));
          } catch (err) {
            console.error("Failed to save dev clerk user:", err);
          }
          window.location.reload();
        },
      };
    }
  }

  // Hàm bọc an toàn để lấy thông tin user từ Clerk hoặc lấy từ sessionStorage nếu đang ở chế độ dev
  function useSafeUser() {
    try {
      return useUser();
    } catch (e) {
      try {
        const raw = sessionStorage.getItem("clerkUser") || sessionStorage.getItem("user");
        if (!raw) return { user: null };
        const parsed = JSON.parse(raw);
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
          isSignedIn: true,
        };
      } catch (err) {
        return { user: null };
      }
    }
  }

  const { openSignIn } = useSafeClerk();
  const { user } = useSafeUser();
  const navigate = useNavigate();

  // Kiểm tra sự tồn tại của Clerk Key trong biến môi trường env
  const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && import.meta.env.VITE_CLERK_PUBLISHABLE_KEY !== 'REPLACE_ME');

  // Lắng nghe sự kiện cuộn trang để thêm hiệu ứng đổ bóng (shadow) cho header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 5);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đồng bộ thông tin tài khoản người dùng (Customer) với hệ thống cơ sở dữ liệu backend
  useEffect(() => {
    const syncCustomer = async () => {
      if (user) {
        try {
          await axios.post("http://localhost:5000/api/auth/sync", {
            clerkId: user.id,
            name: user.fullName,
            email: user.primaryEmailAddress?.emailAddress,
            phone: user.primaryPhoneNumber?.phoneNumber,
            address: "",
          });
          console.log("✅ Customer synced");
        } catch (err) {
          console.error("❌ Lỗi sync customer:", err);
        }
      }
    };
    syncCustomer();
  }, [user]);

  return (
    <header
      className={`fixed w-full z-50 bg-white transition-shadow duration-300 ${isScrolled ? "shadow-md" : ""
        }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Logo ứng dụng */}
        <Link to="/" className="flex items-center">
          <h1 className="text-teal-600 font-bold text-4xl">HomeCare</h1>
        </Link>

        {/* Danh sách Menu hiển thị trên màn hình Desktop lớn */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-gray-800">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.href}
              className="hover:text-[#ff8228] transition-colors"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Khối quản lý trạng thái đăng nhập và tài khoản trên Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            hasClerk ? (
              <>
                <NotificationBell />
                <UserButton afterSignOutUrl="/">
                  <UserButton.MenuItems>
                    <UserButton.Action label="manageAccount" />
                    <UserButton.Action
                      label="Lịch sử đặt hàng"
                      labelIcon={<ClipboardList className="w-4 h-4" />}
                      onClick={() => navigate("/orders")}
                    />
                    <UserButton.Action label="signOut" />
                  </UserButton.MenuItems>
                </UserButton>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="text-sm text-gray-700">{user.fullName || user.firstName}</div>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('clerkUser');
                    window.location.reload();
                  }}
                  className="px-4 py-1 rounded bg-gray-200 text-gray-800"
                >
                  Đăng xuất (dev)
                </button>
              </div>
            )
          ) : (
            <button
              onClick={openSignIn}
              className="px-6 py-2 cursor-pointer rounded-full bg-[#ff8228] text-white hover:bg-orange-600 transition-all"
            >
              Đăng nhập
            </button>
          )}
        </div>

        {/* Nút Hamburger kích hoạt menu cho thiết bị di động Mobile */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg
              className="w-6 h-6 text-[#ff8228]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Giao diện Menu hiển thị tràn màn hình khi được mở trên Mobile */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-gray-800 flex flex-col items-center justify-center gap-8 text-lg font-medium transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Nút Đóng (X) Menu trên giao diện mobile */}
        <button
          className="absolute top-4 right-4 text-[#ff8228]"
          onClick={() => setIsMenuOpen(false)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {navLinks.map((link, i) => (
          <Link key={i} to={link.href} onClick={() => setIsMenuOpen(false)}>
            {link.title}
          </Link>
        ))}

        {/* Quản lý trạng thái đăng nhập/đăng xuất riêng cho giao diện Mobile */}
        {user ? (
          <div className="mt-6 flex flex-col items-center gap-4">
            <NotificationBell />
            {hasClerk ? (
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  <UserButton.Action label="manageAccount" />
                  <UserButton.Action
                    label="Lịch sử đặt hàng"
                    labelIcon={<ClipboardList className="w-4 h-4" />}
                    onClick={() => {
                      navigate("/lich-su-dat-hang");
                      setIsMenuOpen(false);
                    }}
                  />
                  <UserButton.Action label="signOut" />
                </UserButton.MenuItems>
              </UserButton>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="text-gray-700">{user.fullName || user.firstName}</div>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('clerkUser');
                    window.location.reload();
                  }}
                  className="px-6 py-2 rounded-full bg-gray-200 text-gray-800"
                >
                  Đăng xuất (dev)
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openSignIn}
            className="bg-[#ff8228] cursor-pointer text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-all"
          >
            Đăng nhập
          </button>
        )}
      </div>
      <hr />
    </header>
  );
}