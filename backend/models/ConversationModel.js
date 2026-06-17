const mongoose = require("mongoose");
const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customerId: {
      type: String,
      required: true,
      index: true
    },
    customerName: {
      type: String,
      required: true
    },
    customerEmail: {
      type: String
    },
    lastMessage: {
      type: String
    },
    lastMessageTime: {
      type: Date
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
