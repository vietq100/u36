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
import { useCreateOrUpdateCompany } from "../hooks/useClients";
import { useClientsStore } from "../stores/useClientsStore";
import { companySchema } from "../types";
import type { Company, CompanyFormValues } from "../types";
import { RichTextEditor } from "@/components/shared/forms/RichTextEditor";
import { FileUploader } from "@/components/shared/forms/FileUploader";
interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onSuccess?: () => void;
}

export function CompanyForm({ open, onOpenChange, company, onSuccess }: CompanyFormProps) {
  const industries = useClientsStore((state) => state.industries);
  const nationalities = useClientsStore((state) => state.nationalities);

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

  const mutation = useCreateOrUpdateCompany({
    onSuccess: () => {
      toast.success(company ? "Cập nhật doanh nghiệp thành công" : "Thêm mới doanh nghiệp thành công");
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const onSubmit = (values: CompanyFormValues) => {
    mutation.mutate({
      id: company?.id,
      data: values,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{company ? "Chỉnh sửa doanh nghiệp" : "Thêm mới doanh nghiệp"}</DialogTitle>
          <DialogDescription>
            Nhập thông tin chi tiết doanh nghiệp đối tác hoặc khách thuê. Bấm Lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-2">
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
              <FormField
                control={form.control as any}
                name="industryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lĩnh vực hoạt động</FormLabel>
                    <Select
                      disabled={mutation.isPending}
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={String(field.value || 0)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10 bg-card text-foreground border-input">
                          <SelectValue placeholder="Chọn lĩnh vực" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">-- Chọn lĩnh vực --</SelectItem>
                        {industries.map((ind) => (
                          <SelectItem key={ind.id} value={String(ind.id)}>
                            {ind.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nationality Select Dropdown */}
              <FormField
                control={form.control as any}
                name="nationalityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quốc tịch / Quốc gia</FormLabel>
                    <Select
                      disabled={mutation.isPending}
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={String(field.value || 0)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10 bg-card text-foreground border-input">
                          <SelectValue placeholder="Chọn quốc gia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">-- Chọn quốc gia --</SelectItem>
                        {nationalities.map((nat) => (
                          <SelectItem key={nat.id} value={String(nat.id)}>
                            {nat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú / Mô tả doanh nghiệp</FormLabel>
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

            <FormItem>
              <FormLabel>Giấy phép đăng ký kinh doanh / Tài liệu đính kèm (Tùy chọn)</FormLabel>
              <FormControl>
                <FileUploader
                  placeholder="Kéo thả tài liệu PDF, hình ảnh Giấy phép KD tại đây (Tối đa 5MB)"
                  onChange={(file) => {
                    if (file) {
                      toast.info(`Đã nhận tệp tài liệu: ${file.name}`);
                    }
                  }}
                  disabled={mutation.isPending}
                />
              </FormControl>
            </FormItem>

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
                {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
