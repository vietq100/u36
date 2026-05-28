import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetApiServicesAppProjectGetListProjectUserPermission,
  usePostApiServicesAppProjectCreateOrUpdateProjectUser,
  useDeleteApiServicesAppProjectDeletePermission
} from "@/api/generated/project/project";
import { useGetApiServicesAppUserGetUsers } from "@/api/generated/user/user";

// 1. Hook to get all user permissions for a project
export function useGetProjectPermissions(params: {
  ProjectId?: number;
  Keyword?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}) {
  const query = useGetApiServicesAppProjectGetListProjectUserPermission(
    {
      ProjectId: params.ProjectId,
      Keyword: params.Keyword,
      SkipCount: params.SkipCount ?? 0,
      MaxResultCount: params.MaxResultCount ?? 100,
    },
    {
      query: {
        enabled: !!params.ProjectId,
      },
    }
  );

  return query;
}

// 2. Hook to create or update project user permissions
export function useCreateOrUpdateProjectPermission(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const mutation = usePostApiServicesAppProjectCreateOrUpdateProjectUser({
    mutation: {
      onSuccess: () => {
        // Invalidate list queries
        queryClient.invalidateQueries({
          queryKey: ["/api/services/app/Project/GetListProjectUserPermission"],
        });
        options?.onSuccess?.();
      },
    },
  });

  return mutation;
}

// 3. Hook to delete a project user permission
export function useDeleteProjectPermission(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const mutation = useDeleteApiServicesAppProjectDeletePermission({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["/api/services/app/Project/GetListProjectUserPermission"],
        });
        options?.onSuccess?.();
      },
    },
  });

  return mutation;
}

// 4. Hook to get list of users (to assign)
export function useGetAssignableUsers(keyword?: string) {
  const query = useGetApiServicesAppUserGetUsers({
    Keyword: keyword || undefined,
    IsActive: true,
    MaxResultCount: 200,
    SkipCount: 0,
  });

  return {
    ...query,
    data: query.data
      ? ((query.data as any)?.items || []).map((u: any) => ({
          id: u.id,
          name: u.displayName || `${u.surname || ""} ${u.name || ""}`.trim() || u.userName || `User #${u.id}`,
          email: u.emailAddress || "",
        }))
      : [],
  };
}
