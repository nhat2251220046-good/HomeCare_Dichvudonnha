import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import Meta from "../../components/Meta";
import {
  MapPin,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  CheckCircle2,
  Home,
  DollarSign,
  UserCheck,
} from "lucide-react";

export default function Booking() {
  const { id } = useParams(); // Lấy serviceId từ URL params
  const navigate = useNavigate();

  /**
   * Custom hook bọc an toàn (Safe Wrapper) cho Clerk Auth
   * Giúp ứng dụng hoạt động mượt mà trong cả môi trường Dev (không có Clerk) lẫn Production bằng cơ chế SessionStorage dự phòng
   */
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

  // --- HỆ THỐNG STATE QUẢN LÝ DỮ LIỆU DỊCH VỤ & NHÂN VIÊN ---
  const [service, setService] = useState(null);               // Thông tin chi tiết dịch vụ đang chọn
  const [branches, setBranches] = useState([]);               // Danh sách các chi nhánh của hệ thống
  const [staffs, setStaffs] = useState([]);                   // Danh sách nhân viên thỏa mãn điều kiện rảnh
  const [selectedStaff, setSelectedStaff] = useState("");     // ID nhân viên được khách chọn chỉ định làm
  const [staffLoading, setStaffLoading] = useState(false);     // Trạng thái kiểm tra lịch rảnh nhân viên
  const [staffFetchError, setStaffFetchError] = useState(""); // Thông báo lỗi khi lấy lịch nhân viên thất bại

  // State lưu trữ toàn bộ thông tin điền form mặc định
  const [formData, setFormData] = useState({
    branch: "",
    scheduledAt: "",
    startTime: "",
    endTime: "",
    detailAddress: "",
    notes: "",
    pricingType: "Theo giờ", // "Theo giờ" hoặc "Trọn gói"
    paymentMethod: "COD",    // "COD" hoặc "Thanh toán Momo"
  });

  // --- HỆ THỐNG STATE ĐỊA CHÍNH (OPEN-API VIETNAM) ---
  const [provinces, setProvinces] = useState([]);       // Toàn bộ Tỉnh/Thành
  const [districts, setDistricts] = useState([]);       // Toàn bộ Quận/Huyện theo Tỉnh đã chọn
  const [wards, setWards] = useState([]);               // Toàn bộ Phường/Xã theo Quận đã chọn
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // ===== EFFECT 1: LẤY CHI TIẾT DỊCH VỤ HIỆN TẠI =====
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/services/get/${id}`)
      .then((res) => setService(res.data))
      .catch((err) => console.error("Lỗi khi tải dịch vụ:", err));
  }, [id]);

  // ===== EFFECT 2: LẤY DANH SÁCH CHI NHÁNH & TỰ ĐỘNG CHỌN CHI NHÁNH ĐẦU TIÊN =====
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/branches/getall")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.branches || [];
        setBranches(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, branch: data[0]._id })); // Auto-fill chi nhánh đầu tiên
        }
      })
      .catch((err) => console.error("Lỗi khi tải chi nhánh:", err));
  }, []);

  // ===== EFFECT 3: LỌC TỰ ĐỘNG NHÂN VIÊN RẢNH THEO CHI NHÁNH VÀ NGÀY =====
  useEffect(() => {
    if (!formData.branch || !formData.scheduledAt) {
      setStaffs([]);
      return;
    }

    setStaffLoading(true);
    setStaffFetchError("");

    // Chuyển đổi ngày sang định dạng chuẩn YYYY-MM-DD gửi lên server lọc lịch
    const dateStr = new Date(formData.scheduledAt).toISOString().split('T')[0];

    axios
      .get(`http://localhost:5000/api/employees/branch/${formData.branch}/availability?date=${dateStr}`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const availableStaffs = data.filter((emp) => !emp.busy); // Chỉ lấy nhân viên có cờ busy === false
        setStaffs(availableStaffs);
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách nhân viên:", err);
        setStaffFetchError("Không thể tải danh sách nhân viên rảnh. Vui lòng thử lại.");
        setStaffs([]);
      })
      .finally(() => setStaffLoading(false));
  }, [formData.branch, formData.scheduledAt]);

  // ===== EFFECT 4: LẤY DANH SÁCH TỈNH THÀNH & KHÓA MẶC ĐỊNH LÀ ĐÀ NẴNG =====
  useEffect(() => {
    axios
      .get("https://provinces.open-api.vn/api/p/")
      .then((res) => {
        setProvinces(res.data);
        const daNang = res.data.find((p) => p.name.includes("Đà Nẵng"));
        if (daNang) {
          setSelectedProvince(daNang.code); // Tự động khóa vùng dữ liệu tại Đà Nẵng
        }
      })
      .catch((err) => console.error("Lỗi khi tải tỉnh/thành:", err));
  }, []);

  // ===== EFFECT 5: LẤY QUẬN/HUYỆN DỰA TRÊN TỈNH ĐÃ CHỌN =====
  useEffect(() => {
    if (!selectedProvince) return;
    axios
      .get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
      .then((res) => setDistricts(res.data.districts || []))
      .catch((err) => console.error("Lỗi khi tải quận/huyện:", err));
  }, [selectedProvince]);

  // ===== EFFECT 6: LẤY PHƯỜNG/XÃ DỰA TRÊN QUẬN ĐÃ CHỌN =====
  useEffect(() => {
    if (!selectedDistrict) return;
    axios
      .get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
      .then((res) => setWards(res.data.wards || []))
      .catch((err) => console.error("Lỗi khi tải phường/xã:", err));
  }, [selectedDistrict]);

  // ===== EFFECT 7: ĐỒNG BỘ TÀI KHOẢN ĐĂNG NHẬP (CLERK AUTH) XUỐNG CƠ SỞ DỮ LIỆU KHÁCH HÀNG =====
  useEffect(() => {
    if (user) {
      axios
        .post("http://localhost:5000/api/auth/sync", {
          clerkId: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          phone: user.primaryPhoneNumber?.phoneNumber,
        })
        .then((res) => {
          localStorage.setItem("customerId", res.data.customer._id); // Lưu giữ _id khách hàng để phục vụ tạo đơn
        })
        .catch((err) => console.error("Sync customer failed:", err));
    }
  }, [user]);

  // Hàm lắng nghe thay đổi thông tin chung trong form
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ===== HÀM XỬ LÝ SUBMIT - TÍNH TOÁN TIỀN VÀ TIẾN HÀNH ĐẶT LỊCH =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Vui lòng đăng nhập trước khi đặt dịch vụ!");

    const customerId = localStorage.getItem("customerId");
    if (!customerId) return toast.error("Không tìm thấy thông tin khách hàng!");
    if (!formData.branch || !formData.scheduledAt || !formData.detailAddress || !selectedProvince || !selectedDistrict || !selectedWard) {
      return toast.error("Vui lòng điền đầy đủ thông tin địa chỉ!");
    }

    // Định nghĩa khung giờ quy định vận hành của doanh nghiệp
    const BUSINESS_START = "08:00";
    const BUSINESS_END = "18:00";

    try {
      const DEFAULT_HOURLY_RATE = 150000;
      const packageDiscount = 0.2;  // Chiết khấu giảm 20% cho gói trọn gói
      const packageHours = 5;       // Số giờ cố định cho gói trọn gói

      const hourlyRate = service?.price || DEFAULT_HOURLY_RATE;
      let total = 0;
      let start = null;
      let end = null;

      // 1. Phân tách logic tính tiền và thời gian theo loại hình: "Theo giờ"
      if (formData.pricingType === "Theo giờ") {
        if (!formData.startTime || !formData.endTime) {
          return toast.error("Vui lòng chọn giờ bắt đầu và kết thúc cho dịch vụ theo giờ!");
        }

        // Kiểm tra chặn đặt ngoài giờ hành chính
        if (formData.startTime < BUSINESS_START || formData.startTime > BUSINESS_END ||
          formData.endTime < BUSINESS_START || formData.endTime > BUSINESS_END) {
          return toast.error("Thời gian đặt dịch vụ phải trong giờ hành chính (8:00 - 18:00)!");
        }

        start = new Date(`${formData.scheduledAt}T${formData.startTime}`);
        end = new Date(`${formData.scheduledAt}T${formData.endTime}`);
        const diffHours = (end - start) / (1000 * 60 * 60);

        if (diffHours <= 0) {
          return toast.error("Giờ kết thúc phải sau giờ bắt đầu.");
        }

        total = diffHours * hourlyRate;
      }
      // 2. Phân tách logic tính tiền và thời gian theo loại hình: "Trọn gói"
      else {
        if (!formData.startTime) {
          return toast.error("Vui lòng chọn giờ bắt đầu cho gói trọn gói!");
        }

        start = new Date(`${formData.scheduledAt}T${formData.startTime}`);
        end = new Date(start.getTime() + packageHours * 60 * 60 * 1000); // Tự động cộng thêm 5 tiếng
        const endTimeStr = end.toTimeString().slice(0, 5);

        if (formData.startTime < BUSINESS_START || endTimeStr > BUSINESS_END) {
          return toast.error("Thời gian đặt dịch vụ phải trong giờ hành chính (8:00 - 18:00)!");
        }

        total = Math.round(packageHours * hourlyRate * (1 - packageDiscount));
      }

      // Tìm chuỗi text tên cụ thể (Hải Châu, Khuê Trung,...) từ Code của API địa chính để lưu DB gọn gàng hơn
      const provinceObj = provinces.find((p) => p.code === parseInt(selectedProvince));
      const districtObj = districts.find((d) => d.code === parseInt(selectedDistrict));
      const wardObj = wards.find((w) => w.code === parseInt(selectedWard));

      const scheduledDateTime = start || new Date(`${formData.scheduledAt}T00:00`);

      // Khởi tạo Payload gửi lên backend đồng bộ kiến trúc Schema
      const payload = {
        customer: customerId,
        service: id,
        branch: formData.branch,
        province: provinceObj?.name || "",
        district: districtObj?.name || "",
        ward: wardObj?.name || "",
        detailAddress: formData.detailAddress,
        notes: formData.notes,
        pricingType: formData.pricingType,
        scheduledAt: scheduledDateTime,
        startTime: start,
        endTime: end,
        price: total,
        paymentMethod: formData.paymentMethod,
        paymentStatus: "unpaid",
        staff: selectedStaff || null, // Nếu khách không chỉ định đích danh, backend/admin sẽ điều phối sau
      };

      // --- XỬ LÝ PHÂN LUỒNG PHƯƠNG THỨC THANH TOÁN ---
      if (formData.paymentMethod === "COD") {
        // Gửi đơn trực tiếp vào DB, hoàn thành tác vụ offline
        await axios.post("http://localhost:5000/api/orders", payload);
        toast.success("Đặt dịch vụ thành công!");
        navigate("/orders-susscess");
      } else {
        // Gọi lên endpoint tích hợp cổng thanh toán MoMo Online để xin PayUrl chuyển hướng thanh toán
        const res = await axios.post("http://localhost:5000/api/momo/create", {
          amount: total,
          orderInfo: `Thanh toán dịch vụ: ${service.name}`,
          ...payload,
        });
        if (res.data.payUrl) window.location.href = res.data.payUrl; // Điều hướng người dùng sang trang quét mã MoMo
      }
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi đặt dịch vụ!");
    }
  };

  // Trạng thái chờ tải giao diện ban đầu
  if (!service)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 animate-pulse">
        Đang tải dịch vụ...
      </div>
    );

  const hourlyRate = service?.price || 150000;
  const packageHours = 5;
  const packagePrice = Math.round(packageHours * hourlyRate * 0.8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 font-sans">
      <Meta title={`Đặt dịch vụ ${service.name}`} />

      {/* BANNER HEADER */}
      <section className="text-center py-20 bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-lg">
        <h1 className="text-5xl font-extrabold mb-3">Đặt dịch vụ: {service.name}</h1>
        <p className="opacity-90 max-w-2xl mx-auto">
          {service.description || "Dịch vụ chất lượng, nhanh chóng & tận tâm."}
        </p>
      </section>

      {/* BỐ CỤC CHÍNH */}
      <div className="max-w-6xl mx-auto py-16 px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* KHỐI TRÁI: FORM ĐIỀN THÔNG TIN CHI TIẾT */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-teal-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <CheckCircle2 className="text-teal-600" /> Thông tin đặt dịch vụ
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* THÔNG TIN CHI NHÁNH MẶC ĐỊNH */}
            {branches.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block font-medium mb-2 flex items-center gap-2">
                  <MapPin className="text-blue-600" /> Chi nhánh phục vụ
                </label>
                <div className="text-gray-700 font-semibold">{branches[0].name}</div>
                <div className="text-gray-600 text-sm mt-1">{branches[0].address}</div>
                <input type="hidden" name="branch" value={formData.branch} />
              </div>
            )}

            {/* KHU VỰC CHỌN NHÂN VIÊN RẢNH */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-teal-100">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="text-teal-600" />
                <div>
                  <h3 className="text-lg font-semibold">Nhân viên hiện có</h3>
                  <p className="text-sm text-gray-500">
                    Chọn chi nhánh và ngày đặt để xem nhân viên đang rảnh tại chi nhánh đó.
                  </p>
                </div>
              </div>

              {formData.branch && formData.scheduledAt ? (
                staffLoading ? (
                  <p className="text-sm text-gray-500">Đang kiểm tra nhân viên rảnh...</p>
                ) : staffs.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {staffs.map((s) => {
                      const avatarSrc = s.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=34d399&color=fff`;
                      const isSelected = selectedStaff === s._id;
                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => setSelectedStaff(s._id)}
                          className={`flex flex-col items-center p-5 rounded-2xl border-2 bg-white text-center shadow-sm hover:shadow-md transition ${isSelected ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-teal-300"
                            }`}
                        >
                          <img src={avatarSrc} alt={s.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 mb-3" />
                          <div className="w-full">
                            <p className="font-bold text-gray-900 text-lg">{s.name}</p>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {s.email && <p className="truncate">📧 {s.email}</p>}
                              {s.phone && <p className="truncate">📱 {s.phone}</p>}
                            </div>
                            {isSelected && (
                              <div className="mt-3 px-3 py-1.5 bg-teal-500 text-white text-xs font-semibold rounded-full">✓ Đã chọn</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {staffFetchError || "Không có nhân viên rảnh tại chi nhánh này vào ngày bạn chọn."}
                  </p>
                )
              ) : (
                <p className="text-sm text-gray-500">Vui lòng chọn ngày đặt cụ thể để hệ thống truy quét nhân viên thích hợp.</p>
              )}
            </div>

            {/* CHỌN NGÀY THỰC HIỆN DỊCH VỤ */}
            <div>
              <label className="block font-medium mb-2 flex items-center gap-2">
                <Calendar className="text-teal-600" /> Ngày đặt dịch vụ
              </label>
              <input type="date" name="scheduledAt" value={formData.scheduledAt} onChange={handleChange} required className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>

            {/* CHỌN LOẠI GIÁ */}
            <div>
              <label className="block font-medium mb-2 flex items-center gap-2">
                <DollarSign className="text-teal-600" /> Loại tính giá
              </label>
              <select name="pricingType" value={formData.pricingType} onChange={handleChange} className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500">
                <option value="Theo giờ">Theo giờ</option>
                <option value="Trọn gói">Trọn gói</option>
              </select>
            </div>

            {/* RENDER KHUNG GIỜ DỰA THEO LOẠI GIÁ ĐÃ CHỌN */}
            {formData.pricingType === "Theo giờ" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2 flex items-center gap-2"><Clock className="text-teal-600" /> Giờ bắt đầu</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500" />
                  <p className="text-xs text-gray-500 mt-1">Giờ hành chính: 8:00 - 18:00</p>
                </div>
                <div>
                  <label className="block font-medium mb-2 flex items-center gap-2"><Clock className="text-teal-600" /> Giờ kết thúc</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500" />
                  <p className="text-xs text-gray-500 mt-1">Giờ hành chính: 8:00 - 18:00</p>
                </div>
              </div>
            )}

            {formData.pricingType === "Trọn gói" && (
              <div>
                <label className="block font-medium mb-2 flex items-center gap-2"><Clock className="text-teal-600" /> Giờ bắt đầu (Mặc định gói 5h)</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500" />
                <p className="text-xs text-gray-500 mt-1">Hệ thống tự cộng 5 tiếng sau giờ bắt đầu. Khung giờ hoạt động hợp lệ: 8:00 - 18:00</p>
              </div>
            )}

            {/* KHU VỰC THÔNG TIN ĐỊA CHỈ (QUẬN/HUYỆN & PHƯỜNG/XÃ) */}
            <div>
              <label className="block font-medium mb-2 flex items-center gap-2"><Home className="text-teal-600" /> Địa chỉ thực hiện (Khu vực Đà Nẵng)</label>
              <div className="bg-emerald-50 p-3 rounded-lg mb-4 border border-emerald-200">
                <span className="text-sm text-gray-600">Thành phố: </span>
                <span className="font-semibold text-gray-800">Đà Nẵng</span>
              </div>

              {/* Quận */}
              <select value={selectedDistrict} onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedWard(""); }} required className="w-full border px-4 py-3 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500">
                <option value="">-- Chọn quận/huyện --</option>
                {districts.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
              </select>

              {/* Phường */}
              <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} required className="w-full border px-4 py-3 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500">
                <option value="">-- Chọn phường/xã --</option>
                {wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
              </select>

              {/* Địa chỉ số nhà / tên đường cụ thể */}
              <input type="text" name="detailAddress" value={formData.detailAddress} onChange={handleChange} required placeholder="Ví dụ: 123 Đường Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng" className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>

            {/* TRƯỜNG NHẬP GHI CHÚ THÊM */}
            <div>
              <label className="block font-medium mb-2 flex items-center gap-2"><FileText className="text-teal-600" /> Ghi chú bổ sung</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="Ví dụ: Nhà có em nhỏ, mang theo máy hút bụi mini..." className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>

            {/* LỰA CHỌN PHƯƠNG THỨC THANH TOÁN */}
            <div>
              <label className="block font-medium mb-2 flex items-center gap-2"><CreditCard className="text-teal-600" /> Hình thức thanh toán</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500">
                <option value="COD">Thanh toán khi hoàn thành (COD)</option>
                <option value="Thanh toán Momo">Thanh toán qua ví điện tử MoMo</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition">
              Xác nhận đặt dịch vụ
            </button>
          </form>
        </div>

        {/* KHỐI PHẢI: THÔNG TIN BẢNG GIÁ VÀ HÓA ĐƠN DỰ KIẾN */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-teal-100 h-fit">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Tổng quan dịch vụ</h3>
          <p className="text-gray-700 font-medium mb-2">{service.name}</p>
          <p className="text-gray-600 mb-4 text-sm">{service.description || "Dịch vụ hiện chưa có mô tả chi tiết."}</p>

          <div className="flex flex-col gap-2 mb-6 border-t pt-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Đơn giá gốc:</span>
              <span className="text-teal-600 font-bold">{hourlyRate.toLocaleString()} đ/giờ</span>
            </div>
            <div className="flex flex-col bg-teal-50 p-3 rounded-xl gap-1 mt-2">
              <span className="text-gray-600 font-medium">Ưu đãi trọn gói (5 tiếng):</span>
              <span className="text-emerald-700 font-extrabold text-base">
                {packagePrice.toLocaleString()} đ <span className="text-xs font-normal text-gray-500">(Giảm 20% tổng bill)</span>
              </span>
            </div>
          </div>

          <button onClick={() => navigate("/services")} className="w-full border border-teal-500 text-teal-600 py-3 rounded-xl hover:bg-teal-50 transition text-sm font-medium">
            ← Quay lại danh sách dịch vụ
          </button>
        </div>

      </div>
    </div>
  );
}