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
import { useCreateOrUpdateContact } from "../hooks/useClients";
import { useClientsStore } from "../stores/useClientsStore";
import { contactSchema } from "../types";
import type { Contact, ContactFormValues } from "../types";
import { Combobox } from "@/components/shared/forms/Combobox";
import { RichTextEditor } from "@/components/shared/forms/RichTextEditor";
import { FileUploader } from "@/components/shared/forms/FileUploader";
interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSuccess?: () => void;
}

export function ContactForm({ open, onOpenChange, contact, onSuccess }: ContactFormProps) {
  const companies = useClientsStore((state) => state.companies).filter(c => c.isActive);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{contact ? "Chỉnh sửa khách hàng / liên hệ" : "Thêm mới khách hàng / liên hệ"}</DialogTitle>
          <DialogDescription>
            Nhập thông tin chi tiết liên hệ cá nhân hoặc người đại diện doanh nghiệp. Bấm Lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-2">
            <FormInput
              control={form.control}
              name="contactName"
              label="Họ và tên"
              placeholder="Ví dụ: Nguyễn Văn A"
              required
              disabled={mutation.isPending}
            />

            {/* Company Select Dropdown */}
            <FormField
              control={form.control as any}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thuộc Doanh nghiệp (Nếu có)</FormLabel>
                  <FormControl>
                    <Combobox
                      options={[
                        { value: 0, label: "-- Cá nhân tự do (Không liên kết công ty) --" },
                        ...companies.map(c => ({ value: c.id, label: c.companyName }))
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tìm kiếm & chọn doanh nghiệp..."
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
              <FormField
                control={form.control as any}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <Select
                      disabled={mutation.isPending}
                      onValueChange={field.onChange}
                      value={field.value || "MALE"}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10 bg-card text-foreground border-input">
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Nam</SelectItem>
                        <SelectItem value="FEMALE">Nữ</SelectItem>
                        <SelectItem value="OTHER">Khác</SelectItem>
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
                    <FormLabel>Quốc tịch</FormLabel>
                    <Select
                      disabled={mutation.isPending}
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={String(field.value || 0)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10 bg-card text-foreground border-input">
                          <SelectValue placeholder="Chọn quốc tịch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">-- Chọn quốc tịch --</SelectItem>
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

            <div className="grid grid-cols-2 gap-4">
              {/* Level Select Dropdown */}
              <FormField
                control={form.control as any}
                name="levelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chức vụ / Cấp bậc</FormLabel>
                    <Select
                      disabled={mutation.isPending}
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={String(field.value || 0)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10 bg-card text-foreground border-input">
                          <SelectValue placeholder="Chọn chức vụ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">-- Chọn chức vụ --</SelectItem>
                        {levels.map((lvl) => (
                          <SelectItem key={lvl.id} value={String(lvl.id)}>
                            {lvl.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* LeadSource Select Dropdown */}
              <FormField
                control={form.control as any}
                name="leadSourceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nguồn tiềm năng</FormLabel>
                    <Select
                      disabled={mutation.isPending}
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={String(field.value || 0)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10 bg-card text-foreground border-input">
                          <SelectValue placeholder="Chọn nguồn khách" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">-- Chọn nguồn --</SelectItem>
                        {leadSources.map((ls) => (
                          <SelectItem key={ls.id} value={String(ls.id)}>
                            {ls.name}
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
                  <FormLabel>Ghi chú chi tiết</FormLabel>
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
