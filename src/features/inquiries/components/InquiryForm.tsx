import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DetailDialog } from "@/components/shared/DetailDialog";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormCombobox } from "@/components/shared/forms/FormCombobox";
import { FormRichTextEditor } from "@/components/shared/forms/FormRichTextEditor";
import { FormSelect } from "@/components/shared/forms/FormSelect";

import { useCreateOrUpdateInquiry } from "../hooks/useInquiries";
import { useInquiriesStore } from "../stores/useInquiriesStore";
import { usePropertiesStore } from "@/features/properties/stores/usePropertiesStore";
import { useClientsStore } from "@/features/clients/stores/useClientsStore";
import { inquirySchema } from "../types";
import type { Inquiry, InquiryFormValues } from "../types";

interface InquiryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry?: Inquiry | null;
  onSuccess?: () => void;
}

export function InquiryForm({ open, onOpenChange, inquiry, onSuccess }: InquiryFormProps) {
  const statuses = useInquiriesStore((state) => state.statuses);
  const rawProjects = usePropertiesStore((state) => state.projects);
  const rawCompanies = useClientsStore((state) => state.companies);
  const rawContacts = useClientsStore((state) => state.contacts);

  const projects = useMemo(() => rawProjects.filter(p => p.isActive), [rawProjects]);
  const companies = useMemo(() => rawCompanies.filter(c => c.isActive), [rawCompanies]);
  const contacts = useMemo(() => rawContacts.filter(c => c.isActive), [rawContacts]);

  // Form setup
  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema) as any,
    defaultValues: {
      contactId: 0,
      companyId: 0,
      projectId: 0,
      askingRent: 0,
      actualSize: 0,
      statusId: 1,
      description: "",
    },
  });

  const projectOptions = projects.map(p => ({ value: p.id, label: p.projectName }));
  const contactOptions = contacts.map(c => ({ value: c.id, label: `${c.contactName} (${c.phone})` }));
  const companyOptions = [
    { value: 0, label: "-- Không liên kết Doanh nghiệp --" },
    ...companies.map(c => ({ value: c.id, label: c.companyName }))
  ];

  // Populate data when form opens/resets
  useEffect(() => {
    if (inquiry) {
      form.reset({
        contactId: inquiry.contactId,
        companyId: inquiry.companyId || 0,
        projectId: inquiry.projectId,
        askingRent: inquiry.askingRent,
        actualSize: inquiry.actualSize,
        statusId: inquiry.statusId,
        description: inquiry.description || "",
      });
    } else {
      form.reset({
        contactId: contacts[0]?.id || 0,
        companyId: 0,
        projectId: projects[0]?.id || 0,
        askingRent: 1000,
        actualSize: 75,
        statusId: 1,
        description: "",
      });
    }
  }, [inquiry, open, form, contacts, projects]);

  const mutation = useCreateOrUpdateInquiry({
    onSuccess: () => {
      toast.success(inquiry ? "Cập nhật yêu cầu thành công!" : "Ghi nhận yêu cầu thành công!");
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const onSubmit = (values: InquiryFormValues) => {
    mutation.mutate({
      id: inquiry?.id,
      data: values,
    });
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={inquiry ? "Cập nhật yêu cầu hỗ trợ" : "Ghi nhận yêu cầu hỗ trợ mới"}
      description="Điền chi tiết nhu cầu tìm kiếm mặt bằng, diện tích, ngân sách và thông tin liên hệ của khách hàng."
      formId="inquiry-form"
      isPending={mutation.isPending}
    >
      <Form {...form}>
        <form id="inquiry-form" onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-2">
            
            {/* Select Representative Contact */}
            <FormCombobox
              control={form.control}
              name="contactId"
              label="Khách hàng yêu cầu (Liên hệ đại diện)"
              options={contactOptions}
              placeholder="Tìm theo họ tên hoặc số điện thoại..."
              disabled={mutation.isPending}
            />

            {/* Select Associated Company */}
            <FormCombobox
              control={form.control}
              name="companyId"
              label="Doanh nghiệp liên kết (Tùy chọn)"
              options={companyOptions}
              placeholder="Tìm và chọn doanh nghiệp đối tác..."
              disabled={mutation.isPending}
            />

            {/* Select Project of Interest */}
            <FormCombobox
              control={form.control}
              name="projectId"
              label="Dự án đô thị quan tâm"
              options={projectOptions}
              placeholder="Chọn dự án khu đô thị..."
              disabled={mutation.isPending}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="askingRent"
                label="Ngân sách thuê tối đa (USD/tháng)"
                type="number"
                required
                disabled={mutation.isPending}
              />
              <FormInput
                control={form.control}
                name="actualSize"
                label="Diện tích yêu cầu tối thiểu (m²)"
                type="number"
                required
                disabled={mutation.isPending}
              />
            </div>

            {/* Status select */}
            <FormSelect
              control={form.control}
              name="statusId"
              label="Trạng thái xử lý yêu cầu"
              options={statuses.map((s) => ({
                value: s.id,
                label: (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </div>
                ),
              }))}
              placeholder="Chọn trạng thái"
              disabled={mutation.isPending}
            />

            {/* Description clauses */}
            <FormRichTextEditor
              control={form.control}
              name="description"
              label="Chi tiết nhu cầu & Lịch sử trao đổi"
              disabled={mutation.isPending}
            />

        </form>
      </Form>
    </DetailDialog>
  );
}
