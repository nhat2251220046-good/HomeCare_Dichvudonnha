const Notification = require("../models/NotificationModel");
const Order = require("../models/OrderModel");
const User = require("../models/UserModel");
const Customer = require("../models/CustomerModel");
const mongoose = require("mongoose");

// 📢 1️⃣ Tạo thông báo (được gọi từ orderController)
const createNotification = async (data) => {
  try {
    const {
      customer,
      order,
      staff,
      type = "status_update",
      status,
      title,
      message,
      staffName,
    } = data;

    const notification = new Notification({
      customer,
      order,
      staff,
      type,
      status,
      title,
      message,
      staffName,
      isRead: false,
    });

    await notification.save();
    return notification;
  } catch (err) {
    console.error("❌ Lỗi khi tạo thông báo:", err);
    throw err;
  }
};

// 📬 2️⃣ Lấy tất cả thông báo của khách hàng
const getCustomerNotifications = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10, isRead } = req.query;

    // Tìm khách hàng
    let customer;
    if (mongoose.Types.ObjectId.isValid(customerId)) {
      customer = await Customer.findById(customerId);
    }
    if (!customer) {
      customer = await Customer.findOne({ clerkId: customerId });
    }

    if (!customer) {
      return res.status(404).json({ error: "Không tìm thấy khách hàng" });
    }

    // Xây dựng query
    const query = { customer: customer._id };
    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    // Phân trang
    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .populate("staff", "name email phone")
      .populate("order", "service status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy thông báo:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔔 3️⃣ Đánh dấu thông báo đã đọc
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Không tìm thấy thông báo" });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      message: "Đánh dấu đã đọc thành công",
      notification,
    });
  } catch (err) {
    console.error("❌ Lỗi khi đánh dấu đã đọc:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📚 4️⃣ Đánh dấu tất cả thông báo của khách hàng là đã đọc
const markAllAsRead = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Tìm khách hàng
    let customer;
    if (mongoose.Types.ObjectId.isValid(customerId)) {
      customer = await Customer.findById(customerId);
    }
    if (!customer) {
      customer = await Customer.findOne({ clerkId: customerId });
    }

    if (!customer) {
      return res.status(404).json({ error: "Không tìm thấy khách hàng" });
    }

    await Notification.updateMany(
      { customer: customer._id, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({
      message: "Đánh dấu tất cả thông báo là đã đọc",
    });
  } catch (err) {
    console.error("❌ Lỗi khi đánh dấu tất cả thông báo:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ 5️⃣ Xóa thông báo
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Không tìm thấy thông báo" });
    }

    res.json({
      message: "Xóa thông báo thành công",
    });
  } catch (err) {
    console.error("❌ Lỗi khi xóa thông báo:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ 6️⃣ Xóa tất cả thông báo của khách hàng
const deleteAllNotifications = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Tìm khách hàng
    let customer;
    if (mongoose.Types.ObjectId.isValid(customerId)) {
      customer = await Customer.findById(customerId);
    }
    if (!customer) {
      customer = await Customer.findOne({ clerkId: customerId });
    }

    if (!customer) {
      return res.status(404).json({ error: "Không tìm thấy khách hàng" });
    }

    await Notification.deleteMany({ customer: customer._id });

    res.json({
      message: "Xóa tất cả thông báo thành công",
    });
  } catch (err) {
    console.error("❌ Lỗi khi xóa tất cả thông báo:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📊 7️⃣ Lấy số thông báo chưa đọc
const getUnreadCount = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Tìm khách hàng
    let customer;
    if (mongoose.Types.ObjectId.isValid(customerId)) {
      customer = await Customer.findById(customerId);
    }
    if (!customer) {
      customer = await Customer.findOne({ clerkId: customerId });
    }

    if (!customer) {
      return res.status(404).json({ error: "Không tìm thấy khách hàng" });
    }

    const unreadCount = await Notification.countDocuments({
      customer: customer._id,
      isRead: false,
    });

    res.json({
      unreadCount,
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy số thông báo chưa đọc:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createNotification,
  getCustomerNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
};
