import { z } from "zod";

export const contractSchema = z.object({
  referenceNumber: z.string().min(1, "Số hợp đồng không được để trống"),
  companyId: z.coerce.number().optional().nullable(),
  contactId: z.coerce.number().min(1, "Người đại diện/liên hệ không được để trống"),
  unitId: z.coerce.number().min(1, "Căn hộ/Mặt bằng không được để trống"),
  commencementDate: z.string().min(1, "Ngày bắt đầu không được để trống"),
  expiryDate: z.string().min(1, "Ngày hết hạn không được để trống"),
  depositAmount: z.coerce.number().min(0, "Tiền cọc phải lớn hơn hoặc bằng 0"),
  contractAmount: z.coerce.number().min(0, "Giá trị hợp đồng phải lớn hơn hoặc bằng 0"),
  statusId: z.coerce.number().min(1, "Trạng thái không được để trống"),
  description: z.string().optional().nullable(),
});

export type ContractFormValues = z.infer<typeof contractSchema>;

export interface LeaseContract {
  id: number;
  referenceNumber: string;
  companyId?: number | null;
  companyName?: string | null;
  contactId: number;
  contactName: string;
  unitId: number;
  unitName: string;
  projectId: number;
  projectName: string;
  commencementDate: string;
  expiryDate: string;
  depositAmount: number;
  contractAmount: number;
  statusId: number;
  statusName: string;
  statusColor: string;
  description?: string | null;
  isActive: boolean;
  creationTime: string;
}

export interface ContractStatusOption {
  id: number;
  name: string;
  code: string;
  color: string;
}
