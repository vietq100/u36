import { z } from "zod";

export const inquirySchema = z.object({
  inquiryName: z.string().min(1, "Tên yêu cầu không được để trống"),
  contactId: z.coerce.number().min(1, "Khách liên hệ không được để trống"),
  companyId: z.coerce.number().optional().nullable(),
  projectIds: z.array(z.coerce.number()).min(1, "Vui lòng chọn ít nhất một dự án quan tâm"),
  fromPrice: z.coerce.number().min(0, "Ngân sách tối thiểu phải lớn hơn hoặc bằng 0").optional().nullable(),
  toPrice: z.coerce.number().min(0, "Ngân sách tối đa phải lớn hơn hoặc bằng 0").optional().nullable(),
  fromSize: z.coerce.number().min(0, "Diện tích tối thiểu phải lớn hơn hoặc bằng 0").optional().nullable(),
  toSize: z.coerce.number().min(0, "Diện tích tối đa phải lớn hơn hoặc bằng 0").optional().nullable(),
  statusId: z.coerce.number().min(1, "Trạng thái không được để trống"),
  description: z.string().optional().nullable(),

  // Additional fields from Pico/Leasing source
  sourceId: z.coerce.number().min(1, "Nguồn yêu cầu không được để trống"),
  statusDetailId: z.coerce.number().optional().nullable(),
  occupierName: z.string().optional().nullable(),
  moveInDate: z.string().optional().nullable(),
  leaseTerm: z.coerce.number().optional().nullable(),
  facingIds: z.array(z.coerce.number()).optional(),
  viewIds: z.array(z.coerce.number()).optional(),
  serviceTypeIds: z.array(z.coerce.number()).optional(),
  unitFacilityIds: z.array(z.coerce.number()).optional(),
  propertyTypeIds: z.array(z.coerce.number()).optional(),
  unitTypeIds: z.array(z.coerce.number()).optional(),
  provinceId: z.coerce.number().optional().nullable(),
  districtId: z.coerce.number().optional().nullable(),
  addressText: z.string().optional().nullable(),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;

export interface Inquiry {
  id: number;
  inquiryName: string;
  contactId: number;
  contactName: string;
  companyId?: number | null;
  companyName?: string | null;
  projectId: number; // for backward compatibility with list rendering
  projectName: string; // for backward compatibility
  projectIds?: number[] | null;
  askingRent: number;
  actualSize: number;
  fromPrice?: number | null;
  toPrice?: number | null;
  fromSize?: number | null;
  toSize?: number | null;
  statusId: number;
  statusName: string;
  statusColor: string;
  description?: string | null;
  isActive: boolean;
  creationTime: string;
  uniqueId?: string;

  // Additional fields from Pico/Leasing source
  sourceId?: number | null;
  statusDetailId?: number | null;
  occupierName?: string | null;
  moveInDate?: string | null;
  leaseTerm?: number | null;
  facingIds?: number[];
  viewIds?: number[];
  serviceTypeIds?: number[];
  unitFacilityIds?: number[];
  propertyTypeIds?: number[];
  unitTypeIds?: number[];
  provinceId?: number | null;
  districtId?: number | null;
  addressText?: string | null;
}

export interface InquiryStatusOption {
  id: number;
  name: string;
  code: string;
  color: string;
}

