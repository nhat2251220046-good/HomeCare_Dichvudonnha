import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import io from "socket.io-client";
import axios from "axios";
import "./ChatBox.css";

const ChatBox = () => {
  function useSafeUser() {
    try {
      return useUser();
    } catch (e) {
      try {
        const raw = sessionStorage.getItem("clerkUser") || sessionStorage.getItem("user");
        if (!raw) return { user: null };
        const parsed = JSON.parse(raw);
        return {
          user: {
            id: parsed.id || parsed._id || "dev-user",
            firstName: parsed.firstName || parsed.name?.split(" ")?.[0] || parsed.fullName || "Dev",
            lastName: parsed.lastName || parsed.name?.split(" ")?.slice(1).join(" ") || "",
            fullName: parsed.fullName || parsed.name || `${parsed.firstName || "Dev"} ${parsed.lastName || ""}`.trim(),
            emailAddresses: [{ emailAddress: parsed.email || parsed.primaryEmailAddress?.emailAddress || parsed.emailAddresses?.[0]?.emailAddress || "dev@example.com" }],
            primaryEmailAddress: { emailAddress: parsed.email || parsed.primaryEmailAddress?.emailAddress || "dev@example.com" },
            primaryPhoneNumber: { phoneNumber: parsed.phone || parsed.primaryPhoneNumber?.phoneNumber || "" },
          },
          isSignedIn: true,
        };
      } catch (err) {
        return { user: null };
      }
    }
  }

  const { user } = useSafeUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [conversation, setConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize socket and conversation
  useEffect(() => {
    if (!user) return;

    const initializeChat = async () => {
      try {
        setError(null);
        // Create or get conversation
        const convResponse = await axios.post(
          "http://localhost:5000/api/chat/conversation",
          {
            customerId: user.id,
            customerName: user.firstName + " " + user.lastName,
            customerEmail: user.emailAddresses[0]?.emailAddress,
          },
          { timeout: 5000 }
        );
        setConversation(convResponse.data.conversation);

        // Load messages
        const msgResponse = await axios.get(
          `http://localhost:5000/api/chat/messages/${convResponse.data.conversation.conversationId}`,
          { timeout: 5000 }
        );
        setMessages(msgResponse.data.messages);

        // Connect to socket
        if (!socketRef.current) {
          socketRef.current = io("http://localhost:5000", {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 3,
          });

          socketRef.current.on("connect", () => {
            console.log("✅ Socket connected");
            socketRef.current.emit("register_customer", user.id);
          });

          socketRef.current.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
          });

          socketRef.current.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            setError("Không thể kết nối với máy chủ");
          });
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        setError("Không thể tải dữ liệu chat. Vui lòng thử lại sau.");
      }
    };

    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !conversation) return;

    const messageData = {
      conversationId: conversation.conversationId,
      senderId: user.id,
      senderType: "customer",
      senderName: user.firstName + " " + user.lastName,
      message: inputMessage,
    };

    try {
      setError(null);
      socketRef.current?.emit("send_message", messageData);
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Gửi tin nhắn thất bại");
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    if (conversation && socketRef.current) {
      socketRef.current.emit("join_conversation", conversation.conversationId);
      // Mark as read
      try {
        await axios.patch(
          `http://localhost:5000/api/chat/read/${conversation.conversationId}`,
          {},
          { timeout: 5000 }
        );
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="chat-box-container">
      {!isOpen && (
        <button
          className="chat-bubble"
          onClick={handleOpen}
          title="Chat với hỗ trợ"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Chat Hỗ Trợ</h3>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages">Bắt đầu cuộc hội thoại</div>
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

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="chat-input"
              disabled={!socketRef.current?.connected || isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || !socketRef.current?.connected}
              className="send-btn"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
