const socketIO = require("socket.io");
const ChatMessage = require("../models/ChatModel");
const Conversation = require("../models/ConversationModel");

let io = null;

// Store active customer connections
const customerConnections = {};
// Store active admin connections
const adminConnections = {};

// Initialize Socket.IO
const initSocketIO = (server) => {
  io = socketIO(server, {
    cors: {
      // Allow any localhost origin during development (ports may vary)
      origin: function (origin, callback) {
        // allow requests with no origin
        if (!origin) return callback(null, true);
        const localhostRegex = /^https?:\/\/localhost(:\d+)?$/;
        if (localhostRegex.test(origin)) return callback(null, true);
        // fallback: allow all in dev
        return callback(null, true);
      },
      credentials: true,
    },
  });

  // Socket.IO Events
  io.on("connection", (socket) => {
    console.log("🔗 New client connected:", socket.id);

    // Customer registers their connection with clerkId (Clerk user ID)
    socket.on("register_customer", (clerkId) => {
      customerConnections[clerkId] = socket.id;
      console.log(`✅ Customer ${clerkId} registered with socket ${socket.id}`);
      console.log(`📊 Active connections:`, Object.keys(customerConnections));
    });

    // Admin registers their connection
    socket.on("register_admin", (adminId) => {
      adminConnections[adminId] = socket.id;
      socket.join("admin_room");
      console.log(`✅ Admin ${adminId} registered with socket ${socket.id}`);
    });

    // Join conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conv_${conversationId}`);
      console.log(`👤 User joined conversation ${conversationId}`);
    });

    // Send message
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, senderId, senderType, senderName, message } = data;
        
        // Save message to database
        const chatMessage = new ChatMessage({
          conversationId,
          senderId,
          senderType,
          senderName,
          message,
        });
        await chatMessage.save();

        // Update conversation - chuyển status về active nếu có tin nhắn mới từ khách
        const updateData = {
          lastMessage: message,
          lastMessageTime: new Date(),
        };
        
        // Nếu là khách hàng gửi tin nhắn, chuyển status về active
        if (senderType === "customer") {
          updateData.status = "active";
        }
        
        await Conversation.findOneAndUpdate(
          { conversationId },
          updateData
        );

        // Broadcast to all users in this conversation
        io.to(`conv_${conversationId}`).emit("receive_message", {
          _id: chatMessage._id,
          conversationId,
          senderId,
          senderType,
          senderName,
          message,
          createdAt: chatMessage.createdAt,
        });

        // Notify admins about new messages
        if (senderType === "customer") {
          io.to("admin_room").emit("new_message", {
            conversationId,
            customerId: senderId,
            customerName: senderName,
            message,
          });
        }

        console.log(`💬 Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      // Find and remove customer connection
      for (let customerId in customerConnections) {
        if (customerConnections[customerId] === socket.id) {
          delete customerConnections[customerId];
          console.log(`❌ Customer ${customerId} disconnected`);
          break;
        }
      }
      
      // Find and remove admin connection
      for (let adminId in adminConnections) {
        if (adminConnections[adminId] === socket.id) {
          delete adminConnections[adminId];
          console.log(`❌ Admin ${adminId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

// Get Socket.IO instance
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initSocketIO first.");
  }
  return io;
};

// Get customer socket ID
const getCustomerSocketId = (customerId) => {
  return customerConnections[customerId] || null;
};

// Send notification to customer
const sendNotificationToCustomer = (customerId, notificationData) => {
  const socketId = customerConnections[customerId];
  
  if (socketId && io) {
    io.to(socketId).emit("notification", {
      ...notificationData,
      timestamp: new Date(),
    });
    console.log(`✉️ Notification sent to customer ${customerId} (socket: ${socketId})`);
    return true;
  } else {
    console.log(`⚠️ Customer ${customerId} not connected (socket not found)`);
    return false;
  }
};

module.exports = {
  initSocketIO,
  getIO,
  getCustomerSocketId,
  sendNotificationToCustomer,
  customerConnections,
  adminConnections,
};
