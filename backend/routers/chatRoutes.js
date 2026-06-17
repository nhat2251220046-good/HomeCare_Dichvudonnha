const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// Create or get conversation
router.post("/conversation", chatController.createConversation);

// Get messages for a conversation
router.get("/messages/:conversationId", chatController.getMessages);

// Get customer conversation
router.get("/customer/:customerId", chatController.getCustomerConversation);

// Get all conversations (for admin)
router.get("/", chatController.getAllConversations);

// Mark messages as read
router.patch("/read/:conversationId", chatController.markAsRead);

// Close conversation
router.patch("/close/:conversationId", chatController.closeConversation);

module.exports = router;
