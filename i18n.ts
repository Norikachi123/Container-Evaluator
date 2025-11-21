
import { Language } from './types';

export const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    inspect: "Inspect",
    history: "History",
    logout: "Logout",
    queue: "Queue",
    manifest: "Manifest",
    pricing: "Pricing Rules",
    pricing_settings: "Pricing Settings",
    pending_review: "Pending Review",
    completed: "Completed",
    total_inspections: "Total Inspections",
    defect_frequency: "Defect Frequency",
    new_inspection: "New Inspection",
    container_number: "Container Number",
    sides_to_capture: "Sides to Capture",
    upload_photo: "Add Photo",
    analyzing: "Analyzing...",
    start_inspection: "Start Inspection",
    analysis_failed: "Analysis failed. Please try again.",
    no_images: "Please add at least one image to proceed.",
    confirm: "Confirm",
    reject: "Reject",
    export_pdf: "Export PDF",
    defects_detected: "Defects Detected",
    no_defects: "No defects found.",
    inspector: "Inspector",
    date: "Date",
    status: "Status",
    action: "Action",
    search_placeholder: "Search Container...",
    login_inspector: "Login as Inspector",
    login_reviewer: "Login as Reviewer",
    login_title: "ContainerAI Inspector",
    login_subtitle: "Automated Defect Detection & Review",
    add_containers: "Add Containers",
    next_containers: "Next Container",
    iicl_tags: "IICL Tags",
    
    // Quote / Pricing
    quote: "Quote",
    estimated_cost: "Estimated Cost",
    subtotal: "Subtotal",
    tax: "Tax (10%)",
    total: "Total",
    approve_quote: "Approve Quote",
    quote_approved: "Quote Approved",
    labor: "Labor",
    parts: "Parts",
    hours: "hrs",
    save_changes: "Save Changes",
    base_price: "Base Price (VND)",
    labor_hours: "Labor Hours",
    // OCR
    scan_id: "Scan ID",
    scanning: "Scanning...",
    id_not_found: "ID not found",
    
    sides: {
      DOOR_EXT: "Door Wall (Ext)",
      SIDE_1_EXT: "Side Wall 1 (Left)",
      SIDE_2_EXT: "Side Wall 2 (Right)",
      FRONT_EXT: "Front Wall",
      ROOF_EXT: "Roof",
      UNDER_EXT: "Floor/Underside",
      
      DOOR_INT: "Inside Door Wall",
      SIDE_1_INT: "Inside Side Wall 1",
      SIDE_2_INT: "Inside Side Wall 2",
      FRONT_INT: "Inside Front Wall",
      ROOF_INT: "Inside Roof",
      FLOOR_INT: "Inside Floor"
    },
    // ... existing defect codes ...
     defects: {
      B: "Data Plate (B)",
      DT: "Dent (DT)",
      BW: "Bulge/Bow (BW)",
      BT: "Bent (BT)",
      RO: "Rot (RO)",
      CO: "Rust (CO)",
      DL: "Delamination (DL)",
      LO: "Loose (LO)",
      BR: "Broken (BR)",
      CK: "Crack (CK)",
      OL: "Oil/Stain (OL)",
      HO: "Hole (HO)",
      GD: "Gouge/Scratch (GD)",
      CU: "Cut/Tear (CU)",
      MA: "Deformation (MA)",
      MS: "Missing (MS)",
      CT: "Glue/Tape (CT)",
      DY: "Dirty (DY)"
    }
  },
  vi: {
    dashboard: "Tổng quan",
    inspect: "Kiểm tra",
    history: "Lịch sử",
    logout: "Đăng xuất",
    queue: "Hàng đợi",
    manifest: "Manifest",
    pricing: "Bảng giá",
    pricing_settings: "Cài đặt giá",
    pending_review: "Chờ duyệt",
    completed: "Hoàn tất",
    total_inspections: "Tổng số kiểm tra",
    defect_frequency: "Tần suất lỗi",
    new_inspection: "Kiểm tra mới",
    container_number: "Số Container",
    sides_to_capture: "Các mặt cần chụp",
    upload_photo: "Thêm ảnh",
    analyzing: "Đang phân tích...",
    start_inspection: "Bắt đầu kiểm tra",
    analysis_failed: "Phân tích thất bại. Vui lòng thử lại.",
    no_images: "Vui lòng thêm ít nhất một ảnh.",
    confirm: "Xác nhận",
    reject: "Từ chối",
    export_pdf: "Xuất PDF",
    defects_detected: "Lỗi được phát hiện",
    no_defects: "Không tìm thấy lỗi.",
    inspector: "Thanh tra viên",
    date: "Ngày",
    status: "Trạng thái",
    action: "Hành động",
    search_placeholder: "Tìm số container...",
    login_inspector: "Đăng nhập: Thanh tra",
    login_reviewer: "Đăng nhập: Người duyệt",
    login_title: "ContainerAI Inspector",
    login_subtitle: "Tự động phát hiện lỗi & Quy trình duyệt",
    add_containers: "Thêm containers",
    next_containers: "Container tiếp theo",
    iicl_tags: "Thẻ IICL",
    
    // Quote / Pricing
    quote: "Báo giá",
    estimated_cost: "Chi phí dự kiến",
    subtotal: "Tạm tính",
    tax: "Thuế (10%)",
    total: "Tổng cộng",
    approve_quote: "Duyệt báo giá",
    quote_approved: "Đã duyệt",
    labor: "Nhân công",
    parts: "Vật tư",
    hours: "giờ",
    save_changes: "Lưu thay đổi",
    base_price: "Giá vật tư (VND)",
    labor_hours: "Giờ công",
    // OCR
    scan_id: "Quét số Cont",
    scanning: "Đang quét...",
    id_not_found: "Không tìm thấy số",

    sides: {
      DOOR_EXT: "Vách cửa (Ngoài)",
      SIDE_1_EXT: "Vách dọc 1 (Trái)",
      SIDE_2_EXT: "Vách dọc 2 (Phải)",
      FRONT_EXT: "Vách trước",
      ROOF_EXT: "Nóc",
      UNDER_EXT: "Gầm sàn",
      
      DOOR_INT: "Vách cửa (Trong)",
      SIDE_1_INT: "Vách dọc 1 (Trong)",
      SIDE_2_INT: "Vách dọc 2 (Trong)",
      FRONT_INT: "Vách trước (Trong)",
      ROOF_INT: "Nóc (Trong)",
      FLOOR_INT: "Sàn (Trong)"
    },
    // ... existing defects ...
    defects: {
      B: "Bảng thông số (B)",
      DT: "Móp (DT)",
      BW: "Phình (BW)",
      BT: "Cong (BT)",
      RO: "Mục (RO)",
      CO: "Rỉ sét (CO)",
      DL: "Bong tách lớp (DL)",
      LO: "Bung (LO)",
      BR: "Bể/vỡ (BR)",
      CK: "Nứt (CK)",
      OL: "Dầu/nhớt (OL)",
      HO: "Lủng (HO)",
      GD: "Xước (GD)",
      CU: "Rách (CU)",
      MA: "Biến dạng (MA)",
      MS: "Mất (MS)",
      CT: "Keo/Băng keo (CT)",
      DY: "Dơ/bẩn (DY)"
    }
  }
};

export const t = (lang: Language, key: string): string => {
  // @ts-ignore
  return TRANSLATIONS[lang][key] || key;
};

export const tSide = (lang: Language, side: string): string => {
  // @ts-ignore
  return TRANSLATIONS[lang].sides[side] || side;
};

export const tDefect = (lang: Language, code: string): string => {
    // @ts-ignore
    return TRANSLATIONS[lang].defects[code] || code;
};
