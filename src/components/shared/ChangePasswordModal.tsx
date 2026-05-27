import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { ActionModal } from "@/components/shared/ActionModal";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { usePostApiServicesAppUserChangePassword } from "@/api/generated/user/user";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mật khẩu hiện tại là bắt buộc"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Xác nhận mật khẩu mới là bắt buộc"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu mới không trùng khớp",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema) as any,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Real Mutation
  const realChangePasswordMutation = usePostApiServicesAppUserChangePassword({
    mutation: {
      onSuccess: () => {
        toast.success("Đổi mật khẩu thành công!");
        form.reset();
        onOpenChange(false);
      },
      onError: (err: any) => {
        console.error("Change password error:", err);
        toast.error(err.response?.data?.error?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
      },
    },
  });

  const isPending = realChangePasswordMutation.isPending;

  const onSubmit = (values: PasswordFormValues) => {
    realChangePasswordMutation.mutate({
      data: {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
    });
  };

  return (
    <ActionModal
      open={open}
      onOpenChange={(val) => {
        if (!val) form.reset();
        onOpenChange(val);
      }}
      title={
        <span className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          Đổi mật khẩu
        </span>
      }
      description="Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật tài khoản của bạn."
      formId="change-password-form"
      isPending={isPending}
      saveLabel="Đổi mật khẩu"
      cancelLabel="Hủy"
      maxWidth="sm"
    >
      <Form {...form}>
        <form id="change-password-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-1">
          {/* Current Password */}
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu hiện tại</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showCurrent ? "text" : "password"}
                      placeholder="Nhập mật khẩu hiện tại..."
                      className="h-10 rounded-input pr-10"
                      disabled={isPending}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* New Password */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      placeholder="Mật khẩu mới (ít nhất 6 ký tự)..."
                      className="h-10 rounded-input pr-10"
                      disabled={isPending}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm New Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Xác nhận lại mật khẩu mới..."
                      className="h-10 rounded-input pr-10"
                      disabled={isPending}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ActionModal>
  );
}
