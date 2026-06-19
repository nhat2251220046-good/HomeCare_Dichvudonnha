import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect } from "react";

export default function SyncCustomer() {
  // Hàm bổ trợ giúp lấy thông tin user một cách an toàn (tránh crash nếu Clerk chưa load hoặc lỗi)
  function useSafeUser() {
    try {
      // Thử lấy thông tin user từ Hook chính thức của Clerk
      return useUser();
    } catch (e) {
      try {
        // Nếu Clerk bị lỗi/không chạy, thử lấy thông tin user dự phòng từ sessionStorage
        const raw = sessionStorage.getItem("clerkUser") || sessionStorage.getItem("user");
        if (!raw) return { user: null };
        const parsed = JSON.parse(raw);

        // Mock (giả lập) lại cấu trúc object user của Clerk từ dữ liệu sessionStorage
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
        // Trả về null nếu toàn bộ quá trình đọc sessionStorage thất bại
        return { user: null };
      }
    }
  }

  // Lấy thông tin user từ hàm safe-hook vừa định nghĩa ở trên
  const { user } = useSafeUser();

  // useEffect tự động chạy khi thông tin `user` thay đổi hoặc được thiết lập thành công
  useEffect(() => {
    if (user) {
      // Gửi yêu cầu POST đến backend để đồng bộ hóa dữ liệu khách hàng
      axios
        .post("http://localhost:5000/api/auth/sync", {
          clerkId: user.id,
          name: user.fullName,
          email: user.emailAddresses[0].emailAddress,
          phone: user.primaryPhoneNumber?.phoneNumber,
        })
        .then((res) => {
          // Nếu backend trả về ID khách hàng thành công, lưu nó vào localStorage để dùng sau này
          if (res.data?.customer?._id) {
            localStorage.setItem("customerId", res.data.customer._id);
          }
        })
        .catch((err) => {
          // Log lỗi ra console nếu quá trình gọi API đồng bộ thất bại
          console.error("Sync customer failed:", err);
        });
    }
  }, [user]); // Hook này sẽ chạy lại bất cứ khi nào object `user` thay đổi

  // Component này chỉ làm nhiệm vụ logic (Background Worker) nên không hiển thị gì lên giao diện (return null)
  return null;
}