import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DetailDialog } from "@/components/shared/dialogs/DetailDialog";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { useCreateOrUpdateTenant, useGetCountries } from "../hooks/useTenants";
import { tenantSchema } from "../types";
import type { Tenant, TenantFormValues } from "../types";

interface TenantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant | null;
  onSuccess?: () => void;
}

export function TenantForm({ open, onOpenChange, tenant, onSuccess }: TenantFormProps) {
  const { data: countries = [] } = useGetCountries();

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema) as any,
    defaultValues: {
      name: "",
      gender: "MALE",
      passport: "",
      nationalityId: 0,
      phone: "",
      emailAddress: "",
    },
  });

  useEffect(() => {
    if (tenant) {
      form.reset({
        name: tenant.name,
        gender: tenant.gender || "MALE",
        passport: tenant.passport,
        nationalityId: tenant.nationalityId || 0,
        phone: tenant.phone,
        emailAddress: tenant.emailAddress,
      });
    } else {
      form.reset({
        name: "",
        gender: "MALE",
        passport: "",
        nationalityId: countries[0]?.id || 0,
        phone: "",
        emailAddress: "",
      });
    }
  }, [tenant, open, form, countries]);

  const mutation = useCreateOrUpdateTenant({
    onSuccess: () => {
      toast.success(tenant ? "Cập nhật cư dân/khách thuê thành công" : "Thêm mới cư dân/khách thuê thành công");
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const onSubmit = (values: TenantFormValues) => {
    mutation.mutate({
      data: {
        id: tenant?.id,
        ...values,
      },
    });
  };

  const countryOptions = countries.map((c: any) => ({
    value: c.id,
    label: c.name,
  }));

  const genderOptions = [
    { value: "MALE", label: "Nam (Male)" },
    { value: "FEMALE", label: "Nữ (Female)" },
    { value: "OTHER", label: "Khác (Other)" },
  ];

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={tenant ? "Chỉnh sửa cư dân/khách thuê" : "Thêm mới cư dân/khách thuê"}
      description="Nhập thông tin cá nhân của cư dân hoặc khách thuê căn hộ. Bấm Lưu khi hoàn tất."
      formId="tenant-form"
      isPending={mutation.isPending}
    >
      <Form {...form}>
        <form id="tenant-form" onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <FormInput
                control={form.control}
                name="name"
                label="Họ và tên"
                placeholder="Ví dụ: John Doe"
                required
                disabled={mutation.isPending}
              />
            </div>
            <div>
              <FormSelect
                control={form.control}
                name="gender"
                label="Giới tính"
                options={genderOptions}
                disabled={mutation.isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="passport"
              label="Số Hộ chiếu / CMND"
              placeholder="Nhập số hộ chiếu hoặc căn cước..."
              required
              disabled={mutation.isPending}
            />
            <FormSelect
              control={form.control}
              name="nationalityId"
              label="Quốc tịch"
              options={countryOptions}
              placeholder="Chọn quốc tịch"
              searchPlaceholder="Tìm quốc gia..."
              disabled={mutation.isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="phone"
              label="Số điện thoại"
              placeholder="Ví dụ: +84..."
              required
              disabled={mutation.isPending}
            />
            <FormInput
              control={form.control}
              name="emailAddress"
              label="Email"
              placeholder="Ví dụ: email@gmail.com"
              required
              disabled={mutation.isPending}
            />
          </div>
        </form>
      </Form>
    </DetailDialog>
  );
}
