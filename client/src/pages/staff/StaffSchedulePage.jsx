import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Upload, X } from "lucide-react";

export default function StaffSchedulePage() {
  // --- QUẢN LÝ TRẠNG THÁI (STATES) ---
  const [orders, setOrders] = useState([]);                 // Danh sách đơn hàng/lịch làm việc theo ngày
  const [selectedDate, setSelectedDate] = useState("");     // Ngày đang được chọn để lọc dữ liệu
  const [uploadingOrderId, setUploadingOrderId] = useState(null); // ID của đơn hàng đang mở khung tải ảnh nghiệm thu
  const [selectedImages, setSelectedImages] = useState({}); // Lưu trữ danh sách file ảnh đã chọn theo từng đơn hàng (Key-Value)
  const [uploading, setUploading] = useState(false);         // Trạng thái khóa UI khi đang thực thi upload ảnh lên server

  // --- LẤY THÔNG TIN NHÂN VIÊN ĐANG ĐĂNG NHẬP ---
  const storedUser = sessionStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const staffId = user?.id || user?._id || ""; // Dự phòng linh hoạt giữa 'id' và '_id' theo cấu trúc DB

  // Hàm tiện ích lấy ngày hôm nay theo định dạng chuỗi YYYY-MM-DD
  const getToday = () => new Date().toISOString().split("T")[0];

  // --- HÀM GỌI API: LẤY LỊCH LÀM VIỆC ---
  const fetchOrders = async (date) => {
    if (!staffId) {
      console.warn("Staff không xác định, không lấy được lịch.");
      setOrders([]);
      return;
    }

    try {
      let url = `http://localhost:5000/api/orders/staff/${staffId}`;
      if (date) url += `?date=${date}`; // Gắn thêm query tham số ngày nếu có lọc
      const res = await axios.get(url);
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách đơn hàng:", err);
    }
  };

  // --- SIDE EFFECTS (VÒNG ĐỜI KHỞI CHẠY) ---
  // Effect 1: Thiết lập ngày mặc định là hôm nay khi mới vào trang
  useEffect(() => {
    if (staffId) {
      const today = getToday();
      setSelectedDate(today);
      fetchOrders(today);
    }
  }, [staffId]);

  // Effect 2: Tự động tải lại danh sách đơn hàng mỗi khi người dùng thay đổi bộ lọc ngày
  useEffect(() => {
    if (staffId && selectedDate) {
      fetchOrders(selectedDate);
    }
  }, [selectedDate, staffId]);

  // --- HÀM LOGIC: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG ---
  const updateStatus = async (orderId, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
        staffId: staffId,
      };

      // Nếu chuyển trạng thái sang "Hoàn thành" và có chọn ảnh nghiệm thu
      if (newStatus === "completed" && selectedImages[orderId]?.length > 0) {
        setUploading(true);
        // Tiến hành upload loạt ảnh và nhận về danh sách đường dẫn URL từ server
        const uploadedImages = await uploadCompletionImages(orderId, selectedImages[orderId]);
        updateData.completionImages = uploadedImages;
      }

      // Gọi API cập nhật trạng thái đơn hàng (Sử dụng PATCH để cập nhật một phần dữ liệu)
      await axios.patch(`http://localhost:5000/api/orders/${orderId}`, updateData);

      // Cập nhật tức thì trạng thái mới vào State cục bộ để tối ưu trải nghiệm (Không cần gọi lại API toàn trang)
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );

      // Đồng bộ dọn dẹp bộ nhớ state khi hoàn thành đơn hàng thành công
      if (newStatus === "completed") {
        setSelectedImages((prev) => {
          const updated = { ...prev };
          delete updated[orderId]; // Xóa danh sách ảnh tạm của đơn này
          return updated;
        });
        setUploadingOrderId(null); // Đóng khung upload ảnh
        toast.success("Cập nhật trạng thái thành công!");
      }
    } catch (err) {
      console.error("Cập nhật trạng thái thất bại:", err);
      toast.error("Lỗi cập nhật!");
    } finally {
      setUploading(false);
    }
  };

  // --- HÀM LOGIC: XỬ LÝ UPLOAD LOẠT ẢNH LÊN SERVER ---
  const uploadCompletionImages = async (orderId, files) => {
    const uploadedImages = [];

    // Duyệt qua từng file ảnh bằng vòng lặp for...of để thực hiện đồng bộ tuần tự
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file); // Đóng gói file vào đối tượng FormData để gửi nhận dạng Multipart

      try {
        console.log(`Đang tải lên ảnh: ${file.name}`);
        const response = await axios.post(
          `http://localhost:5000/api/orders/${orderId}/upload-completion-image`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        console.log("Phản hồi upload:", response.data);

        if (response.data.url) {
          // Lưu cấu trúc Object ảnh nghiệm thu bao gồm URL và mốc thời gian tải lên
          uploadedImages.push({
            url: response.data.url,
            uploadedAt: new Date(),
          });
          toast.success(`${file.name} tải lên thành công!`);
        }
      } catch (err) {
        console.error(`Tải ảnh thất bại cho file ${file.name}:`, err);
        toast.error(`Lỗi tải ${file.name}: ${err.response?.data?.error || err.message}`);
      }
    }

    return uploadedImages; // Trả về mảng chứa toàn bộ thông tin ảnh đã upload thành công
  };

  // --- HÀM XỬ LÝ TƯƠNG TÁC FILE ẢNH TRÊN UI ---
  // Hàm xử lý chọn ảnh từ thiết bị (Hỗ trợ chọn nhiều ảnh cùng lúc)
  const handleImageSelect = (orderId, files) => {
    setSelectedImages((prev) => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), ...Array.from(files)], // Gộp file mới chọn vào danh sách cũ
    }));
  };

  // Hàm loại bỏ một ảnh cụ thể ra khỏi danh sách hàng chờ dựa vào Index
  const removeSelectedImage = (orderId, index) => {
    setSelectedImages((prev) => ({
      ...prev,
      [orderId]: prev[orderId].filter((_, i) => i !== index),
    }));
  };

  // --- GIAO DIỆN CHÍNH (RENDER) ---
  return (
    <div className="p-6 space-y-6">
      {/* Tiêu đề trang cá nhân hóa */}
      <h1 className="text-2xl font-bold">
        📅 Lịch làm việc của <span className="text-blue-600">{user?.name}</span>
      </h1>

      {/* BỘ LỌC THỜI GIAN (DATE PICKER) */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Chọn ngày:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* HIỂN THỊ KẾT QUẢ ĐƠN HÀNG */}
      {orders.length === 0 ? (
        /* Trạng thái không có lịch làm việc */
        <div className="text-center py-10 text-gray-500 border rounded-lg bg-gray-50">
          Không có lịch làm việc.
        </div>
      ) : (
        /* Render Grid danh sách lịch hẹn/đơn hàng được phân công */
        <div className="grid md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white shadow-md rounded-lg p-4 border space-y-3 hover:shadow-lg transition"
            >
              {/* Khối 1: Giờ hẹn (Format chi tiết vi-VN) & Badge trạng thái màu sắc tương ứng */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-blue-600">
                  {order.startTime && order.endTime ? (
                    `${new Date(order.startTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} - ${new Date(order.endTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  ) : order.endTime ? (
                    new Date(order.endTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  ) : order.scheduledAt ? (
                    new Date(order.scheduledAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  ) : (
                    "Chưa đặt giờ"
                  )}
                </span>
                <StatusBadge status={order.status} />
              </div>

              {/* Khối 2: Tên Khách hàng */}
              <div>
                <p className="text-sm text-gray-500">Khách hàng</p>
                <p className="font-medium">{order.customer?.name}</p>
              </div>

              {/* Khối 3: Chi tiết Tên dịch vụ & định dạng giá tiền Việt Namđ */}
              <div>
                <p className="text-sm text-gray-500">Dịch vụ</p>
                <p className="font-medium">
                  {order.service?.name}{" "}
                  {order.service?.price && (
                    <span className="text-sm text-gray-500">
                      ({order.service.price.toLocaleString("vi-VN")}đ)
                    </span>
                  )}
                </p>
              </div>

              {/* Khối 4: Chi nhánh và Địa chỉ cụ thể */}
              <div>
                <p className="text-sm text-gray-500">Chi nhánh</p>
                <p className="font-medium">{order.branch?.name}</p>
                <p className="text-xs text-gray-500">{order.branch?.address}</p>
              </div>

              {/* Khối 5: Thanh Dropdown cập nhật nhanh trạng thái đơn hàng */}
              <div>
                <label className="text-sm text-gray-500">Cập nhật trạng thái</label>
                <select
                  value={order.status}
                  onChange={(e) => {
                    // Nếu chọn trạng thái hoàn thành, mở khu vực tải ảnh nghiệm thu trước khi lưu
                    if (e.target.value === "completed") {
                      setUploadingOrderId(order._id);
                    } else {
                      updateStatus(order._id, e.target.value);
                    }
                  }}
                  className="w-full mt-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={uploading} // Khóa đổi trạng thái khi đang xử lý upload file
                >
                  <option value="assigning">Đang phân công</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="accepted">Đã nhận</option>
                  <option value="in_progress">Đang làm</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="canceled">Đã hủy</option>
                </select>
              </div>

              {/* KHU VỰC FORM TẢI ẢNH NGHIỆM THU (Chỉ hiện khi nhân viên nhấn chọn mục 'Hoàn thành') */}
              {uploadingOrderId === order._id && order.status !== "completed" && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <h4 className="font-semibold text-blue-900">📸 Tải ảnh phòng dọn xong</h4>

                  {/* Khung Kéo & Thả / Click chọn file */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload size={24} className="text-blue-600 mb-1" />
                        <p className="text-sm text-blue-600 font-medium">Nhấn hoặc kéo thả</p>
                        <p className="text-xs text-blue-500">PNG, JPG tối đa 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple // Cho phép chọn nhiều tệp
                        accept="image/*" // Chỉ chấp nhận các tệp định dạng hình ảnh
                        onChange={(e) => handleImageSelect(order._id, e.target.files)}
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  {/* Hiển thị danh sách tên các file ảnh đã chọn kèm nút xóa nhanh */}
                  {selectedImages[order._id]?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Đã chọn {selectedImages[order._id].length} ảnh:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedImages[order._id].map((file, idx) => (
                          <div key={idx} className="relative bg-white p-2 rounded border border-gray-300 flex items-center gap-2">
                            <span className="text-xs text-gray-600 truncate max-w-40">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeSelectedImage(order._id, idx)}
                              className="text-red-500 hover:text-red-700"
                              disabled={uploading}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nút bấm xác nhận gửi ảnh dọn phòng xong hoặc hủy bỏ */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(order._id, "completed")}
                      disabled={selectedImages[order._id]?.length === 0 || uploading} // Bắt buộc phải có tối thiểu 1 ảnh nghiệm thu mới cho lưu đơn
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 text-sm font-medium transition"
                    >
                      {uploading ? "Đang tải..." : "Hoàn thành & Lưu"}
                    </button>
                    <button
                      onClick={() => {
                        setUploadingOrderId(null); // Đóng khung
                        setSelectedImages((prev) => {
                          const updated = { ...prev };
                          delete updated[order._id]; // Reset toàn bộ ảnh đã chọn tạm thời của đơn này
                          return updated;
                        });
                      }}
                      disabled={uploading}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium transition"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENT: BADGE TRẠNG THÁI MÀU SẮC (STATUS BADGE) ---
function StatusBadge({ status }) {
  // Bản đồ ánh xạ mã màu CSS Tailwind tương ứng với từng trạng thái của Đơn hàng
  const colors = {
    assigning: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-blue-100 text-blue-700",
    in_progress: "bg-indigo-100 text-indigo-700",
    completed: "bg-green-100 text-green-700",
    canceled: "bg-red-100 text-red-700",
  };

  // Bản đồ ánh xạ chuỗi văn bản tiếng Việt hiển thị trên UI công việc
  const labels = {
    assigning: "Đang phân công",
    pending: "Chờ xử lý",
    accepted: "Đã nhận",
    in_progress: "Đang làm",
    completed: "Hoàn thành",
    canceled: "Đã hủy",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"
        }`}
    >
      {labels[status] || status}
    </span>
  );
}