import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DetailDialog } from "@/components/shared/dialogs/DetailDialog";
import { Form, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormRichTextEditor } from "@/components/shared/forms/FormRichTextEditor";
import { useCreateOrUpdateCompany, useUploadCompanyDocument } from "../hooks/useClients";
import { useGetDocuments } from "@/features/properties/hooks/useProjectDocuments";
import { useClientsStore } from "../stores/useClientsStore";
import type { Company, CompanyFormValues } from "../types";
import { companySchema } from "../types";
import { FileUploader } from "@/components/shared/inputs/FileUploader";
interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onSuccess?: () => void;
}

export function CompanyForm({ open, onOpenChange, company, onSuccess }: CompanyFormProps) {
  const industries = useClientsStore((state) => state.industries);
  const nationalities = useClientsStore((state) => state.nationalities);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch existing documents if company exists
  const { data: docData } = useGetDocuments({ inputId: company?.uniqueId });
  const existingFileUrl = docData && (docData as any).items?.[0]?.fileUrl || null;

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema) as any,
    defaultValues: {
      companyName: "",
      vatCode: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      industryId: 0,
      nationalityId: 0,
      description: "",
    },
  });

  useEffect(() => {
    setSelectedFile(null);
    if (company) {
      form.reset({
        companyName: company.companyName,
        vatCode: company.vatCode,
        email: company.email || "",
        phone: company.phone,
        website: company.website || "",
        address: company.address || "",
        industryId: company.industryId || 0,
        nationalityId: company.nationalityId || 0,
        description: company.description || "",
      });
    } else {
      form.reset({
        companyName: "",
        vatCode: "",
        email: "",
        phone: "",
        website: "",
        address: "",
        industryId: industries[0]?.id || 0,
        nationalityId: nationalities[0]?.id || 0,
        description: "",
      });
    }
  }, [company, open, form, industries, nationalities]);

  const mutation = useCreateOrUpdateCompany();
  const uploadMutation = useUploadCompanyDocument();

  const onSubmit = async (values: CompanyFormValues) => {
    try {
      const result = await mutation.mutateAsync({
        id: company?.id,
        data: values,
      });

      const uniqueId = (result as any)?.uniqueId;

      if (selectedFile && uniqueId) {
        toast.info("Đang tải lên tài liệu đính kèm...");
        await uploadMutation.mutateAsync({
          params: {
            UniqueId: uniqueId,
            DocumentName: selectedFile.name,
            UploadDate: new Date().toISOString(),
          },
          file: selectedFile,
        });
      }

      toast.success(company ? "Cập nhật doanh nghiệp thành công" : "Thêm mới doanh nghiệp thành công");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Có lỗi xảy ra: " + (error?.message || error));
    }
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={company ? "Chỉnh sửa doanh nghiệp" : "Thêm mới doanh nghiệp"}
      description="Nhập thông tin chi tiết doanh nghiệp đối tác hoặc khách thuê. Bấm Lưu khi hoàn tất."
      formId="company-form"
      isPending={mutation.isPending || uploadMutation.isPending}
    >
      <Form {...form}>
        <form id="company-form" onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-2">
            <FormInput
              control={form.control}
              name="companyName"
              label="Tên doanh nghiệp"
              placeholder="Ví dụ: Công ty TNHH Phú Mỹ Hưng"
              required
              disabled={mutation.isPending}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="vatCode"
                label="Mã số thuế"
                placeholder="Ví dụ: 0300609388"
                required
                disabled={mutation.isPending}
              />
              <FormInput
                control={form.control}
                name="phone"
                label="Số điện thoại"
                placeholder="Ví dụ: 02854119999"
                required
                disabled={mutation.isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="email"
                label="Email doanh nghiệp"
                placeholder="info@phumyhung.com.vn"
                type="email"
                disabled={mutation.isPending}
              />
              <FormInput
                control={form.control}
                name="website"
                label="Website"
                placeholder="https://..."
                disabled={mutation.isPending}
              />
            </div>

            <FormInput
              control={form.control}
              name="address"
              label="Địa chỉ trụ sở"
              placeholder="Nhập địa chỉ đầy đủ..."
              disabled={mutation.isPending}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Industry Select Dropdown */}
              <FormSelect
                control={form.control}
                name="industryId"
                label="Lĩnh vực hoạt động"
                options={[
                  { value: 0, label: "-- Chọn lĩnh vực --" },
                  ...industries.map((ind) => ({ value: ind.id, label: ind.name }))
                ]}
                placeholder="Chọn lĩnh vực"
                disabled={mutation.isPending}
              />

              {/* Nationality Select Dropdown */}
              <FormSelect
                control={form.control}
                name="nationalityId"
                label="Quốc tịch / Quốc gia"
                options={[
                  { value: 0, label: "-- Chọn quốc gia --" },
                  ...nationalities.map((nat) => ({ value: nat.id, label: nat.name }))
                ]}
                placeholder="Chọn quốc gia"
                disabled={mutation.isPending}
              />
            </div>

            <FormRichTextEditor
              control={form.control}
              name="description"
              label="Ghi chú / Mô tả doanh nghiệp"
              disabled={mutation.isPending}
            />

            <FormItem>
              <FormLabel>Giấy phép đăng ký kinh doanh / Tài liệu đính kèm (Tùy chọn)</FormLabel>
              <FormControl>
                <FileUploader
                  placeholder="Kéo thả tài liệu PDF, hình ảnh Giấy phép KD tại đây (Tối đa 5MB)"
                  value={selectedFile || existingFileUrl}
                  onChange={(file) => {
                    setSelectedFile(file);
                  }}
                  disabled={mutation.isPending || uploadMutation.isPending}
                />
              </FormControl>
            </FormItem>

          </form>
        </Form>
      </DetailDialog>
  );
}
