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
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/forms/FormInput";
import { useCreateOrUpdateProject } from "../hooks/useProperties";
import { projectSchema } from "../types";
import type { Project, ProjectFormValues } from "../types";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSuccess?: () => void;
}

export function ProjectForm({ open, onOpenChange, project, onSuccess }: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      projectName: "",
      projectCode: "",
      numberOfFloors: 1,
      description: "",
    },
  });

  // Reset form values when project changes
  useEffect(() => {
    if (project) {
      form.reset({
        projectName: project.projectName,
        projectCode: project.projectCode,
        numberOfFloors: project.numberOfFloors,
        description: project.description || "",
      });
    } else {
      form.reset({
        projectName: "",
        projectCode: "",
        numberOfFloors: 1,
        description: "",
      });
    }
  }, [project, open, form]);

  const mutation = useCreateOrUpdateProject({
    onSuccess: () => {
      toast.success(project ? "Cập nhật dự án thành công" : "Thêm mới dự án thành công");
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const onSubmit = (values: ProjectFormValues) => {
    mutation.mutate({
      id: project?.id,
      data: values,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{project ? "Chỉnh sửa dự án" : "Thêm mới dự án"}</DialogTitle>
          <DialogDescription>
            Nhập thông tin chi tiết dự án bất động sản thương mại/căn hộ. Bấm Lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-2">
            <FormInput
              control={form.control}
              name="projectName"
              label="Tên dự án"
              placeholder="Ví dụ: Midtown M7"
              required
            />
            <FormInput
              control={form.control}
              name="projectCode"
              label="Mã dự án"
              placeholder="Ví dụ: MD-M7"
              required
              disabled={!!project} // Cannot edit code after creation
            />
            <FormInput
              control={form.control}
              name="numberOfFloors"
              label="Số lượng sàn/tầng"
              type="number"
              placeholder="Ví dụ: 15"
              required
            />
            <FormInput
              control={form.control}
              name="description"
              label="Mô tả dự án"
              placeholder="Nhập ghi chú hoặc mô tả dự án..."
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
