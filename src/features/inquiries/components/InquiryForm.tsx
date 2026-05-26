import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/forms/FormInput";
import { Combobox } from "@/components/shared/forms/Combobox";
import { RichTextEditor } from "@/components/shared/forms/RichTextEditor";

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
  const projects = usePropertiesStore((state) => state.projects).filter(p => p.isActive);
  const companies = useClientsStore((state) => state.companies).filter(c => c.isActive);
  const contacts = useClientsStore((state) => state.contacts).filter(c => c.isActive);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{inquiry ? "Cập nhật yêu cầu hỗ trợ" : "Ghi nhận yêu cầu hỗ trợ mới"}</DialogTitle>
          <DialogDescription>
            Điền chi tiết nhu cầu tìm kiếm mặt bằng, diện tích, ngân sách và thông tin liên hệ của khách hàng.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-2">
            
            {/* Select Representative Contact */}
            <FormField
              control={form.control as any}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khách hàng yêu cầu (Liên hệ đại diện)</FormLabel>
                  <FormControl>
                    <Combobox
                      options={contactOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tìm theo họ tên hoặc số điện thoại..."
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Select Associated Company */}
            <FormField
              control={form.control as any}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doanh nghiệp liên kết (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Combobox
                      options={companyOptions}
                      value={field.value || 0}
                      onChange={field.onChange}
                      placeholder="Tìm và chọn doanh nghiệp đối tác..."
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Select Project of Interest */}
            <FormField
              control={form.control as any}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dự án đô thị quan tâm</FormLabel>
                  <FormControl>
                    <Combobox
                      options={projectOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Chọn dự án khu đô thị..."
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
            <FormField
              control={form.control as any}
              name="statusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái xử lý yêu cầu</FormLabel>
                  <Select
                    disabled={mutation.isPending}
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={String(field.value || 1)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-10 bg-card text-foreground border-input">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                            {s.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description clauses */}
            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chi tiết nhu cầu & Lịch sử trao đổi</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Đang lưu..." : "Ghi nhận Yêu cầu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
