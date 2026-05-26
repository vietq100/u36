import { z } from "zod";

// Zod schema for Project Form Validation
export const projectSchema = z.object({
  projectName: z.string().min(1, "Tên dự án không được để trống"),
  projectCode: z.string().min(1, "Mã dự án không được để trống"),
  numberOfFloors: z.coerce.number().min(1, "Số tầng phải lớn hơn hoặc bằng 1"),
  description: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

// Zod schema for Unit Form Validation
export const unitSchema = z.object({
  unitName: z.string().min(1, "Mã căn hộ/mặt bằng không được để trống"),
  projectId: z.coerce.number().min(1, "Vui lòng chọn dự án"),
  floorName: z.string().min(1, "Tên tầng không được để trống"),
  actualSize: z.coerce.number().min(0, "Diện tích phải lớn hơn hoặc bằng 0"),
  price: z.coerce.number().min(0, "Giá thuê phải lớn hơn hoặc bằng 0"),
  statusId: z.coerce.number().min(1, "Vui lòng chọn trạng thái"),
  description: z.string().optional(),
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
}

// Frontend Unit Interface
export interface Unit {
  id: number;
  unitName: string;
  projectId: number;
  projectName: string;
  floorName: string;
  actualSize: number;
  price: number;
  statusId: number;
  statusName: string;
  statusColor?: string;
  description?: string;
  isActive: boolean;
}
