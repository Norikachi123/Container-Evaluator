import { Language } from './types';

export const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    inspect: "Inspect",
    history: "History",
    logout: "Logout",
    queue: "Queue",
    manifest: "Manifest",
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
    iicl_tags: "IICL Tags",
    // Manifest
    add_containers: "Add Containers",
    add_to_queue: "Add to Queue",
    clear_queue: "Clear Queue",
    manifest_intro: "Enter container numbers separated by commas or new lines.",
    upload_csv: "Upload CSV",
    scan_barcode: "Scan Barcode",
    next_container: "Next Container",
    queue_empty: "Queue is empty.",
    pending: "Pending",
    in_progress: "In Progress",
    // OCR
    scan_id: "Scan ID",
    scanning: "Scanning...",
    id_not_found: "ID not found",
    
    sides: {
      FRONT_EXT: "Front (Ext)",
      FRONT_INT: "Front (Int)",
      REAR_EXT: "Rear (Ext)",
      REAR_INT: "Rear (Int)",
      LEFT_EXT: "Left (Ext)",
      LEFT_INT: "Left (Int)",
      RIGHT_EXT: "Right (Ext)",
      RIGHT_INT: "Right (Int)",
      ROOF_EXT: "Roof (Ext)",
      ROOF_INT: "Roof (Int)",
      FLOOR: "Floor",
      DOOR: "Door(s)"
    },
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
    iicl_tags: "Thẻ IICL",
    // Manifest
    add_containers: "Thêm Container",
    add_to_queue: "Thêm vào hàng đợi",
    clear_queue: "Xóa hàng đợi",
    manifest_intro: "Nhập số container ngăn cách bằng dấu phẩy hoặc xuống dòng.",
    upload_csv: "Tải lên CSV",
    scan_barcode: "Quét mã vạch",
    next_container: "Container Tiếp Theo",
    queue_empty: "Hàng đợi trống.",
    pending: "Chờ xử lý",
    in_progress: "Đang xử lý",
    // OCR
    scan_id: "Quét số Cont",
    scanning: "Đang quét...",
    id_not_found: "Không tìm thấy số",
    
    sides: {
      FRONT_EXT: "Mặt trước (Ngoài)",
      FRONT_INT: "Mặt trước (Trong)",
      REAR_EXT: "Mặt sau (Ngoài)",
      REAR_INT: "Mặt sau (Trong)",
      LEFT_EXT: "Bên trái (Ngoài)",
      LEFT_INT: "Bên trái (Trong)",
      RIGHT_EXT: "Bên phải (Ngoài)",
      RIGHT_INT: "Bên phải (Trong)",
      ROOF_EXT: "Mái (Ngoài)",
      ROOF_INT: "Mái (Trong)",
      FLOOR: "Sàn",
      DOOR: "Cửa"
    },
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