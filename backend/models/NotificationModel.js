const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    customer: { 
      type: Schema.Types.ObjectId, 
      ref: "Customer", 
      required: true 
    },
    order: { 
      type: Schema.Types.ObjectId, 
      ref: "Order", 
      required: true 
    },
    staff: { 
      type: Schema.Types.ObjectId, 
      ref: "User" 
    },
    type: {
      type: String,
      enum: ["status_update", "assignment", "completed", "urgent"],
      default: "status_update",
    },
    status: {
      type: String,
      enum: ["assigning", "pending", "accepted", "in_progress", "completed", "canceled"],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    staffName: { type: String }, // Lưu tên nhân viên
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
