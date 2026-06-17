const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatMessageSchema = new Schema(
  {
    conversationId: { 
      type: String, 
      required: true,
      index: true 
    },
    senderId: { 
      type: String, 
      required: true 
    },
    senderType: { 
      type: String, 
      enum: ["customer", "admin"], 
      required: true 
    },
    senderName: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    isRead: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

chatMessageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
