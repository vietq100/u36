import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useClientsStore } from "../stores/useClientsStore";
import type { Company, Contact, CompanyFormValues, ContactFormValues } from "../types";

// Import Orval generated hooks
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
    vatCode: dto.vatCode || "",
    email: dto.email || "",
    phone: phone || "",
    website: dto.website || "",
    address: address || "",
    industryId: dto.industryId || undefined,
    industryName: dto.industry?.name || "",
    nationalityId: dto.nationalityId || undefined,
    nationalityName: dto.nationalityName || "",
    description: dto.description || "",
    isActive: dto.isActive !== false,
  };
};

// DTO Mappers for Contact
const mapContactDto = (dto: any): Contact => {
  const email = dto.contactEmail && dto.contactEmail.length > 0
    ? dto.contactEmail[0].email
    : "";
  const phone = dto.contactPhone && dto.contactPhone.length > 0
    ? dto.contactPhone[0].phone
    : "";

  return {
    id: dto.id || 0,
    contactName: dto.contactName || "Liên hệ không tên",
    companyId: dto.companyId || undefined,
    companyName: dto.company?.companyName || "",
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

const checkDemoMode = () => {
  const token = useAuthStore.getState().token;
  return !token || token === "fake-jwt-token";
};

// 1. Hook to get Companies
export function useGetCompanies(params: {
  Keyword?: string;
  IndustryId?: number;
  SkipCount: number;
  MaxResultCount: number;
}) {
  const isDemo = checkDemoMode();
  const storeCompanies = useClientsStore((state) => state.companies);

  if (isDemo) {
    let filtered = [...storeCompanies];
    if (params.Keyword) {
      const kw = params.Keyword.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.companyName.toLowerCase().includes(kw) ||
          c.vatCode.toLowerCase().includes(kw) ||
          (c.email?.toLowerCase().includes(kw) ?? false)
      );
    }
    if (params.IndustryId) {
      filtered = filtered.filter((c) => c.industryId === params.IndustryId);
    }

    const totalCount = filtered.length;
    const paginated = filtered.slice(params.SkipCount, params.SkipCount + params.MaxResultCount);

    return {
      data: {
        items: paginated,
        totalCount,
      },
      isLoading: false,
      isSuccess: true,
      refetch: () => {},
    };
  }

  // Use real backend hook
  const query = useGetApiServicesAppCompanyGetAll({
    Keyword: params.Keyword,
    IndustryId: params.IndustryId,
    SkipCount: params.SkipCount,
    MaxResultCount: params.MaxResultCount,
  });

  return {
    ...query,
    data: query.data ? {
      items: ((query.data as any).items || []).map(mapCompanyDto),
      totalCount: (query.data as any).totalCount || 0,
    } : undefined,
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
  const isDemo = checkDemoMode();
  const storeContacts = useClientsStore((state) => state.contacts);

  if (isDemo) {
    let filtered = [...storeContacts];
    if (params.Keyword) {
      const kw = params.Keyword.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.contactName.toLowerCase().includes(kw) ||
          c.email.toLowerCase().includes(kw) ||
          c.phone.toLowerCase().includes(kw)
      );
    }
    if (params.CompanyId) {
      filtered = filtered.filter((c) => c.companyId === params.CompanyId);
    }
    if (params.LeadSourceId) {
      filtered = filtered.filter((c) => c.leadSourceId === params.LeadSourceId);
    }

    const totalCount = filtered.length;
    const paginated = filtered.slice(params.SkipCount, params.SkipCount + params.MaxResultCount);

    return {
      data: {
        items: paginated,
        totalCount,
      },
      isLoading: false,
      isSuccess: true,
      refetch: () => {},
    };
  }

  // Use real backend hook
  const query = useGetApiServicesAppContactGetAll({
    Keyword: params.Keyword,
    CompanyId: params.CompanyId,
    SkipCount: params.SkipCount,
    MaxResultCount: params.MaxResultCount,
  });

  return {
    ...query,
    data: query.data ? {
      items: ((query.data as any).items || []).map(mapContactDto),
      totalCount: (query.data as any).totalCount || 0,
    } : undefined,
  };
}

// 3. Create or Update Company Mutation
export function useCreateOrUpdateCompany(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const queryClient = useQueryClient();
  const addCompany = useClientsStore((state) => state.addCompany);
  const updateCompany = useClientsStore((state) => state.updateCompany);

  const realMutation = usePostApiServicesAppCompanyCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Company/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  const mockMutation = useMutation({
    mutationFn: async (variables: { id?: number; data: CompanyFormValues }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (variables.id) {
        updateCompany(variables.id, variables.data);
      } else {
        addCompany(variables.data);
      }
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (realMutation as any);
}

// 4. Toggle Company Active Status
export function useToggleCompanyActive(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const queryClient = useQueryClient();
  const toggleCompany = useClientsStore((state) => state.toggleCompanyActive);

  const realMutation = usePostApiServicesAppCompanyActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Company/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  const mockMutation = useMutation({
    mutationFn: async (id: number) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      toggleCompany(id);
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (realMutation as any);
}

// 5. Create or Update Contact Mutation
export function useCreateOrUpdateContact(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const queryClient = useQueryClient();
  const addContact = useClientsStore((state) => state.addContact);
  const updateContact = useClientsStore((state) => state.updateContact);

  const realMutation = usePostApiServicesAppContactCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Contact/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  const mockMutation = useMutation({
    mutationFn: async (variables: { id?: number; data: ContactFormValues }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (variables.id) {
        updateContact(variables.id, variables.data);
      } else {
        addContact(variables.data);
      }
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (realMutation as any);
}

// 6. Toggle Contact Active Status
export function useToggleContactActive(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const queryClient = useQueryClient();
  const toggleContact = useClientsStore((state) => state.toggleContactActive);

  const realMutation = usePostApiServicesAppContactActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Contact/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  const mockMutation = useMutation({
    mutationFn: async (id: number) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      toggleContact(id);
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (realMutation as any);
}
