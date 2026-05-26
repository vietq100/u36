import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useContractsStore } from "../stores/useContractsStore";
import type { LeaseContract, ContractFormValues } from "../types";

// Import Orval generated hooks
import {
  useGetApiServicesAppLeaseAgreementGetAll,
  usePostApiServicesAppLeaseAgreementCreateOrUpdate,
  usePostApiServicesAppLeaseAgreementActive
} from "@/api/generated/lease-agreement/lease-agreement";

const checkDemoMode = () => {
  const token = useAuthStore.getState().token;
  return !token || token === "fake-jwt-token";
};

const mapLeaseContractDto = (dto: any): LeaseContract => {
  const firstUnit = dto.leaseAgreementUnit && dto.leaseAgreementUnit.length > 0 ? dto.leaseAgreementUnit[0] : null;
  return {
    id: dto.id || 0,
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
  const isDemo = checkDemoMode();
  const storeContracts = useContractsStore((state) => state.contracts);

  if (isDemo) {
    let filtered = [...storeContracts];
    if (params.Keyword) {
      const kw = params.Keyword.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.referenceNumber.toLowerCase().includes(kw) ||
          c.contactName.toLowerCase().includes(kw) ||
          (c.companyName?.toLowerCase().includes(kw) ?? false)
      );
    }
    if (params.ProjectId) {
      filtered = filtered.filter((c) => c.projectId === params.ProjectId);
    }
    if (params.CompanyId) {
      filtered = filtered.filter((c) => c.companyId === params.CompanyId);
    }
    if (params.StatusId) {
      filtered = filtered.filter((c) => c.statusId === params.StatusId);
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
  const query = useGetApiServicesAppLeaseAgreementGetAll({
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
      items: ((query.data as any).items || []).map(mapLeaseContractDto),
      totalCount: (query.data as any).totalCount || 0,
    } : undefined,
  };
}

// 2. Create or Update Contract Mutation
export function useCreateOrUpdateContract(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const queryClient = useQueryClient();
  const addContract = useContractsStore((state) => state.addContract);
  const updateContract = useContractsStore((state) => state.updateContract);

  const realMutation = usePostApiServicesAppLeaseAgreementCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/LeaseAgreement/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  const mockMutation = useMutation({
    mutationFn: async (variables: { id?: number; data: ContractFormValues }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (variables.id) {
        updateContract(variables.id, variables.data as any);
      } else {
        addContract(variables.data as any);
      }
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (realMutation as any);
}

// 3. Toggle Contract Active Status (or Active flag)
export function useToggleContractActive(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const queryClient = useQueryClient();
  const toggleContract = useContractsStore((state) => state.toggleContractActive);

  const realMutation = usePostApiServicesAppLeaseAgreementActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/LeaseAgreement/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  const mockMutation = useMutation({
    mutationFn: async (id: number) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      toggleContract(id);
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (realMutation as any);
}

// 4. Delete/Remove Contract
export function useDeleteContract(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const deleteContract = useContractsStore((state) => state.deleteContract);

  const mockMutation = useMutation({
    mutationFn: async (id: number) => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      deleteContract(id);
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (mockMutation as any); // Delete endpoint fallback
}
