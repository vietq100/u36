import { useQueryClient } from "@tanstack/react-query";
import type { Project, Unit, Floor } from "../types";

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

import {
  useGetApiServicesAppFloorGetFloorByProject,
  usePostApiServicesAppFloorCreateOrUpdate,
  usePostApiServicesAppFloorActive
} from "@/api/generated/floor/floor";

// DTO Mappers
const mapProjectDto = (dto: any): Project => {
  const addressObj = dto.projectAddress && dto.projectAddress.length > 0 ? dto.projectAddress[0] : null;
  return {
    id: dto.id || 0,
    projectName: dto.projectName || "",
    projectCode: dto.projectCode || "",
    numberOfFloors: dto.numberOfFloors || 0,
    numberOfUnits: dto.numberOfUnits || 0,
    description: dto.description || "",
    isActive: dto.isActive !== false,
    
    sortNumber: dto.sortNumber,
    landlordName: dto.landlordName || "",
    totalSize: dto.totalSize,
    builtDate: dto.builtDate,
    link: dto.link || "",
    budgetCode: dto.budgetCode || "",
    projectManagerName: dto.projectManagerName || "",

    // Lessor fields
    lessorAddress: dto.lessorAddress || "",
    lessorAddressVi: dto.lessorAddressVi || "",
    representativeOf: dto.representativeOf || "",
    representativeOfVi: dto.representativeOfVi || "",
    lessorPosition: dto.lessorPosition || "",
    lessorPositionVi: dto.lessorPositionVi || "",
    lessorCertificateName: dto.lessorCertificateName || "",
    lessorCertificateNameVi: dto.lessorCertificateNameVi || "",
    lessorCertificateNumber: dto.lessorCertificateNumber || "",
    lessorCertificateNumberVi: dto.lessorCertificateNumberVi || "",
    lessorCertificateIssuedBy: dto.lessorCertificateIssuedBy || "",
    lessorCertificateIssuedByVi: dto.lessorCertificateIssuedByVi || "",
    lessorCertificateIssuedDate: dto.lessorCertificateIssuedDate,
    registerAddress: dto.registerAddress || "",
    registerAddressVi: dto.registerAddressVi || "",

    // Representative fields
    representativeBy: dto.representativeBy || "",
    representativeByVi: dto.representativeByVi || "",
    representativePosition: dto.representativePosition || "",
    representativePositionVi: dto.representativePositionVi || "",
    representativeCertificateNumber: dto.representativeCertificateNumber || "",
    representativeCertificateNumberVi: dto.representativeCertificateNumberVi || "",
    representativeExecuteBy: dto.representativeExecuteBy || "",
    representativeExecuteByVi: dto.representativeExecuteByVi || "",
    representativeCertificateEffectiveDate: dto.representativeCertificateEffectiveDate,

    // Bank fields
    bankAccount: dto.bankAccount || "",
    bankName: dto.bankName || "",
    bankNameVi: dto.bankNameVi || "",
    bankAddress: dto.bankAddress || "",
    bankAddressVi: dto.bankAddressVi || "",

    // Bank fields 2
    optionalBankAccount: dto.optionalBankAccount || "",
    optionalBankName: dto.optionalBankName || "",
    optionalBankNameVi: dto.optionalBankNameVi || "",
    optionalBankAddress: dto.optionalBankAddress || "",
    optionalBankAddressVi: dto.optionalBankAddressVi || "",

    // Managing agent fields
    managingAgentCompany: dto.managingAgentCompany || "",
    managingAgentCompanyVi: dto.managingAgentCompanyVi || "",
    holderOf: dto.holderOf || "",
    holderOfVi: dto.holderOfVi || "",
    managingAgentCertificateNumber: dto.managingAgentCertificateNumber || "",
    managingAgentCertificateNumberVi: dto.managingAgentCertificateNumberVi || "",
    managingAgentCertificateIssuedDate: dto.managingAgentCertificateIssuedDate,
    managingAgentCertificateIssuedBy: dto.managingAgentCertificateIssuedBy || "",
    managingAgentCertificateIssuedByVi: dto.managingAgentCertificateIssuedByVi || "",

    // Parking fees
    motorbikeCost: dto.motorbikeCost,
    dedicatedCarCost: dto.dedicatedCarCost,
    petFees: dto.petFees,

    // Relations
    landlordId: dto.landlordId,
    propertyManagementId: dto.propertyManagementId,
    contactId: dto.contactId,
    projectFacilityIds: dto.projectFacilityMap ? dto.projectFacilityMap.map((f: any) => f.projectFacilityId || f.facilityId) : (dto.projectFacilityIds || []),
    projectTypeMap: dto.projectTypeMap || [],
    
    // Address mapping
    projectAddressText: addressObj ? addressObj.address || "" : "",
    projectAddressTextVi: addressObj ? addressObj.addressVi || "" : "",
    provinceId: addressObj ? addressObj.provinceId : undefined,
    districtId: addressObj ? addressObj.districtId : undefined,
  };
};

const mapUnitDto = (dto: any): Unit => ({
  id: dto.id || 0,
  unitName: dto.unitName || "",
  projectId: dto.projectId || 0,
  projectName: dto.projectName || "",
  floorId: dto.floorId || 0,
  floorName: dto.floorName || "",
  actualSize: dto.actualSize || 0,
  price: dto.price || 0,
  statusId: dto.statusId || 0,
  statusName: dto.status?.name || "Trống",
  statusColor: dto.status?.color || "#10b981",
  description: dto.description || "",
  isActive: dto.isActive !== false,

  productTypeId: dto.productTypeId,
  unitTypeId: dto.unitTypeId,
  balcony: dto.balcony,
  askingRent: dto.askingRent,
  facingId: dto.facingId,
  viewIds: dto.unitViewMap ? dto.unitViewMap.map((v: any) => v.viewId || v.id) : (dto.viewIds || []),
  unitFacilityIds: dto.unitFacilityMap ? dto.unitFacilityMap.map((f: any) => f.unitFacilityId || f.facilityId) : (dto.unitFacilityIds || []),
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

// 7. Get Project Floors
export function useGetProjectFloors(projectId?: number, options?: { enabled?: boolean }) {
  const query = useGetApiServicesAppFloorGetFloorByProject({
    projectId: projectId,
  }, {
    query: {
      enabled: options?.enabled !== false && !!projectId,
    }
  });

  return {
    ...query,
    data: query.data ? ((query.data as any) || []).map((dto: any) => ({
      id: dto.id || 0,
      floorName: dto.floorName || "",
      size: dto.size || 0,
      order: dto.order || 0,
      isActive: dto.isActive !== false,
      projectId: dto.projectId || 0,
      numberOfUnits: dto.numberOfUnits || 0,
    })) as Floor[] : undefined,
  };
}

// 8. Create or Update Floor Mutation
export function useCreateOrUpdateFloor(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppFloorCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Floor/GetFloorByProject"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 9. Toggle Floor Active Status
export function useToggleFloorActive(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppFloorActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Floor/GetFloorByProject"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

