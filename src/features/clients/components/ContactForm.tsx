import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormCombobox } from "@/components/shared/forms/FormCombobox";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormRichTextEditor } from "@/components/shared/forms/FormRichTextEditor";
import { useCreateOrUpdateContact } from "../hooks/useClients";
import { useClientsStore } from "../stores/useClientsStore";
import { contactSchema } from "../types";
import type { Contact, ContactFormValues } from "../types";
import { FileUploader } from "@/components/shared/inputs/FileUploader";
import { DetailDialog } from "@/components/shared/DetailDialog";
interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSuccess?: () => void;
}

export function ContactForm({ open, onOpenChange, contact, onSuccess }: ContactFormProps) {
  const rawCompanies = useClientsStore((state) => state.companies);
  const companies = useMemo(() => rawCompanies.filter(c => c.isActive), [rawCompanies]);
  const nationalities = useClientsStore((state) => state.nationalities);
  const leadSources = useClientsStore((state) => state.leadSources);
  const levels = useClientsStore((state) => state.levels);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema) as any,
    defaultValues: {
      contactName: "",
      companyId: 0,
      email: "",
      phone: "",
      gender: "MALE",
      nationalityId: 0,
      leadSourceId: 0,
      levelId: 0,
      description: "",
    },
  });

  useEffect(() => {
    if (contact) {
      form.reset({
        contactName: contact.contactName,
        companyId: contact.companyId || 0,
        email: contact.email,
        phone: contact.phone,
        gender: contact.gender || "MALE",
        nationalityId: contact.nationalityId || 0,
        leadSourceId: contact.leadSourceId || 0,
        levelId: contact.levelId || 0,
        description: contact.description || "",
      });
    } else {
      form.reset({
        contactName: "",
        companyId: 0,
        email: "",
        phone: "",
        gender: "MALE",
        nationalityId: nationalities[0]?.id || 0,
        leadSourceId: leadSources[0]?.id || 0,
        levelId: levels[0]?.id || 0,
        description: "",
      });
    }
  }, [contact, open, form, nationalities, leadSources, levels]);

  const mutation = useCreateOrUpdateContact({
    onSuccess: () => {
      toast.success(contact ? "Cập nhật liên hệ thành công" : "Thêm mới liên hệ thành công");
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    mutation.mutate({
      id: contact?.id,
      data: values,
    });
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={contact ? "Chỉnh sửa khách hàng / liên hệ" : "Thêm mới khách hàng / liên hệ"}
      description="Nhập thông tin chi tiết liên hệ cá nhân hoặc người đại diện doanh nghiệp. Bấm Lưu khi hoàn tất."
      formId="contact-form"
      isPending={mutation.isPending}
    >
      <Form {...form}>
        <form id="contact-form" onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-2">
            <FormInput
              control={form.control}
              name="contactName"
              label="Họ và tên"
              placeholder="Ví dụ: Nguyễn Văn A"
              required
              disabled={mutation.isPending}
            />

            {/* Company Select Dropdown */}
            <FormCombobox
              control={form.control}
              name="companyId"
              label="Thuộc Doanh nghiệp (Nếu có)"
              options={[
                { value: 0, label: "-- Cá nhân tự do (Không liên kết công ty) --" },
                ...companies.map(c => ({ value: c.id, label: c.companyName }))
              ]}
              placeholder="Tìm kiếm & chọn doanh nghiệp..."
              disabled={mutation.isPending}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="phone"
                label="Số điện thoại"
                placeholder="Ví dụ: 0909123456"
                required
                disabled={mutation.isPending}
              />
              <FormInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="vd: name@example.com"
                type="email"
                required
                disabled={mutation.isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Gender Dropdown */}
              <FormSelect
                control={form.control}
                name="gender"
                label="Giới tính"
                options={[
                  { value: "MALE", label: "Nam" },
                  { value: "FEMALE", label: "Nữ" },
                  { value: "OTHER", label: "Khác" }
                ]}
                placeholder="Chọn giới tính"
                disabled={mutation.isPending}
              />

              {/* Nationality Select Dropdown */}
              <FormSelect
                control={form.control}
                name="nationalityId"
                label="Quốc tịch"
                options={[
                  { value: 0, label: "-- Chọn quốc tịch --" },
                  ...nationalities.map((nat) => ({ value: nat.id, label: nat.name }))
                ]}
                placeholder="Chọn quốc tịch"
                disabled={mutation.isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Level Select Dropdown */}
              <FormSelect
                control={form.control}
                name="levelId"
                label="Chức vụ / Cấp bậc"
                options={[
                  { value: 0, label: "-- Chọn chức vụ --" },
                  ...levels.map((lvl) => ({ value: lvl.id, label: lvl.name }))
                ]}
                placeholder="Chọn chức vụ"
                disabled={mutation.isPending}
              />

              {/* LeadSource Select Dropdown */}
              <FormSelect
                control={form.control}
                name="leadSourceId"
                label="Nguồn tiềm năng"
                options={[
                  { value: 0, label: "-- Chọn nguồn --" },
                  ...leadSources.map((ls) => ({ value: ls.id, label: ls.name }))
                ]}
                placeholder="Chọn nguồn khách"
                disabled={mutation.isPending}
              />
            </div>

            <FormRichTextEditor
              control={form.control}
              name="description"
              label="Ghi chú chi tiết"
              disabled={mutation.isPending}
            />

            <FormItem>
              <FormLabel>Ảnh đại diện / Tài liệu cá nhân (Tùy chọn)</FormLabel>
              <FormControl>
                <FileUploader
                  placeholder="Kéo thả ảnh chân dung hoặc CMND/CCCD tại đây (Tối đa 5MB)"
                  accept={{ "image/*": [".jpeg", ".png", ".jpg"] }}
                  onChange={(file) => {
                    if (file) {
                      toast.info(`Đã nhận ảnh: ${file.name}`);
                    }
                  }}
                  disabled={mutation.isPending}
                />
              </FormControl>
            </FormItem>

          </form>
        </Form>
      </DetailDialog>
  );
}
