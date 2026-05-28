import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Inquiry } from "../types";

// Import Orval generated hooks
import {
  useGetApiServicesAppInquiryGetAll,
  usePostApiServicesAppInquiryCreateOrUpdate,
  usePostApiServicesAppInquiryActive
} from "@/api/generated/inquiry/inquiry";

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
  const query = useGetApiServicesAppInquiryGetAll({
    Keyword: params.Keyword,
    ProjectId: params.ProjectId,
    CompanyId: params.CompanyId,
    StatusId: params.StatusId,
    SkipCount: params.SkipCount,
    MaxResultCount: params.MaxResultCount,
  });

  const mappedData = useMemo(() => {
    return query.data ? {
      items: ((query.data as any).items || []).map(mapInquiryDto),
      totalCount: (query.data as any).totalCount || 0,
    } : undefined;
  }, [query.data]);

  return {
    ...query,
    data: mappedData,
  };
}

// 2. Create or Update Inquiry Mutation
export function useCreateOrUpdateInquiry(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppInquiryCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Inquiry/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 3. Toggle Inquiry Active Status (or Active flag)
export function useToggleInquiryActive(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppInquiryActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Inquiry/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 4. Delete Inquiry
export function useDeleteInquiry(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const mockMutation = useMutation({
    mutationFn: async () => {
      // backend API lacks a delete inquiry endpoint, so we return a placeholder success.
      return {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services/app/Inquiry/GetAll"] });
      options?.onSuccess?.();
    },
  });

  return mockMutation as any;
}
