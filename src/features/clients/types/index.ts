import { z } from "zod";

// Zod schema for Company Form Validation
export const companySchema = z.object({
  companyName: z.string().min(1, "Tên doanh nghiệp không được để trống"),
  vatCode: z.string().min(1, "Mã số thuế không được để trống"),
  email: z.string().email("Email không hợp lệ").or(z.literal("")).optional(),
  phone: z.string().min(1, "Số điện thoại không được để trống"),
  website: z.string().or(z.literal("")).optional(),
  address: z.string().optional(),
  industryId: z.coerce.number().optional(),
  nationalityId: z.coerce.number().optional(),
  description: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

// Zod schema for Contact Form Validation
export const contactSchema = z.object({
  contactName: z.string().min(1, "Họ tên không được để trống"),
  companyId: z.coerce.number().optional(),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(1, "Số điện thoại không được để trống"),
  gender: z.string().optional(),
  nationalityId: z.coerce.number().optional(),
  leadSourceId: z.coerce.number().optional(),
  levelId: z.coerce.number().optional(),
  description: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

// Frontend Company Interface
export interface Company {
  id: number;
  companyName: string;
  vatCode: string;
  email?: string;
  phone: string;
  website?: string;
  address?: string;
  industryId?: number;
  industryName?: string;
  nationalityId?: number;
  nationalityName?: string;
  description?: string;
  isActive: boolean;
}

// Frontend Contact Interface
export interface Contact {
  id: number;
  contactName: string;
  companyId?: number;
  companyName?: string;
  email: string;
  phone: string;
  gender?: string;
  nationalityId?: number;
  nationalityName?: string;
  leadSourceId?: number;
  leadSourceName?: string;
  levelId?: number;
  levelName?: string;
  description?: string;
  isActive: boolean;
}

// Utility categories Option Types
export interface ClientCategoryOption {
  id: number;
  name: string;
  code?: string;
}
