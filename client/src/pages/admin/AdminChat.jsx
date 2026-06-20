import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import io from "socket.io-client";
import axios from "axios";
import "./AdminChat.css";

const AdminChat = () => {
  const { user } = useUser(); // Lấy thông tin tài khoản admin đang đăng nhập từ Clerk Auth

  // --- QUẢN LÝ CÁC TRẠNG THÁI (STATES) ---
  const [conversations, setConversations] = useState([]);         // Danh sách tất cả các cuộc hội thoại đang hoạt động
  const [selectedConversation, setSelectedConversation] = useState(null); // Thông tin phòng chat hiện tại đang được chọn
  const [messages, setMessages] = useState([]);                   // Danh sách các tin nhắn trong phòng chat đang mở
  const [inputMessage, setInputMessage] = useState("");           // Dữ liệu nhập vào ô input tin nhắn
  const [isLoadingConversations, setIsLoadingConversations] = useState(false); // Trạng thái tải danh sách phòng chat
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);           // Trạng thái tải nội dung tin nhắn
  const [searchTerm, setSearchTerm] = useState("");               // Từ khóa tìm kiếm khách hàng theo Tên/Email
  const [error, setError] = useState(null);                       // Lưu trữ thông báo lỗi kết nối hoặc API

  // --- HỆ THỐNG QUẢN LÝ THAM CHIẾU (REFS) ---
  const socketRef = useRef(null);      // Lưu trữ instance của Socket.io-client xuyên suốt vòng đời component
  const messagesEndRef = useRef(null); // Ref gắn vào cuối danh sách tin nhắn để tự động cuộn (Auto-scroll)
  const selectedConversationRef = useRef(null); // Giải pháp chống Stale Closure (Dữ liệu cũ kẹt trong socket handler)

  // ĐỒNG BỘ REF: Luôn cập nhật giá trị phòng chat mới nhất vào biến tham chiếu Ref
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // --- KHOỞI TẠO KẾT NỐI REALTIME (SOCKET.IO INITIALIZATION) ---
  useEffect(() => {
    if (!user) return;

    // Kiểm tra Singleton: Nếu kết nối đã tồn tại và đang chạy, không khởi tạo lại tránh rò rỉ bộ nhớ
    if (socketRef.current?.connected) {
      console.log("✅ Socket already connected, skipping init");
      loadConversations();
      return;
    }

    console.log("🔄 Initializing admin socket...");

    // Cấu hình tham số kết nối với Backend Socket Server
    socketRef.current = io("http://localhost:5000", {
      reconnection: true,             // Bật tính năng tự động kết nối lại khi mất mạng
      reconnectionDelay: 1000,        // Thời gian chờ giữa các lần thử kết nối lại (1 giây)
      reconnectionAttempts: 5,        // Số lần thử tối đa trước khi thông báo lỗi
      autoConnect: true,
    });

    // Lắng nghe sự kiện kết nối thành công
    socketRef.current.on("connect", () => {
      console.log("✅ Admin socket connected");
      // Đăng ký định danh tài khoản Admin với máy chủ Socket
      socketRef.current.emit("register_admin", user.id);
      setError(null);
    });

    // SỰ KIỆN 1: Nhận tin nhắn trực tiếp qua Room WebSocket
    socketRef.current.on("receive_message", (data) => {
      const currentSelected = selectedConversationRef.current;
      // Nếu quản trị viên đang mở đúng căn phòng có tin nhắn đến -> Đẩy trực tiếp vào mảng tin nhắn trên màn hình
      if (currentSelected && data.conversationId === currentSelected.conversationId) {
        setMessages((prev) => [...prev, data]);
      }
      // Làm mới danh sách hội thoại ở sidebar để cập nhật tin nhắn cuối cùng (Last message)
      loadConversations();
    });

    // SỰ KIỆN 2: Nhận thông báo có tin nhắn mới từ luồng ngoài hệ thống phòng
    socketRef.current.on("new_message", (data) => {
      const currentSelected = selectedConversationRef.current;
      // Gọi API nạp lại bộ tin nhắn đầy đủ nếu đang tương tác trực tiếp với khách hàng đó
      if (currentSelected && data.conversationId === currentSelected.conversationId) {
        axios.get(
          `http://localhost:5000/api/chat/messages/${data.conversationId}`,
          { timeout: 5000 }
        ).then((response) => {
          setMessages(response.data.messages);
        }).catch((err) => console.error("Error reloading messages:", err));
      }
      loadConversations();
    });

    // Lắng nghe các sự kiện ngắt kết nối và lỗi mạng từ Socket Server
    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setError("Không thể kết nối với máy chủ Realtime");
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("❌ Admin socket disconnected:", reason);
    });

    loadConversations(); // Tải danh sách cuộc trò chuyện ban đầu khi ứng dụng gắn kết thành công

    // CLEANUP FUNCTION: Ngắt kết nối socket hoàn toàn khi admin thoát khỏi trang Chat
    return () => {
      if (socketRef.current) {
        console.log("🧹 Cleaning up admin socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // --- HIỆU ỨNG UX: TỰ ĐỘNG CUỘN ĐẾN TIN NHẮN MỚI NHẤT (AUTO SCROLL) ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- HIỆU ỨNG ROOM CHAT: THAM GIA PHÒNG CHAT KHI THAY ĐỔI ĐỐI TƯỢNG (JOIN ROOM) ---
  useEffect(() => {
    if (selectedConversation && socketRef.current) {
      socketRef.current.emit("join_conversation", selectedConversation.conversationId);
    }
  }, [selectedConversation]);

  // --- HÀM XỬ LÝ API: TẢI DANH SÁCH CÁC CUỘC HỘI THOẠI ĐANG HOẠT ĐỘNG ---
  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/api/chat", {
        params: { status: "active" }, // Chỉ lấy các cuộc trò chuyện chưa bị đóng
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

  // --- HÀM XỬ LÝ UI: KHI ADMIN NHẤP CHỌN MỘT KHÁCH HÀNG ĐỂ CHAT ---
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    try {
      setError(null);
      // Phát tín hiệu tham gia phòng chat realtime của khách hàng này
      if (socketRef.current) {
        socketRef.current.emit("join_conversation", conversation.conversationId);
      }

      // Lấy lịch sử tin nhắn của cuộc hội thoại
      const response = await axios.get(
        `http://localhost:5000/api/chat/messages/${conversation.conversationId}`,
        { timeout: 5000 }
      );
      setMessages(response.data.messages);

      // Đánh dấu toàn bộ tin nhắn trong phòng này là đã đọc (Mark as Read)
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

  // --- HÀM XỬ LÝ: GỬI TIN NHẮN ĐI (SEND MESSAGE LOGIC) ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    // Chặn gửi tin nếu nội dung trống, chưa chọn phòng hoặc mất kết nối socket
    if (!inputMessage.trim() || !selectedConversation || !socketRef.current?.connected)
      return;

    const adminName = "Admin Hỗ Trợ";

    // Cấu trúc dữ liệu Payload tin nhắn theo chuẩn Database Schema
    const messageData = {
      conversationId: selectedConversation.conversationId,
      senderId: user.id,
      senderType: "admin",
      senderName: adminName,
      message: inputMessage,
    };

    try {
      setError(null);
      // Phát tin nhắn qua WebSocket lên Server để phân phối đến khách hàng ngay lập tức
      socketRef.current.emit("send_message", messageData);

      // OPTIMISTIC UI UPDATE: Thêm tin nhắn tạm thời vào giao diện ngay lập tức giúp tăng trải nghiệm mượt mà
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
      setInputMessage(""); // Reset trống ô nhập liệu
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Gửi tin nhắn thất bại");
    }
  };

  // --- HÀM XỬ LÝ: ĐÓNG / KẾT THÚC CUỘC HỘI THOẠI (CLOSE CONVERSATION) ---
  const handleCloseConversation = async () => {
    if (!selectedConversation) return;

    try {
      setError(null);
      // Gọi API cập nhật trạng thái cuộc hội thoại thành "closed" (Đã giải quyết)
      await axios.patch(
        `http://localhost:5000/api/chat/close/${selectedConversation.conversationId}`,
        {},
        { timeout: 5000 }
      );
      setSelectedConversation(null); // Giải phóng màn hình chat chính
      setMessages([]);               // Xóa sạch bộ nhớ tin nhắn tạm thời
      loadConversations();           // Tải lại sidebar để xóa phòng chat vừa đóng
    } catch (error) {
      console.error("Error closing conversation:", error);
      setError("Lỗi khi đóng cuộc hội thoại");
    }
  };

  // --- TÍNH NĂNG CLIENT-SIDE FILTER: BỘ LỌC TÌM KIẾM KHÁCH HÀNG ---
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hiển thị màn hình chờ nếu phiên đăng nhập tài khoản chưa xác thực xong
  if (!user) {
    return <div className="loading-container">Loading Auth...</div>;
  }

  return (
    <div className="admin-chat-container">
      <div className="chat-content">
        {/* Banner hiển thị lỗi tập trung ở đầu màn hình */}
        {error && (
          <div className="admin-error-message">
            ⚠️ {error}
          </div>
        )}

        {/* ================= PHẦN 1: THANH SIDEBAR BÊN TRÁI (DANH SÁCH PHÒNG CHAT) ================= */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Chat Support</h2>
            <span className="conversation-count">{conversations.length}</span>
          </div>

          {/* Ô nhập từ khóa tìm kiếm nhanh khách hàng */}
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
                  className={`conversation-item ${selectedConversation?._id === conversation._id ? "active" : ""
                    }`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="conversation-info">
                    <div className="customer-name">{conversation.customerName}</div>
                    <div className="last-message">
                      {conversation.lastMessage?.substring(0, 40) || "Chưa có tin nhắn"}
                    </div>
                  </div>
                  {/* Format thời gian của tin nhắn cuối cùng gửi đến */}
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

        {/* ================= PHẦN 2: KHÔNG GIAN CHAT CHÍNH BÊN PHẢI (CHAT MAIN WORKSPACE) ================= */}
        <div className="chat-main">
          {selectedConversation ? (
            <>
              {/* Thanh tiêu đề hiển thị thông tin khách hàng đang tương tác */}
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

              {/* Phân vùng chứa luồng danh sách nội dung các tin nhắn */}
              <div className="chat-messages-admin">
                {isLoadingMessages ? (
                  <div className="loading">Đang tải tin nhắn...</div>
                ) : messages.length === 0 ? (
                  <div className="no-messages-admin">Bắt đầu cuộc hội thoại</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message ${msg.senderType}`} // Động class "admin" hoặc "customer" để đổi CSS màu sắc bong bóng chat
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
                {/* Điểm Neo giúp hàm scrollIntoView xác định vị trí cuộn xuống dưới cùng */}
                <div ref={messagesEndRef} />
              </div>

              {/* Form gửi tin nhắn hỗ trợ */}
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
            /* Trạng thái trống khi Admin chưa bấm chọn bất cứ phòng chat nào */
            <div className="no-selected">
              <p>Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu hỗ trợ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;