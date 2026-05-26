import { useEffect, useMemo } from "react";
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
import { useCreateOrUpdateUnit } from "../hooks/useProperties";
import { usePropertiesStore } from "../stores/usePropertiesStore";
import { unitSchema } from "../types";
import type { Unit, UnitFormValues } from "../types";

interface UnitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: Unit | null;
  onSuccess?: () => void;
}

export function UnitForm({ open, onOpenChange, unit, onSuccess }: UnitFormProps) {
  const rawProjects = usePropertiesStore((state) => state.projects);
  const projects = useMemo(() => rawProjects.filter(p => p.isActive), [rawProjects]);
  const statuses = usePropertiesStore((state) => state.statuses);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema) as any,
    defaultValues: {
      unitName: "",
      projectId: 0,
      floorName: "",
      actualSize: 0,
      price: 0,
      statusId: 1,
      description: "",
    },
  });

  // Reset form values when unit changes
  useEffect(() => {
    if (unit) {
      form.reset({
        unitName: unit.unitName,
        projectId: unit.projectId,
        floorName: unit.floorName,
        actualSize: unit.actualSize,
        price: unit.price,
        statusId: unit.statusId,
        description: unit.description || "",
      });
    } else {
      form.reset({
        unitName: "",
        projectId: projects[0]?.id || 0,
        floorName: "",
        actualSize: 0,
        price: 0,
        statusId: 1,
        description: "",
      });
    }
  }, [unit, open, form, projects]);

  const mutation = useCreateOrUpdateUnit({
    onSuccess: () => {
      toast.success(unit ? "Cập nhật căn hộ thành công" : "Thêm mới căn hộ thành công");
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const onSubmit = (values: UnitFormValues) => {
    mutation.mutate({
      id: unit?.id,
      data: values,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{unit ? "Chỉnh sửa căn hộ / mặt bằng" : "Thêm mới căn hộ / mặt bằng"}</DialogTitle>
          <DialogDescription>
            Nhập thông tin chi tiết căn hộ hoặc mặt bằng thương mại cho thuê. Bấm Lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-2">
            <FormInput
              control={form.control}
              name="unitName"
              label="Mã căn hộ/mặt bằng"
              placeholder="Ví dụ: SV1-02-03"
              required
            />

            <FormField
              control={form.control as any}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dự án</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={String(field.value || 0)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-10 bg-card text-foreground border-input">
                        <SelectValue placeholder="Chọn dự án" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0" disabled>-- Chọn dự án --</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.projectName} ({p.projectCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="floorName"
                label="Tầng/Lầu"
                placeholder="Ví dụ: Tầng 5"
                required
              />
              <FormInput
                control={form.control}
                name="actualSize"
                label="Diện tích (m²)"
                type="number"
                placeholder="Ví dụ: 85"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="price"
                label="Giá thuê (USD/tháng)"
                type="number"
                placeholder="Ví dụ: 1200"
                required
              />

              <FormField
                control={form.control as any}
                name="statusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select
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
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormInput
              control={form.control}
              name="description"
              label="Mô tả căn hộ"
              placeholder="Ví dụ: Đầy đủ nội thất, view đẹp..."
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
                {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
