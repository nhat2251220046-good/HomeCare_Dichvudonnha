const express = require("express");
const {
  getCustomerNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
} = require("../controllers/notificationController");

const router = express.Router();

// 📬 Lấy tất cả thông báo của khách hàng
router.get("/customer/:customerId", getCustomerNotifications);

// 📊 Lấy số thông báo chưa đọc
router.get("/unread/:customerId", getUnreadCount);

// 🔔 Đánh dấu thông báo đã đọc
router.put("/:notificationId/read", markAsRead);

// 📚 Đánh dấu tất cả thông báo là đã đọc
router.put("/customer/:customerId/read-all", markAllAsRead);

// 🗑️ Xóa thông báo
router.delete("/:notificationId", deleteNotification);

// 🗑️ Xóa tất cả thông báo của khách hàng
router.delete("/customer/:customerId/all", deleteAllNotifications);

module.exports = router;
