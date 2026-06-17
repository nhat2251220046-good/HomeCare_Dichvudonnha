import React, { useEffect, useState, useRef } from "react";
import { Bell, X, Clock, User } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import io from "socket.io-client";
import axios from "axios";

export default function NotificationBell() {
  function useSafeUser() {
    try {
      return useUser();
    } catch (e) {
      try {
        const raw = sessionStorage.getItem("clerkUser") || sessionStorage.getItem("user");
        if (!raw) return { user: null, isSignedIn: false };
        const parsed = JSON.parse(raw);
        return {
          user: {
            id: parsed.id || parsed._id || "dev-user",
            firstName: parsed.firstName || parsed.name?.split(" ")?.[0] || parsed.fullName || "Dev",
            lastName: parsed.lastName || parsed.name?.split(" ")?.slice(1).join(" ") || "",
            fullName: parsed.fullName || parsed.name || `${parsed.firstName || "Dev"} ${parsed.lastName || ""}`.trim(),
          },
          isSignedIn: true,
        };
      } catch (err) {
        return { user: null, isSignedIn: false };
      }
    }
  }

  const { user, isSignedIn } = useSafeUser();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const dropdownRef = useRef(null);
  const customerId = localStorage.getItem("customerId");

  // 📬 Lấy số thông báo chưa đọc ngay khi load trang
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!customerId) return;
      
      try {
        const unreadRes = await axios.get(
          `http://localhost:5000/api/notifications/unread/${customerId}`
        );
        setUnreadCount(unreadRes.data.unreadCount || 0);
      } catch (err) {
        console.error("❌ Lỗi khi lấy số thông báo chưa đọc:", err);
      }
    };

    fetchUnreadCount();
  }, [customerId]);

  // 📬 Lấy thông báo từ API
  const fetchNotifications = async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/notifications/customer/${customerId}`,
        { params: { page: 1, limit: 20 } }
      );
      setNotifications(res.data.notifications || []);
      
      // Lấy số thông báo chưa đọc
      const unreadRes = await axios.get(
        `http://localhost:5000/api/notifications/unread/${customerId}`
      );
      setUnreadCount(unreadRes.data.unreadCount || 0);
    } catch (err) {
      console.error("❌ Lỗi khi lấy thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔔 Đánh dấu thông báo đã đọc
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("❌ Lỗi khi đánh dấu đã đọc:", err);
    }
  };

  // 🗑️ Xóa thông báo
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`
      );
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (err) {
      console.error("❌ Lỗi khi xóa thông báo:", err);
    }
  };

  // 🔌 Kết nối Socket.IO
  useEffect(() => {
    if (!isSignedIn || !user) return;

    // Connect to Socket.IO
    socketRef.current = io("http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Register customer after connection
    socketRef.current.on("connect", () => {
      console.log("✅ Kết nối máy chủ thông báo");
      socketRef.current.emit("register_customer", user.id);
    });

    // Lắng nghe thông báo real-time
    socketRef.current.on("notification", (data) => {
      console.log("🔔 Thông báo mới:", data);
      // Cập nhật số thông báo chưa đọc
      setUnreadCount((prev) => prev + 1);
      // Lấy lại danh sách thông báo
      fetchNotifications();
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Ngắt kết nối máy chủ");
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("❌ Lỗi kết nối:", error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isSignedIn, user]);

  // Lấy thông báo khi mở dropdown
  const handleDropdownOpen = async () => {
    setShowDropdown(true);
    if (customerId) {
      // Fetch cả danh sách và số chưa đọc
      await fetchNotifications();
      try {
        const unreadRes = await axios.get(
          `http://localhost:5000/api/notifications/unread/${customerId}`
        );
        setUnreadCount(unreadRes.data.unreadCount || 0);
      } catch (err) {
        console.error("❌ Lỗi khi lấy số thông báo chưa đọc:", err);
      }
    }
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showDropdown]);

  if (!isSignedIn) return null;

  // Format ngày giờ theo định dạng Việt Nam
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleDropdownOpen}
        className="relative p-2 text-gray-700 hover:text-teal-600 transition-colors"
        title="Thông báo"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-orange-50 p-4">
            <h3 className="font-bold text-gray-800">📬 Thông báo của bạn</h3>
            <p className="text-xs text-gray-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Tất cả đã đọc"}
            </p>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
                <p className="mt-2">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Không có thông báo</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      notif.isRead ? "bg-white" : "bg-blue-50"
                    }`}
                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {/* Tên nhân viên */}
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-teal-600" />
                          <span className="font-semibold text-teal-600">
                            {notif.staffName || "Nhân viên"}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>

                        {/* Tiêu đề */}
                        <h4 className="text-sm font-medium text-gray-800 mb-1">
                          {notif.title}
                        </h4>

                        {/* Nội dung thông báo */}
                        <p className="text-sm text-gray-700 mb-2">
                          {notif.message}
                        </p>

                        {/* Thời gian cập nhật */}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDateTime(notif.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Nút xóa */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif._id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa thông báo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-3 text-center">
              <button
                onClick={() => {
                  axios.put(
                    `http://localhost:5000/api/notifications/customer/${customerId}/read-all`
                  ).then(() => {
                    fetchNotifications();
                  });
                }}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                ✓ Đánh dấu tất cả là đã đọc
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
