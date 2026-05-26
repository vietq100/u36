import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { usePropertiesStore } from "../stores/usePropertiesStore";
import type { Project, Unit, ProjectFormValues, UnitFormValues } from "../types";

// Import Orval generated hooks
import { 
  useGetApiServicesAppProjectGetAll,
  usePostApiServicesAppProjectCreateOrUpdate,
  usePostApiServicesAppProjectActive
} from "@/api/generated/project/project";

import {
  useGetApiServicesAppUnitGetAll,
  usePostApiServicesAppUnitCreateOrUpdate,
  usePostApiServicesAppUnitActive
} from "@/api/generated/unit/unit";

// DTO Mappers
const mapProjectDto = (dto: any): Project => ({
  id: dto.id || 0,
  projectName: dto.projectName || "",
  projectCode: dto.projectCode || "",
  numberOfFloors: dto.numberOfFloors || 0,
  numberOfUnits: dto.numberOfUnits || 0,
  description: dto.description || "",
  isActive: dto.isActive !== false,
});

const mapUnitDto = (dto: any): Unit => ({
  id: dto.id || 0,
  unitName: dto.unitName || "",
  projectId: dto.projectId || 0,
  projectName: dto.projectName || "",
  floorName: dto.floorName || "",
  actualSize: dto.actualSize || 0,
  price: dto.price || 0,
  statusId: dto.statusId || 0,
  statusName: dto.status?.name || "Trống",
  statusColor: dto.status?.color || "#10b981",
  description: dto.description || "",
  isActive: dto.isActive !== false,
});

// Helper to determine if we are in demo mode
const checkDemoMode = () => {
  const token = useAuthStore.getState().token;
  return !token || token === "fake-jwt-token";
};

// 1. Hook to get Projects
export function useGetProjects(params: {
  Keyword?: string;
  IsActive?: boolean;
  SkipCount: number;
  MaxResultCount: number;
}) {
  const isDemo = checkDemoMode();
  const storeProjects = usePropertiesStore((state) => state.projects);

  if (isDemo) {
    // Filter locally in store
    let filtered = [...storeProjects];
    if (params.Keyword) {
      const kw = params.Keyword.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.projectName.toLowerCase().includes(kw) ||
          p.projectCode.toLowerCase().includes(kw)
      );
    }
    if (params.IsActive !== undefined) {
      filtered = filtered.filter((p) => p.isActive === params.IsActive);
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
  const query = useGetApiServicesAppProjectGetAll({
    Keyword: params.Keyword,
    IsActive: params.IsActive,
    SkipCount: params.SkipCount,
    MaxResultCount: params.MaxResultCount,
  });

  return {
    ...query,
    data: query.data ? {
      items: ((query.data as any).items || []).map(mapProjectDto),
      totalCount: (query.data as any).totalCount || 0,
    } : undefined,
  };
}

// 2. Hook to get Units
export function useGetUnits(params: {
  Keyword?: string;
  ProjectId?: number;
  UnitStatusId?: number;
  SkipCount: number;
  MaxResultCount: number;
}) {
  const isDemo = checkDemoMode();
  const storeUnits = usePropertiesStore((state) => state.units);

  if (isDemo) {
    let filtered = [...storeUnits];
    if (params.Keyword) {
      const kw = params.Keyword.toLowerCase();
      filtered = filtered.filter((u) => u.unitName.toLowerCase().includes(kw));
    }
    if (params.ProjectId) {
      filtered = filtered.filter((u) => u.projectId === params.ProjectId);
    }
    if (params.UnitStatusId) {
      filtered = filtered.filter((u) => u.statusId === params.UnitStatusId);
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
  const query = useGetApiServicesAppUnitGetAll({
    Keyword: params.Keyword,
    ProjectId: params.ProjectId,
    UnitStatusId: params.UnitStatusId,
    SkipCount: params.SkipCount,
    MaxResultCount: params.MaxResultCount,
  });

  return {
    ...query,
    data: query.data ? {
      items: ((query.data as any).items || []).map(mapUnitDto),
      totalCount: (query.data as any).totalCount || 0,
    } : undefined,
  };
}

// 3. Create or Update Project Mutation
export function useCreateOrUpdateProject(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const queryClient = useQueryClient();
  const addProject = usePropertiesStore((state) => state.addProject);
  const updateProject = usePropertiesStore((state) => state.updateProject);

  const realMutation = usePostApiServicesAppProjectCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Project/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  // Mock mutation for demo mode
  const mockMutation = useMutation({
    mutationFn: async (variables: { id?: number; data: ProjectFormValues }) => {
      // simulate delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (variables.id) {
        updateProject(variables.id, variables.data);
      } else {
        addProject(variables.data);
      }
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (realMutation as any);
}

// 4. Toggle Project Active Status
export function useToggleProjectActive(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const queryClient = useQueryClient();
  const toggleProject = usePropertiesStore((state) => state.toggleProjectActive);

  const realMutation = usePostApiServicesAppProjectActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Project/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  const mockMutation = useMutation({
    mutationFn: async (id: number) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      toggleProject(id);
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (realMutation as any);
}

// 5. Create or Update Unit Mutation
export function useCreateOrUpdateUnit(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const queryClient = useQueryClient();
  const addUnit = usePropertiesStore((state) => state.addUnit);
  const updateUnit = usePropertiesStore((state) => state.updateUnit);

  const realMutation = usePostApiServicesAppUnitCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Unit/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  const mockMutation = useMutation({
    mutationFn: async (variables: { id?: number; data: UnitFormValues }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (variables.id) {
        updateUnit(variables.id, variables.data);
      } else {
        addUnit(variables.data);
      }
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (realMutation as any);
}

// 6. Toggle Unit Active Status
export function useToggleUnitActive(options?: { onSuccess?: () => void }) {
  const isDemo = checkDemoMode();
  const queryClient = useQueryClient();
  const toggleUnit = usePropertiesStore((state) => state.toggleUnitActive);

  const realMutation = usePostApiServicesAppUnitActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Unit/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  const mockMutation = useMutation({
    mutationFn: async (id: number) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      toggleUnit(id);
      return {};
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
  });

  return isDemo ? mockMutation : (realMutation as any);
}
