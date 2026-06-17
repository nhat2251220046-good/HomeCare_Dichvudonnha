import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import io from "socket.io-client";
import axios from "axios";
import "./AdminChat.css";

const AdminChat = () => {
  const { user } = useUser();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedConversationRef = useRef(null); // Ref để tránh stale closure trong socket handlers

  // Cập nhật ref khi selectedConversation thay đổi
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Initialize socket and load conversations - chỉ chạy một lần khi mount
  useEffect(() => {
    if (!user) return;

    // Nếu socket đã tồn tại, không tạo lại
    if (socketRef.current?.connected) {
      console.log("✅ Socket already connected, skipping init");
      loadConversations();
      return;
    }

    console.log("🔄 Initializing admin socket...");

    socketRef.current = io("http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Admin socket connected");
      socketRef.current.emit("register_admin", user.id);
      setError(null);
    });

    socketRef.current.on("receive_message", (data) => {
      // Sử dụng ref để tránh stale closure
      const currentSelected = selectedConversationRef.current;
      // Nếu đang mở conversation đó, thêm tin nhắn vào danh sách
      if (currentSelected && data.conversationId === currentSelected.conversationId) {
        setMessages((prev) => [...prev, data]);
      }
      // Luôn cập nhật danh sách conversations
      loadConversations();
    });

    socketRef.current.on("new_message", (data) => {
      // Sử dụng ref để tránh stale closure
      const currentSelected = selectedConversationRef.current;
      // Nếu đang mở conversation của khách hàng vừa gửi tin nhắn, tải lại tin nhắn
      if (currentSelected && data.conversationId === currentSelected.conversationId) {
        // Tải lại tin nhắn mới nhất
        axios.get(
          `http://localhost:5000/api/chat/messages/${data.conversationId}`,
          { timeout: 5000 }
        ).then((response) => {
          setMessages(response.data.messages);
        }).catch((err) => console.error("Error reloading messages:", err));
      }
      // Cập nhật danh sách conversations
      loadConversations();
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setError("Không thể kết nối với máy chủ");
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("❌ Admin socket disconnected:", reason);
    });

    loadConversations();

    // Cleanup chỉ khi component unmount hoàn toàn
    return () => {
      if (socketRef.current) {
        console.log("🧹 Cleaning up admin socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Empty deps - chỉ chạy một lần khi mount

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join socket room when selected conversation changes
  useEffect(() => {
    if (selectedConversation && socketRef.current) {
      socketRef.current.emit("join_conversation", selectedConversation.conversationId);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/api/chat", {
        params: { status: "active" },
        timeout: 5000
      });
      setConversations(response.data.conversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setError("Không thể tải danh sách cuộc hội thoại. Kiểm tra kết nối với máy chủ.");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    try {
      setError(null);
      if (socketRef.current) {
        socketRef.current.emit("join_conversation", conversation.conversationId);
      }

      const response = await axios.get(
        `http://localhost:5000/api/chat/messages/${conversation.conversationId}`,
        { timeout: 5000 }
      );
      setMessages(response.data.messages);

      // Mark as read
      await axios.patch(
        `http://localhost:5000/api/chat/read/${conversation.conversationId}`,
        {},
        { timeout: 5000 }
      );
    } catch (error) {
      console.error("Error loading conversation:", error);
      setError("Không thể tải cuộc hội thoại");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedConversation || !socketRef.current?.connected)
      return;

    // Admin name - just use "Admin (Support)" for clarity
    const adminName = "Admin Hỗ Trợ";

    const messageData = {
      conversationId: selectedConversation.conversationId,
      senderId: user.id,
      senderType: "admin",
      senderName: adminName,
      message: inputMessage,
    };

    try {
      setError(null);
      socketRef.current.emit("send_message", messageData);
      
      // Thêm tin nhắn vào danh sách ngay lập tức để UI phản hồi nhanh
      const newMessage = {
        _id: `temp_${Date.now()}`,
        conversationId: selectedConversation.conversationId,
        senderId: user.id,
        senderType: "admin",
        senderName: adminName,
        message: inputMessage,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Gửi tin nhắn thất bại");
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;

    try {
      setError(null);
      await axios.patch(
        `http://localhost:5000/api/chat/close/${selectedConversation.conversationId}`,
        {},
        { timeout: 5000 }
      );
      setSelectedConversation(null);
      setMessages([]);
      loadConversations();
    } catch (error) {
      console.error("Error closing conversation:", error);
      setError("Lỗi khi đóng cuộc hội thoại");
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="admin-chat-container">
      <div className="chat-content">
        {error && (
          <div className="admin-error-message">
            ⚠️ {error}
          </div>
        )}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Chat Support</h2>
            <span className="conversation-count">{conversations.length}</span>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="conversations-list">
            {isLoadingConversations ? (
              <div className="loading">Đang tải...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="empty">Không có cuộc hội thoại</div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`conversation-item ${
                    selectedConversation?._id === conversation._id ? "active" : ""
                  }`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="conversation-info">
                    <div className="customer-name">{conversation.customerName}</div>
                    <div className="last-message">
                      {conversation.lastMessage?.substring(0, 40) || "Chưa có tin nhắn"}
                    </div>
                  </div>
                  <div className="conversation-time">
                    {conversation.lastMessageTime
                      ? new Date(conversation.lastMessageTime).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-main">
          {selectedConversation ? (
            <>
              <div className="chat-header-admin">
                <div className="header-info">
                  <h3>{selectedConversation.customerName}</h3>
                  <p>{selectedConversation.customerEmail}</p>
                </div>
                <button
                  className="close-btn-admin"
                  onClick={handleCloseConversation}
                >
                  Đóng cuộc hội thoại
                </button>
              </div>

              <div className="chat-messages-admin">
                {isLoadingMessages ? (
                  <div className="loading">Đang tải tin nhắn...</div>
                ) : messages.length === 0 ? (
                  <div className="no-messages-admin">Bắt đầu cuộc hội thoại</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message ${msg.senderType}`}
                    >
                      <div className="message-sender">{msg.senderName}</div>
                      <div className="message-text">{msg.message}</div>
                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="chat-input-form-admin">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="chat-input-admin"
                  disabled={!socketRef.current?.connected || isLoadingMessages}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoadingMessages || !socketRef.current?.connected}
                  className="send-btn-admin"
                >
                  Gửi
                </button>
              </form>
            </>
          ) : (
            <div className="no-selected">
              <p>Chọn một cuộc hội thoại để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
