import { useQueryClient } from "@tanstack/react-query";
import type { Project, Unit } from "../types";

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

// 1. Hook to get Projects
export function useGetProjects(params: {
  Keyword?: string;
  IsActive?: boolean;
  SkipCount: number;
  MaxResultCount: number;
}) {
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
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppProjectCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Project/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 4. Toggle Project Active Status
export function useToggleProjectActive(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppProjectActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Project/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 5. Create or Update Unit Mutation
export function useCreateOrUpdateUnit(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppUnitCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Unit/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 6. Toggle Unit Active Status
export function useToggleUnitActive(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppUnitActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Unit/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}
