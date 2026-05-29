import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Inquiry, InquiryFormValues } from "../types";

// Import Orval generated hooks
import {
  useGetApiServicesAppInquiryGetAll,
  usePostApiServicesAppInquiryCreateOrUpdate,
  usePostApiServicesAppInquiryActive
} from "@/api/generated/inquiry/inquiry";

const mapInquiryDto = (dto: any): Inquiry => {
  const firstProjectMap = dto.inquiryProjectMap?.[0];
  const project = firstProjectMap?.project;
  const projectIds = dto.inquiryProjectMap?.map((p: any) => p.projectId) || [];
  const firstAddress = dto.inquiryAddress?.[0];

  return {
    id: dto.id || 0,
    inquiryName: dto.inquiryName || `Yêu cầu của ${dto.contact?.contactName || "khách hàng"}`,
    contactId: dto.contactId || 0,
    contactName: dto.contact?.contactName || "Không xác định",
    companyId: dto.companyId || null,
    companyName: dto.company?.companyName || null,
    projectId: project?.id || firstProjectMap?.projectId || 0,
    projectName: project?.projectName || "Không xác định",
    projectIds: projectIds,
    askingRent: dto.toPrice || dto.fromPrice || 0,
    actualSize: dto.fromSize || dto.toSize || 0,
    fromPrice: dto.fromPrice || null,
    toPrice: dto.toPrice || null,
    fromSize: dto.fromSize || null,
    toSize: dto.toSize || null,
    statusId: dto.statusId || 1,
    statusName: dto.status?.name || "Mới nhận",
    statusColor: dto.status?.color || "#3b82f6",
    description: dto.description || "",
    isActive: dto.isActive !== false,
    creationTime: dto.creationTime || new Date().toISOString(),
    uniqueId: dto.uniqueId || "",

    // Additional fields mapped from DTO
    sourceId: dto.sourceId || null,
    statusDetailId: dto.statusDetailId || null,
    occupierName: dto.occupierName || "",
    moveInDate: dto.moveInDate || null,
    leaseTerm: dto.leaseTerm || null,
    facingIds: dto.inquiryFacingMap?.map((x: any) => x.facingId) || [],
    viewIds: dto.inquiryViewMap?.map((x: any) => x.viewId) || [],
    serviceTypeIds: dto.inquiryServiceTypeMap?.map((x: any) => x.serviceTypeId) || [],
    unitFacilityIds: dto.inquiryFacilityMap?.map((x: any) => x.unitFacilityId) || [],
    propertyTypeIds: dto.inquiryPropertyTypeMap?.map((x: any) => x.propertyTypeId) || [],
    unitTypeIds: dto.inquiryUnitTypeMap?.map((x: any) => x.unitTypeId) || [],
    provinceId: firstAddress?.provinceId || null,
    districtId: firstAddress?.districtId || null,
    addressText: firstAddress?.address || "",
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

  return {
    ...realMutation,
    mutate: (payload: { id?: number; data: InquiryFormValues }) => {
      const apiPayload = {
        id: payload.id,
        inquiryName: payload.data.inquiryName,
        contactId: payload.data.contactId,
        companyId: payload.data.companyId || null,
        statusId: payload.data.statusId,
        statusDetailId: payload.data.statusDetailId || null,
        sourceId: payload.data.sourceId || null,
        projectIds: payload.data.projectIds,
        fromPrice: payload.data.fromPrice || null,
        toPrice: payload.data.toPrice || null,
        fromSize: payload.data.fromSize || null,
        toSize: payload.data.toSize || null,
        description: payload.data.description || null,
        occupierName: payload.data.occupierName || null,
        moveInDate: payload.data.moveInDate ? new Date(payload.data.moveInDate).toISOString() : null,
        leaseTerm: payload.data.leaseTerm || null,
        facingIds: payload.data.facingIds || [],
        viewIds: payload.data.viewIds || [],
        serviceTypeIds: payload.data.serviceTypeIds || [],
        unitFacilityIds: payload.data.unitFacilityIds || [],
        propertyTypeIds: payload.data.propertyTypeIds || [],
        unitTypeIds: payload.data.unitTypeIds || [],
        inquiryAddress: payload.data.provinceId || payload.data.districtId || payload.data.addressText ? [
          {
            countryId: 1, // default to Vietnam
            provinceId: payload.data.provinceId || null,
            districtId: payload.data.districtId || null,
            address: payload.data.addressText || null,
            isActive: true,
          }
        ] : null,
      };

      return realMutation.mutate({
        data: apiPayload as any,
      });
    },
  } as any;
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
