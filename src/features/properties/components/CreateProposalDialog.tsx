import { useEffect } from "react";
import { toast } from "sonner";
import { DetailDialog } from "@/components/shared/dialogs/DetailDialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { useGetInquiries } from "@/features/inquiries/hooks/useInquiries";
import { useGetUnits } from "../hooks/useProperties";
import { usePostApiServicesAppInquiryProposalCreateOrUpdate } from "@/api/generated/inquiry-proposal/inquiry-proposal";

interface CreateProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  projectName?: string;
  onSuccess?: () => void;
}

export function CreateProposalDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  onSuccess,
}: CreateProposalDialogProps) {
  const form = useForm({
    defaultValues: {
      title: "",
      inquiryId: "",
      unitId: "",
    },
  });

  // Fetch inquiries for dropdown
  const { data: inquiriesData, isLoading: isInquiriesLoading } = useGetInquiries({
    MaxResultCount: 200,
    SkipCount: 0,
  });

  const inquiryOptions = ((inquiriesData as any)?.items || []).map((i: any) => ({
    value: i.id,
    label: `${i.contactName || "Khách lẻ"} - Yêu cầu: ${i.actualSize}m² (Ngân sách: $${i.askingRent})`,
  }));

  // Fetch units in this project
  const { data: unitsData, isLoading: isUnitsLoading } = useGetUnits({
    ProjectId: projectId,
    MaxResultCount: 200,
    SkipCount: 0,
    UnitStatusId: 1, // Vacant / Available units only
  });

  const unitOptions = ((unitsData as any)?.items || []).map((u: any) => ({
    value: u.id,
    label: `${u.unitName} - Tầng ${u.floorName} (Diện tích: ${u.actualSize}m² - Giá: $${u.price})`,
  }));

  // Mutation to create proposal
  const mutation = usePostApiServicesAppInquiryProposalCreateOrUpdate({
    mutation: {
      onSuccess: () => {
        toast.success("Tạo đề xuất cho thuê thành công!");
        onSuccess?.();
        onOpenChange(false);
      },
    },
  });

  // Automatically generate proposal title
  const watchedInquiryId = form.watch("inquiryId");
  const watchedUnitId = form.watch("unitId");

  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        inquiryId: "",
        unitId: "",
      });
    }
  }, [open, form]);

  useEffect(() => {
    if (watchedInquiryId && watchedUnitId) {
      const selectedInquiry = (inquiriesData?.items || []).find((i: any) => i.id === Number(watchedInquiryId));
      const selectedUnit = (unitsData?.items || []).find((u: any) => u.id === Number(watchedUnitId));
      if (selectedInquiry && selectedUnit) {
        form.setValue(
          "title",
          `Đề xuất Cho thuê - ${selectedUnit.unitName} - Khách: ${selectedInquiry.contactName || "Khách lẻ"}`,
          { shouldDirty: true }
        );
      }
    }
  }, [watchedInquiryId, watchedUnitId, inquiriesData, unitsData, form]);

  const handleSubmit = (values: any) => {
    if (!values.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề đề xuất");
      return;
    }
    if (!values.inquiryId) {
      toast.error("Vui lòng chọn Yêu cầu hỗ trợ");
      return;
    }
    if (!values.unitId) {
      toast.error("Vui lòng chọn Căn hộ / Mặt bằng");
      return;
    }

    mutation.mutate({
      data: {
        title: values.title,
        inquiryId: Number(values.inquiryId),
        unitIds: [Number(values.unitId)],
        projectIds: [projectId],
        templateId: 1, // Default template
        proposalType: 1,
      },
    });
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Tạo Đề xuất Cho thuê - ${projectName || "Dự án"}`}
      description="Tạo bảng đề xuất báo giá cho thuê căn hộ/mặt bằng gửi đến khách hàng tiềm năng."
      formId="create-proposal-form"
      isPending={mutation.isPending}
    >
      <Form {...form}>
        <form id="create-proposal-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
          {/* Select Inquiry */}
          <FormSelect
            control={form.control}
            name="inquiryId"
            label="Chọn Yêu cầu hỗ trợ (Inquiry) *"
            options={inquiryOptions}
            placeholder={isInquiriesLoading ? "Đang tải danh sách..." : "Chọn yêu cầu từ khách..."}
            emptyMessage="Không tìm thấy yêu cầu nào"
          />

          {/* Select Unit */}
          <FormSelect
            control={form.control}
            name="unitId"
            label="Chọn Căn hộ / Mặt bằng (Trống) *"
            options={unitOptions}
            placeholder={isUnitsLoading ? "Đang tải danh sách..." : "Chọn mặt bằng dự án..."}
            emptyMessage="Không có mặt bằng trống nào trong dự án này"
          />

          {/* Proposal Title */}
          <FormInput
            control={form.control}
            name="title"
            label="Tiêu đề Đề xuất *"
            placeholder="Nhập tiêu đề bản đề xuất..."
            required
            disabled={mutation.isPending}
          />
        </form>
      </Form>
    </DetailDialog>
  );
}
