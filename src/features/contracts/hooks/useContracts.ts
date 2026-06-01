import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LeaseContract } from "../types";
import { customInstance } from "@/api/client/axiosInstance";

// Import Orval generated hooks
import {
  useGetApiServicesAppLeaseAgreementGetAll,
  usePostApiServicesAppLeaseAgreementCreateOrUpdate,
  usePostApiServicesAppLeaseAgreementActive
} from "@/api/generated/lease-agreement/lease-agreement";

const mapLeaseContractDto = (dto: any): LeaseContract => {
  const firstUnit = dto.leaseAgreementUnit && dto.leaseAgreementUnit.length > 0 ? dto.leaseAgreementUnit[0] : null;
  return {
    id: dto.id || 0,
    uniqueId: dto.uniqueId || "",
    referenceNumber: dto.referenceNumber || "",
    companyId: dto.companyId || null,
    companyName: dto.company?.companyName || null,
    contactId: dto.contactId || 0,
    contactName: dto.contact?.contactName || "Không xác định",
    unitId: firstUnit ? firstUnit.unitId : 0,
    unitName: firstUnit?.unit?.unitName || "N/A",
    projectId: firstUnit?.unit?.projectId || 0,
    projectName: firstUnit?.unit?.projectName || "N/A",
    commencementDate: dto.commencementDate ? dto.commencementDate.split("T")[0] : "",
    expiryDate: dto.expiryDate ? dto.expiryDate.split("T")[0] : "",
    depositAmount: dto.depositAmount || 0,
    contractAmount: dto.contractAmount || 0,
    statusId: dto.statusId || 1,
    statusName: dto.status?.name || "Bản nháp",
    statusColor: dto.status?.color || "#64748b",
    description: dto.description || "",
    isActive: dto.isActive !== false,
    creationTime: dto.creationTime || new Date().toISOString(),
  };
};

// 1. Hook to get contracts list
export function useGetContracts(params: {
  Keyword?: string;
  ProjectId?: number;
  CompanyId?: number;
  StatusId?: number;
  SkipCount: number;
  MaxResultCount: number;
}) {
  const query = useGetApiServicesAppLeaseAgreementGetAll({
    Keyword: params.Keyword,
    ProjectId: params.ProjectId,
    CompanyId: params.CompanyId,
    StatusId: params.StatusId,
    SkipCount: params.SkipCount,
    MaxResultCount: params.MaxResultCount,
  });

  const mappedData = useMemo(() => {
    return query.data ? {
      items: ((query.data as any).items || []).map(mapLeaseContractDto),
      totalCount: (query.data as any).totalCount || 0,
    } : undefined;
  }, [query.data]);

  return {
    ...query,
    data: mappedData,
  };
}

// 2. Create or Update Contract Mutation
export function useCreateOrUpdateContract(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppLeaseAgreementCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/LeaseAgreement/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 3. Toggle Contract Active Status (or Active flag)
export function useToggleContractActive(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppLeaseAgreementActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/LeaseAgreement/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 4. Delete/Remove Contract
export function useDeleteContract(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const mockMutation = useMutation({
    mutationFn: async () => {
      // backend API lacks a delete agreement endpoint, so we return a placeholder success.
      return {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services/app/LeaseAgreement/GetAll"] });
      options?.onSuccess?.();
    },
  });

  return mockMutation as any;
}

// 5. Upload mutation for Contract documents
export function useUploadContractDocument(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      params: {
        UniqueId: string;
        DocumentName?: string;
        DocumentTypeId?: number;
        UploadDate?: string;
      };
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("file", payload.file);

      const queryParams = new URLSearchParams();
      Object.entries(payload.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await customInstance.post(
        `/api/Documents/UploadContracts?${queryParams.toString()}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services/app/Documents/GetDocuments"] });
      options?.onSuccess?.();
    },
  });
}
