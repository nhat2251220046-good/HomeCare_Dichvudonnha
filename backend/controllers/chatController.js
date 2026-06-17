const ChatMessage = require("../models/ChatModel");
const Conversation = require("../models/ConversationModel");

// Create or get conversation
exports.createConversation = async (req, res) => {
  try {
    const { customerId, customerName, customerEmail } = req.body;

    if (!customerId || !customerName) {
      return res.status(400).json({
        message: "customerId and customerName are required",
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({ customerId });

    if (!conversation) {
      const conversationId = `conv_${customerId}_${Date.now()}`;
      conversation = new Conversation({
        conversationId,
        customerId,
        customerName,
        customerEmail,
        status: "active",
      });
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      success: false,
      message: "Error creating conversation",
      error: error.message,
    });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChatMessage.countDocuments({ conversationId });

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

// Get all conversations (for admin)
exports.getAllConversations = async (req, res) => {
  try {
    const { status = "active" } = req.query;

    const filter = status ? { status } : {};

    const conversations = await Conversation.find(filter).sort({
      lastMessageTime: -1,
    });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching conversations",
      error: error.message,
    });
  }
};

// Get customer conversation
exports.getCustomerConversation = async (req, res) => {
  try {
    const { customerId } = req.params;

    const conversation = await Conversation.findOne({ customerId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching conversation",
      error: error.message,
    });
  }
};

// Close conversation
exports.closeConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOneAndUpdate(
      { conversationId },
      { status: "closed" },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation closed",
      conversation,
    });
  } catch (error) {
    console.error("Error closing conversation:", error);
    res.status(500).json({
      success: false,
      message: "Error closing conversation",
      error: error.message,
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await ChatMessage.updateMany(
      { conversationId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking messages as read",
      error: error.message,
    });
  }
};
