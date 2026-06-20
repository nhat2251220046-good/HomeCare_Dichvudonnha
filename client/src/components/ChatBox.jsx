import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import io from "socket.io-client";
import axios from "axios";
import "./ChatBox.css";

const ChatBox = () => {
  // --- HÀM BỌC AN TOÀN (SAFE WRAPPERS) CHO MÔI TRƯỜNG DEV TRÁNH CRASH KHI THIẾU CLERK ---
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

  // --- QUẢN LÝ TRẠNG THÁI (STATES) VÀ ĐỊNH DANH (REFS) ---
  const { user } = useSafeUser();
  const [isOpen, setIsOpen] = useState(false);         // Trạng thái Ẩn/Hiện của cửa sổ chat
  const [messages, setMessages] = useState([]);         // Danh sách các tin nhắn trong cuộc trò chuyện
  const [inputMessage, setInputMessage] = useState(""); // Nội dung tin nhắn đang nhập ở input
  const [conversation, setConversation] = useState(null); // Thông tin phiên hội thoại hiện tại
  const [isLoading, setIsLoading] = useState(false);     // Trạng thái chờ xử lý logic
  const [error, setError] = useState(null);             // Lưu trữ thông báo lỗi hệ thống/kết nối
  const socketRef = useRef(null);                       // Lưu trữ instance của Socket Client để tránh re-render tạo lại kết nối
  const messagesEndRef = useRef(null);                 // Điểm mốc DOM ở cuối danh sách tin nhắn để hỗ trợ cuộn chuột tự động

  // --- SIDE EFFECT 1: KHỞI TẠO CUỘC TRÒ CHUYỆN VÀ KẾT NỐI REALTIME (SOCKET.IO) ---
  useEffect(() => {
    if (!user) return;

    const initializeChat = async () => {
      try {
        setError(null);

        // Bước 1: Tạo mới hoặc lấy lại phiên hội thoại cũ dựa trên ID khách hàng
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

        // Bước 2: Tải lại lịch sử tin nhắn của phiên hội thoại này từ Database
        const msgResponse = await axios.get(
          `http://localhost:5000/api/chat/messages/${convResponse.data.conversation.conversationId}`,
          { timeout: 5000 }
        );
        setMessages(msgResponse.data.messages);

        // Bước 3: Thiết lập kết nối Socket.io Client đến Server Node.js Backend
        if (!socketRef.current) {
          socketRef.current = io("http://localhost:5000", {
            reconnection: true,          // Bật tính năng tự động kết nối lại nếu mất mạng
            reconnectionDelay: 1000,     // Khoảng thời gian chờ giữa các lần thử kết nối lại (ms)
            reconnectionAttempts: 3,     // Số lần thử kết nối lại tối đa trước khi dừng hẳn
          });

          // Sự kiện kết nối Socket thành công
          socketRef.current.on("connect", () => {
            console.log("✅ Socket connected");
            // Đăng ký định danh Client với server để nhận diện luồng tin nhắn
            socketRef.current.emit("register_customer", user.id);
          });

          // Lắng nghe sự kiện nhận tin nhắn mới realtime từ phía Admin/Server
          socketRef.current.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
          });

          // Sự kiện bắt lỗi khi không thể kết nối tới Socket Server
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

    // HÀM CLEANUP: Ngắt kết nối socket khi component bị hủy (Unmount) để tránh rò rỉ bộ nhớ (Memory Leak)
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  // --- SIDE EFFECT 2: TỰ ĐỘNG CUỘN XUỐNG DƯỚI CÙNG KHI CÓ TIN NHẮN MỚI ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- HÀM XỬ LÝ SỰ KIỆN GỬI TIN NHẮN (SEND MESSAGE) ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !conversation) return;

    // Định dạng gói tin nhắn chuẩn gửi đi
    const messageData = {
      conversationId: conversation.conversationId,
      senderId: user.id,
      senderType: "customer",
      senderName: user.firstName + " " + user.lastName,
      message: inputMessage,
    };

    try {
      setError(null);
      // Phát tín hiệu gửi tin nhắn lên cổng Socket real-time
      socketRef.current?.emit("send_message", messageData);
      setInputMessage(""); // Xóa nội dung khung nhập liệu sau khi gửi thành công
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Gửi tin nhắn thất bại");
    }
  };

  // --- HÀM XỬ LÝ MỞ KHUNG CHAT VÀ ĐÁNH DẤU ĐÃ ĐỌC ---
  const handleOpen = async () => {
    setIsOpen(true);
    if (conversation && socketRef.current) {
      // Tham gia phòng chat cụ thể (Room Room-based Chat)
      socketRef.current.emit("join_conversation", conversation.conversationId);

      // Gọi API cập nhật trạng thái "Đã đọc tin nhắn" của toàn bộ phiên chat này
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

  // Nếu người dùng chưa đăng nhập, ẩn hoàn toàn component ChatBox
  if (!user) return null;

  return (
    <div className="chat-box-container">
      {/* NÚT BONG BÓNG CHAT (Hiển thị khi khung chat đang đóng) */}
      {!isOpen && (
        <button
          className="chat-bubble"
          onClick={handleOpen}
          title="Chat với hỗ trợ"
        >
          💬
        </button>
      )}

      {/* CỬA SỔ CHAT CHI TIẾT */}
      {isOpen && (
        <div className="chat-window">
          {/* Thanh tiêu đề trên của khung chat */}
          <div className="chat-header">
            <h3>Chat Hỗ Trợ</h3>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Khối hiển thị lỗi kết nối nếu có */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Vùng hiển thị toàn bộ nội dung tin nhắn */}
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
                  {/* Định dạng thời gian gửi tin nhắn (Giờ:Phút) theo chuẩn Việt Nam */}
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            )}
            {/* Điểm Neo cố định phục vụ tự động Scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Form nhập liệu và gửi tin nhắn */}
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="chat-input"
              // Vô hiệu hóa input nếu socket bị mất kết nối hoặc hệ thống đang bận tải
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