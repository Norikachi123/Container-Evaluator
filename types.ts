export enum UserRole {
  INSPECTOR = 'INSPECTOR',
  REVIEWER = 'REVIEWER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

// IICL Codes from PDF
export enum DefectCode {
  B = 'B',     // Bảng thông số (Data Plate)
  DT = 'DT',   // Móp (Dent)
  BW = 'BW',   // Phình (Bulge)
  BT = 'BT',   // Cong (Bent)
  RO = 'RO',   // Mục (Rot)
  CO = 'CO',   // Rỉ sét (Corrosion)
  DL = 'DL',   // Bong tách lớp (Delamination)
  LO = 'LO',   // Bung (Loose)
  BR = 'BR',   // Bể/vỡ (Broken)
  CK = 'CK',   // Nứt (Crack)
  OL = 'OL',   // Dầu/nhớt (Oil)
  HO = 'HO',   // Lủng (Hole)
  GD = 'GD',   // Xước (Gouge)
  CU = 'CU',   // Rách (Cut)
  MA = 'MA',   // Biến dạng (Major)
  MS = 'MS',   // Mất (Missing)
  CT = 'CT',   // Keo và băng keo (Glue)
  DY = 'DY',   // Dơ/bẩn (Dirty)
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  MODIFIED = 'MODIFIED',
  REJECTED = 'REJECTED'
}

// Updated sides to include Interior/Exterior for walls and roof
export type ContainerSide = 
  | 'FRONT_EXT' | 'FRONT_INT' 
  | 'REAR_EXT' | 'REAR_INT' 
  | 'LEFT_EXT' | 'LEFT_INT' 
  | 'RIGHT_EXT' | 'RIGHT_INT' 
  | 'ROOF_EXT' | 'ROOF_INT' 
  | 'FLOOR' | 'DOOR';

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface Defect {
  id: string;
  imageId: string; // Link defect to specific image
  code: DefectCode;
  confidence: number;
  severity: Severity;
  description: string;
  boundingBox: BoundingBox;
  status: ReviewStatus;
  reviewerComment?: string;
}

export interface InspectionImage {
  id: string;
  side: ContainerSide;
  url: string; // Base64 for MVP
}

export interface Inspection {
  id: string;
  containerNumber: string;
  timestamp: string;
  inspectorId: string;
  location: string; 
  images: InspectionImage[];
  defects: Defect[];
  status: 'ANALYZING' | 'REVIEW_NEEDED' | 'COMPLETED';
  overallCondition?: string;
  iiclTags?: string[];
}

export interface ManifestItem {
  id: string;
  containerNumber: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  addedAt: string;
}

export type Language = 'en' | 'vi';