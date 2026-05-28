import { useQueryClient } from "@tanstack/react-query";
import type { Tenant } from "../types";

import {
  useGetApiServicesAppUserTenantGetAll,
  usePostApiServicesAppUserTenantCreateOrUpdate,
  usePostApiServicesAppUserTenantActive,
} from "@/api/generated/user-tenant/user-tenant";

import { useGetApiServicesAppCategoryGetListCountry } from "@/api/generated/category/category";

// DTO Mapper
const mapTenantDto = (dto: any): Tenant => ({
  id: dto.id || 0,
  gender: dto.gender || "MALE",
  uniqueId: dto.uniqueId || "",
  name: dto.name || "Khách thuê không tên",
  phone: dto.phone || "",
  passport: dto.passport || "",
  emailAddress: dto.emailAddress || "",
  isActive: dto.isActive !== false,
  nationalityId: dto.nationalityId || undefined,
  nationalityName: dto.nationalityName || "",
});

// 1. Hook to get all tenants
export function useGetTenants(params: {
  Keyword?: string;
  SkipCount: number;
  MaxResultCount: number;
}) {
  const query = useGetApiServicesAppUserTenantGetAll({
    Keyword: params.Keyword,
    SkipCount: params.SkipCount,
    MaxResultCount: params.MaxResultCount,
  });

  return {
    ...query,
    data: query.data
      ? {
          items: ((query.data as any).items || []).map(mapTenantDto),
          totalCount: (query.data as any).totalCount || 0,
        }
      : undefined,
  };
}

// 2. Create or Update Tenant mutation
export function useCreateOrUpdateTenant(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppUserTenantCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/UserTenant/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 3. Toggle Tenant active state
export function useToggleTenantActive(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const realMutation = usePostApiServicesAppUserTenantActive({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/UserTenant/GetAll"] });
        options?.onSuccess?.();
      },
    },
  });

  return realMutation as any;
}

// 4. Get Countries (Nationalities)
export function useGetCountries() {
  const query = useGetApiServicesAppCategoryGetListCountry();
  return {
    ...query,
    data: query.data
      ? ((query.data as any) || []).map((c: any) => ({
          id: c.id,
          name: c.name || c.countryName || "",
        }))
      : [],
  };
}
