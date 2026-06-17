const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByCustomer,
  getFavoriteStaffByCustomer,
  updateOrder,
  deleteOrder,
  getOrdersByStaffAndDate,
  getAssignedOrdersByStaff,
  addReview,
  addStaffReview,
  uploadCompletionImage,
} = require("../controllers/orderController");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép file ảnh"));
    }
  },
});

// Admin xem tất cả đơn
router.get("/", getAllOrders);
// Khách hàng đặt dịch vụ
// Lấy nhân viên yêu thích theo khách hàng
router.get("/customer/:customerId/favorites", getFavoriteStaffByCustomer);
// Lấy đơn theo khách hàng
router.get("/customer/:customerId", getOrdersByCustomer);
// Staff xem lịch làm việc
router.get("/staff/:staffId", getOrdersByStaffAndDate);
router.get("/assigned/:staffId", getAssignedOrdersByStaff);
router.post("/", createOrder);
// ✅ Lấy chi tiết đơn hàng
router.get("/:id", getOrderById);
// ✅ API update chung (assign staff, status, thời gian,...)
router.patch("/:orderId", updateOrder);
// Upload completion images
router.post("/:orderId/upload-completion-image", upload.single("file"), uploadCompletionImage);
// Review dịch vụ
router.post("/:orderId/review", addReview);
// Review nhân viên
router.post("/:orderId/staff-review", addStaffReview);
// Xóa đơn
router.delete("/:id", deleteOrder);

module.exports = router;
