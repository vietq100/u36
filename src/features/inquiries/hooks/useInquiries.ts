import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useInquiriesStore } from "../stores/useInquiriesStore";
import type { Inquiry, InquiryFormValues } from "../types";

// Import Orval generated hooks
import {
  useGetApiServicesAppInquiryGetAll,
  usePostApiServicesAppInquiryCreateOrUpdate,
  usePostApiServicesAppInquiryActive
} from "@/api/generated/inquiry/inquiry";

const checkDemoMode = () => {
  const token = useAuthStore.getState().token;
  return !token || token === "fake-jwt-token";
};

const mapInquiryDto = (dto: any): Inquiry => {
  return {
    id: dto.id || 0,
    contactId: dto.contactId || 0,
    contactName: dto.contact?.contactName || "Không xác định",
    companyId: dto.companyId || null,
    companyName: dto.company?.companyName || null,
    projectId: dto.projectId || 0,
    projectName: dto.project?.projectName || "Không xác định",
    askingRent: dto.askingRent || 0,
    actualSize: dto.actualSize || 0,
    statusId: dto.statusId || 1,
    statusName: dto.status?.name || "Mới nhận",
    statusColor: dto.status?.color || "#3b82f6",
    description: dto.description || "",
    isActive: dto.isActive !== false,
    creationTime: dto.creationTime || new Date().toISOString(),
  };
};

// 1. Hook to get inquiries list
export function useGetInquiries(params: {
  Keyword?: string;
  ProjectId?: number;
  CompanyId?: number;
  StatusId?: number;
  SkipCount: number;
  MaxResultCount: number;
}) {
  const isDemo = checkDemoMode();
  const storeInquiries = useInquiriesStore((state) => state.inquiries);

  if (isDemo) {
    let filtered = [...storeInquiries];
    if (params.Keyword) {
      const kw = params.Keyword.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.contactName.toLowerCase().includes(kw) ||
          (i.companyName?.toLowerCase().includes(kw) ?? false) ||
          (i.description?.toLowerCase().includes(kw) ?? false)
      );
    }
    if (params.ProjectId) {
      filtered = filtered.filter((i) => i.projectId === params.ProjectId);
    }
    if (params.CompanyId) {
      filtered = filtered.filter((i) => i.companyId === params.CompanyId);
    }
    if (params.StatusId) {
      filtered = filtered.filter((i) => i.statusId === params.StatusId);
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
  const query = useGetApiServicesAppInquiryGetAll({
    Keyword: params.Keyword,
    ProjectId: params.ProjectId,
    CompanyId: params.CompanyId,
    StatusId: params.StatusId,
    SkipCount: params.SkipCount,
    MaxResultCount: params.MaxResultCount,
  });

  return {
    ...query,
    data: query.data ? {
      items: ((query.data as any).items || []).map(mapInquiryDto),
      totalCount: (query.data as any).totalCount || 0,
    } : undefined,
  };
}

// 2. Create or Update Inquiry Mutation
export function useCreateOrUpdateInquiry(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const queryClient = useQueryClient();
  const addInquiry = useInquiriesStore((state) => state.addInquiry);
  const updateInquiry = useInquiriesStore((state) => state.updateInquiry);

  const realMutation = usePostApiServicesAppInquiryCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Inquiry/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  const mockMutation = useMutation({
    mutationFn: async (variables: { id?: number; data: InquiryFormValues }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (variables.id) {
        updateInquiry(variables.id, variables.data as any);
      } else {
        addInquiry(variables.data as any);
      }
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (realMutation as any);
}

// 3. Toggle Inquiry Active Status (or Active flag)
export function useToggleInquiryActive(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const queryClient = useQueryClient();
  const toggleInquiry = useInquiriesStore((state) => state.toggleInquiryActive);

  const realMutation = usePostApiServicesAppInquiryActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Inquiry/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  const mockMutation = useMutation({
    mutationFn: async (id: number) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      toggleInquiry(id);
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (realMutation as any);
}

// 4. Delete Inquiry
export function useDeleteInquiry(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const deleteInquiry = useInquiriesStore((state) => state.deleteInquiry);

  const mockMutation = useMutation({
    mutationFn: async (id: number) => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      deleteInquiry(id);
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (mockMutation as any);
}
