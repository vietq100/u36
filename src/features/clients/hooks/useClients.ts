import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Company, Contact } from "../types";

import {
  useGetApiServicesAppCompanyGetAll,
  usePostApiServicesAppCompanyCreateOrUpdate,
  usePostApiServicesAppCompanyActive
} from "@/api/generated/company/company";

import {
  useGetApiServicesAppContactGetAll,
  usePostApiServicesAppContactCreateOrUpdate,
  usePostApiServicesAppContactActive
} from "@/api/generated/contact/contact";

// DTO Mappers for Company
const mapCompanyDto = (dto: any): Company => {
  // Get first address and phone from array if available
  const address = dto.companyAddress && dto.companyAddress.length > 0
    ? dto.companyAddress[0].address
    : "";
  const phone = dto.companyPhone && dto.companyPhone.length > 0
    ? dto.companyPhone[0].phone
    : "";

  return {
    id: dto.id || 0,
    companyName: dto.legalName || dto.businessName || "Doanh nghiệp không tên",
    industryId: dto.industryId || undefined,
    industryName: dto.industry?.name || "",
    vatCode: dto.vatCode || "",
    address,
    phone,
    email: dto.email || "",
    isActive: dto.isActive !== false,
  };
};

const mapContactDto = (dto: any): Contact => {
  // Get first phone and email from array if available
  const phone = dto.contactPhone && dto.contactPhone.length > 0
    ? dto.contactPhone[0].phone
    : "";
  const email = dto.contactEmail && dto.contactEmail.length > 0
    ? dto.contactEmail[0].email
    : "";

  return {
    id: dto.id || 0,
    companyId: dto.companyId || 0,
    companyName: dto.company?.legalName || dto.company?.businessName || "",
    contactName: dto.name || "",
    email: email || "",
    phone: phone || "",
    gender: dto.gender || "MALE",
    nationalityId: dto.nationalityId || undefined,
    nationalityName: dto.nationalityName || "",
    leadSourceId: dto.leadSourceId || undefined,
    leadSourceName: dto.leadSource?.name || "",
    levelId: dto.levelId || undefined,
    levelName: dto.level?.name || "",
    description: dto.description || "",
    isActive: dto.isActive !== false,
  };
};

// 1. Hook to get Companies
export function useGetCompanies(params: {
  Keyword?: string;
  IndustryId?: number;
  SkipCount: number;
  MaxResultCount: number;
}) {
  const query = useGetApiServicesAppCompanyGetAll({
    Keyword: params.Keyword,
    IndustryId: params.IndustryId,
    SkipCount: params.SkipCount,
    MaxResultCount: params.MaxResultCount,
  });

  const mappedData = useMemo(() => {
    return query.data ? {
      items: ((query.data as any).items || []).map(mapCompanyDto),
      totalCount: (query.data as any).totalCount || 0,
    } : undefined;
  }, [query.data]);

  return {
    ...query,
    data: mappedData,
  };
}

// 2. Hook to get Contacts
export function useGetContacts(params: {
  Keyword?: string;
  CompanyId?: number;
  LeadSourceId?: number;
  SkipCount: number;
  MaxResultCount: number;
}) {
  const query = useGetApiServicesAppContactGetAll({
    Keyword: params.Keyword,
    CompanyId: params.CompanyId,
    SkipCount: params.SkipCount,
    MaxResultCount: params.MaxResultCount,
  });

  const mappedData = useMemo(() => {
    return query.data ? {
      items: ((query.data as any).items || []).map(mapContactDto),
      totalCount: (query.data as any).totalCount || 0,
    } : undefined;
  }, [query.data]);

  return {
    ...query,
    data: mappedData,
  };
}

// 3. Create or Update Company Mutation
export function useCreateOrUpdateCompany(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppCompanyCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Company/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 4. Toggle Company Active Status
export function useToggleCompanyActive(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppCompanyActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Company/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 5. Create or Update Contact Mutation
export function useCreateOrUpdateContact(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppContactCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Contact/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 6. Toggle Contact Active Status
export function useToggleContactActive(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppContactActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Contact/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}
