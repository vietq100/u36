import { useQueryClient, useMutation } from "@tanstack/react-query";
import { 
  useGetApiServicesAppDocumentsGetDocuments,
  useDeleteApiServicesAppDocumentsDelete
} from "@/api/generated/documents/documents";
import { useGetApiServicesAppCategoryGetListDocumentType } from "@/api/generated/category/category";

// 1. Hook to get all documents for a module inputId
export function useGetDocuments(params: {
  inputId?: string;
}) {
  const query = useGetApiServicesAppDocumentsGetDocuments({
    uniqueId: params.inputId,
  }, {
    query: {
      enabled: !!params.inputId,
    }
  });

  return query;
}

import { customInstance } from "@/api/client/axiosInstance";

// 2. Upload mutation for Project document using custom axios direct call
export function useUploadProjectDocument(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
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
        `/api/Documents/UploadProjectDocument?${queryParams.toString()}`,
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

  return mutation;
}

// 3. Delete mutation for any document
export function useDeleteDocument(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const mutation = useDeleteApiServicesAppDocumentsDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Documents/GetDocuments"] });
        options?.onSuccess?.();
      },
    }
  });

  return mutation;
}

// 4. Get Document Types
export function useGetDocumentTypes() {
  const query = useGetApiServicesAppCategoryGetListDocumentType();
  return {
    ...query,
    data: query.data
      ? ((query.data as any) || []).map((t: any) => ({
          id: t.id,
          name: t.name || t.documentTypeName || "",
        }))
      : [],
  };
}
