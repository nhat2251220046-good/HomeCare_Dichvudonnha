import { Helmet } from "react-helmet-async";

// Component quản lý các thẻ Meta và cấu hình SEO cho từng trang riêng biệt trong ứng dụng SPA
export default function Meta({ title, description, keywords }) {
  return (
    // Component Helmet cho phép thay đổi động các thẻ nằm trong phần <head> của tài liệu HTML
    <Helmet>
      {/* Cấu hình tiêu đề hiển thị trên tab trình duyệt */}
      <title>{title}</title>

      {/* Thẻ meta mô tả nội dung trang (Hiển thị dưới dạng đoạn trích trên kết quả tìm kiếm Google) */}
      <meta name="description" content={description} />

      {/* Danh sách các từ khóa liên quan đến nội dung trang giúp hỗ trợ bot tìm kiếm phân loại */}
      <meta name="keywords" content={keywords} />

      {/* Cấu hình Viewport giúp giao diện hiển thị co giãn chuẩn xác trên các thiết bị di động (Responsive) */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Đường dẫn nạp biểu tượng icon nhỏ hiển thị trên tab của trình duyệt */}
      <link rel="icon" href="/favicon.ico" />

      {/* --- CẤU HÌNH CÁC THẺ OPEN GRAPH (OG) PHỤC VỤ CHO VIỆC CHIA SẺ MẠNG XÃ HỘI (FACEBOOK, ZALO,...) --- */}
      {/* Tiêu đề bài viết/trang khi được chia sẻ link */}
      <meta property="og:title" content={title} />

      {/* Đoạn mô tả ngắn gọn đi kèm bản xem trước (preview) của liên kết khi chia sẻ */}
      <meta property="og:description" content={description} />

      {/* Định dạng loại nội dung của trang web (Mặc định là website) */}
      <meta property="og:type" content="website" />
    </Helmet>
  );
}