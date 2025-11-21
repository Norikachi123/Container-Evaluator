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

// Updated Container Sides
export type ContainerSide = 
  // Exterior
  | 'SIDE_1_EXT' // Side Wall 1 (Left)
  | 'SIDE_2_EXT' // Side Wall 2 (Right)
  | 'FRONT_EXT'  // Front Wall
  | 'DOOR_EXT'   // Door Wall
  | 'ROOF_EXT'   // Roof
  | 'UNDER_EXT'  // Floor/Underside
  // Interior
  | 'SIDE_1_INT' // Inside Side Wall 1
  | 'SIDE_2_INT' // Inside Side Wall 2
  | 'FRONT_INT'  // Inside Front Wall
  | 'DOOR_INT'   // Inside Door Wall
  | 'ROOF_INT'   // Inside Roof
  | 'FLOOR_INT'; // Inside Floor

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface Defect {
  id: string;
  imageId: string; 
  code: DefectCode;
  confidence: number;
  severity: Severity;
  description: string;
  boundingBox: BoundingBox;
  status: ReviewStatus;
  reviewerComment?: string;
  // Pricing fields
  repairCost?: number;
  laborHours?: number;
  partsCost?: number;
}

export interface InspectionImage {
  id: string;
  side: ContainerSide;
  url: string; 
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  INVOICED = 'INVOICED'
}

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerAddress: string;
}

export interface Quote {
  subtotal: number;
  tax: number;
  total: number;
  currency: 'VND';
  status: QuoteStatus;
  generatedAt: string;
  approvedBy?: string;
  invoiceDetails?: InvoiceDetails;
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
  quote?: Quote;
}

export interface ManifestItem {
  id: string;
  containerNumber: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  addedAt: string;
}

export interface PricingRule {
  id: string;
  defectCode: DefectCode;
  severity: Severity;
  basePrice: number;
  laborHours: number;
  description: string;
}

export type Language = 'en' | 'vi';