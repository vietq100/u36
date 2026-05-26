import { z } from "zod";

export const inquirySchema = z.object({
  contactId: z.coerce.number().min(1, "Khách liên hệ không được để trống"),
  companyId: z.coerce.number().optional().nullable(),
  projectId: z.coerce.number().min(1, "Dự án quan tâm không được để trống"),
  askingRent: z.coerce.number().min(0, "Ngân sách tối đa phải lớn hơn hoặc bằng 0"),
  actualSize: z.coerce.number().min(0, "Diện tích tối thiểu phải lớn hơn hoặc bằng 0"),
  statusId: z.coerce.number().min(1, "Trạng thái không được để trống"),
  description: z.string().optional().nullable(),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;

export interface Inquiry {
  id: number;
  contactId: number;
  contactName: string;
  companyId?: number | null;
  companyName?: string | null;
  projectId: number;
  projectName: string;
  askingRent: number;
  actualSize: number;
  statusId: number;
  statusName: string;
  statusColor: string;
  description?: string | null;
  isActive: boolean;
  creationTime: string;
}

export interface InquiryStatusOption {
  id: number;
  name: string;
  code: string;
  color: string;
}
