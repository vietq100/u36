import { z } from "zod";

// Zod schema for Project Form Validation
export const projectSchema = z.object({
  projectName: z.string().min(1, "Tên dự án không được để trống"),
  projectCode: z.string().min(1, "Mã dự án không được để trống"),
  numberOfFloors: z.coerce.number().min(1, "Số tầng phải lớn hơn hoặc bằng 1"),
  sortNumber: z.coerce.number().optional().nullable(),
  landlordName: z.string().optional().nullable(),
  totalSize: z.coerce.number().optional().nullable(),
  builtDate: z.string().optional().nullable(),
  link: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  budgetCode: z.string().optional().nullable(),
  projectManagerName: z.string().optional().nullable(),
  
  // Lessor fields
  lessorAddress: z.string().optional().nullable(),
  lessorAddressVi: z.string().optional().nullable(),
  representativeOf: z.string().optional().nullable(),
  representativeOfVi: z.string().optional().nullable(),
  lessorPosition: z.string().optional().nullable(),
  lessorPositionVi: z.string().optional().nullable(),
  lessorCertificateName: z.string().optional().nullable(),
  lessorCertificateNameVi: z.string().optional().nullable(),
  lessorCertificateNumber: z.string().optional().nullable(),
  lessorCertificateNumberVi: z.string().optional().nullable(),
  lessorCertificateIssuedBy: z.string().optional().nullable(),
  lessorCertificateIssuedByVi: z.string().optional().nullable(),
  lessorCertificateIssuedDate: z.string().optional().nullable(),
  registerAddress: z.string().optional().nullable(),
  registerAddressVi: z.string().optional().nullable(),

  // Representative fields
  representativeBy: z.string().optional().nullable(),
  representativeByVi: z.string().optional().nullable(),
  representativePosition: z.string().optional().nullable(),
  representativePositionVi: z.string().optional().nullable(),
  representativeCertificateNumber: z.string().optional().nullable(),
  representativeCertificateNumberVi: z.string().optional().nullable(),
  representativeExecuteBy: z.string().optional().nullable(),
  representativeExecuteByVi: z.string().optional().nullable(),
  representativeCertificateEffectiveDate: z.string().optional().nullable(),

  // Bank fields
  bankAccount: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankNameVi: z.string().optional().nullable(),
  bankAddress: z.string().optional().nullable(),
  bankAddressVi: z.string().optional().nullable(),

  // Bank fields 2
  optionalBankAccount: z.string().optional().nullable(),
  optionalBankName: z.string().optional().nullable(),
  optionalBankNameVi: z.string().optional().nullable(),
  optionalBankAddress: z.string().optional().nullable(),
  optionalBankAddressVi: z.string().optional().nullable(),

  // Managing agent fields
  managingAgentCompany: z.string().optional().nullable(),
  managingAgentCompanyVi: z.string().optional().nullable(),
  holderOf: z.string().optional().nullable(),
  holderOfVi: z.string().optional().nullable(),
  managingAgentCertificateNumber: z.string().optional().nullable(),
  managingAgentCertificateNumberVi: z.string().optional().nullable(),
  managingAgentCertificateIssuedDate: z.string().optional().nullable(),
  managingAgentCertificateIssuedBy: z.string().optional().nullable(),
  managingAgentCertificateIssuedByVi: z.string().optional().nullable(),

  // Parking fees
  motorbikeCost: z.coerce.number().optional().nullable(),
  dedicatedCarCost: z.coerce.number().optional().nullable(),
  petFees: z.coerce.number().optional().nullable(),

  // Dropdowns / Relations
  landlordId: z.coerce.number().optional().nullable(),
  propertyManagementId: z.coerce.number().optional().nullable(),
  contactId: z.coerce.number().optional().nullable(),
  projectFacilityIds: z.array(z.number()).optional().nullable(),
  
  // Address relations
  projectAddressText: z.string().optional().nullable(),
  projectAddressTextVi: z.string().optional().nullable(),
  provinceId: z.coerce.number().optional().nullable(),
  districtId: z.coerce.number().optional().nullable(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

// Zod schema for Unit Form Validation
export const unitSchema = z.object({
  unitName: z.string().min(1, "Mã căn hộ/mặt bằng không được để trống"),
  projectId: z.coerce.number().min(1, "Vui lòng chọn dự án"),
  floorId: z.coerce.number().min(1, "Vui lòng chọn tầng"),
  floorName: z.string().optional().nullable(),
  actualSize: z.coerce.number().min(0, "Diện tích phải lớn hơn hoặc bằng 0"),
  price: z.coerce.number().min(0, "Giá thuê phải lớn hơn hoặc bằng 0"),
  statusId: z.coerce.number().min(1, "Vui lòng chọn trạng thái"),
  description: z.string().optional().nullable(),
  
  productTypeId: z.coerce.number().optional().nullable(),
  unitTypeId: z.coerce.number().optional().nullable(),
  balcony: z.coerce.number().optional().nullable(),
  askingRent: z.coerce.number().optional().nullable(),
  facingId: z.coerce.number().optional().nullable(),
  viewIds: z.array(z.number()).optional().nullable(),
  unitFacilityIds: z.array(z.number()).optional().nullable(),
});

export type UnitFormValues = z.infer<typeof unitSchema>;

// Frontend Project Interface
export interface Project {
  id: number;
  projectName: string;
  projectCode: string;
  numberOfFloors: number;
  numberOfUnits: number;
  description?: string;
  isActive: boolean;
  
  sortNumber?: number;
  landlordName?: string;
  totalSize?: number;
  builtDate?: string;
  link?: string;
  budgetCode?: string;
  projectManagerName?: string;

  // Lessor fields
  lessorAddress?: string;
  lessorAddressVi?: string;
  representativeOf?: string;
  representativeOfVi?: string;
  lessorPosition?: string;
  lessorPositionVi?: string;
  lessorCertificateName?: string;
  lessorCertificateNameVi?: string;
  lessorCertificateNumber?: string;
  lessorCertificateNumberVi?: string;
  lessorCertificateIssuedBy?: string;
  lessorCertificateIssuedByVi?: string;
  lessorCertificateIssuedDate?: string;
  registerAddress?: string;
  registerAddressVi?: string;

  // Representative fields
  representativeBy?: string;
  representativeByVi?: string;
  representativePosition?: string;
  representativePositionVi?: string;
  representativeCertificateNumber?: string;
  representativeCertificateNumberVi?: string;
  representativeExecuteBy?: string;
  representativeExecuteByVi?: string;
  representativeCertificateEffectiveDate?: string;

  // Bank fields
  bankAccount?: string;
  bankName?: string;
  bankNameVi?: string;
  bankAddress?: string;
  bankAddressVi?: string;

  // Bank fields 2
  optionalBankAccount?: string;
  optionalBankName?: string;
  optionalBankNameVi?: string;
  optionalBankAddress?: string;
  optionalBankAddressVi?: string;

  // Managing agent fields
  managingAgentCompany?: string;
  managingAgentCompanyVi?: string;
  holderOf?: string;
  holderOfVi?: string;
  managingAgentCertificateNumber?: string;
  managingAgentCertificateNumberVi?: string;
  managingAgentCertificateIssuedDate?: string;
  managingAgentCertificateIssuedBy?: string;
  managingAgentCertificateIssuedByVi?: string;

  // Parking fees
  motorbikeCost?: number;
  dedicatedCarCost?: number;
  petFees?: number;

  // Relations
  landlordId?: number;
  propertyManagementId?: number;
  contactId?: number;
  projectFacilityIds?: number[];
  
  // Address relations
  projectAddressText?: string;
  projectAddressTextVi?: string;
  provinceId?: number;
  districtId?: number;
}

// Frontend Unit Interface
export interface Unit {
  id: number;
  unitName: string;
  projectId: number;
  projectName: string;
  floorId: number;
  floorName: string;
  actualSize: number;
  price: number;
  statusId: number;
  statusName: string;
  statusColor?: string;
  description?: string;
  isActive: boolean;

  productTypeId?: number;
  unitTypeId?: number;
  balcony?: number;
  askingRent?: number;
  facingId?: number;
  viewIds?: number[];
  unitFacilityIds?: number[];
}

// Frontend Floor Interface
export interface Floor {
  id: number;
  floorName: string;
  size: number;
  order: number;
  isActive: boolean;
  projectId: number;
  numberOfUnits?: number;
}

// Zod schema for Floor validation
export const floorSchema = z.object({
  floorName: z.string().min(1, "Tên tầng không được để trống"),
  size: z.coerce.number().min(0, "Diện tích phải lớn hơn hoặc bằng 0"),
  order: z.coerce.number().optional().nullable(),
});

export type FloorFormValues = z.infer<typeof floorSchema>;


