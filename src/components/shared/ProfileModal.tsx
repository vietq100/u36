import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { Camera, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormInput } from "@/components/shared/forms/FormInput";

// Import real API hooks and functions
import { useGetApiServicesAppSessionGetCurrentLoginInformations } from "@/api/generated/session/session";
import { 
  useGetApiServicesAppProfileGetProfilePicture,
  usePutApiServicesAppProfileUpdateMyProfilePicture,
  usePutApiServicesAppProfileUpdateCurrentUserProfile,
  postApiProfileUploadProfilePicture
} from "@/api/generated/profile/profile";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const profileSchema = z.object({
  displayName: z.string().min(2, "Tên hiển thị phải có ít nhất 2 ký tự"),
  emailAddress: z.string().email("Email không hợp lệ"),
  phoneNumber: z.string().min(1, "Số điện thoại là bắt buộc"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, token, setAuth } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);

  // 1. Fetch current login/profile information
  const { data: sessionData, isLoading } = useGetApiServicesAppSessionGetCurrentLoginInformations({
    query: {
      enabled: open,
    },
  });

  // 2. Fetch current profile picture
  const { data: pictureData } = useGetApiServicesAppProfileGetProfilePicture({
    query: {
      enabled: open,
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      displayName: "",
      emailAddress: "",
      phoneNumber: "",
    },
  });

  // 3. Set default values when data is loaded
  useEffect(() => {
    if (open) {
      const rawData = sessionData as any;
      const userData =
        rawData?.user ||
        rawData?.result?.user ||
        rawData?.data?.user ||
        rawData?.data?.result?.user;
      if (userData) {
        form.reset({
          displayName: userData.displayName || "",
          emailAddress: userData.emailAddress || "",
          phoneNumber: userData.phoneNumber || "",
        });
      }
    }
  }, [sessionData, open, user, form]);

  // 4. Mutations
  const realProfileMutation = usePutApiServicesAppProfileUpdateCurrentUserProfile({
    mutation: {
      onSuccess: () => {
        toast.success("Cập nhật thông tin cá nhân thành công");
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Session/GetCurrentLoginInformations"] });
        if (user) {
          setAuth({ ...user, email: form.getValues("emailAddress") }, token || "");
        }
        onOpenChange(false);
      },
      onError: (err: any) => {
        console.error("Profile update error:", err);
        toast.error(err.response?.data?.error?.message || "Cập nhật thất bại. Vui lòng thử lại.");
      },
    },
  });

  const realPictureMutation = usePutApiServicesAppProfileUpdateMyProfilePicture({
    mutation: {
      onSuccess: () => {
        toast.success("Cập nhật ảnh đại diện thành công");
        queryClient.invalidateQueries({ queryKey: ["/api/services/app/Profile/GetProfilePicture"] });
        setIsUploading(false);
      },
      onError: (err: any) => {
        console.error("Picture update error:", err);
        toast.error(err.response?.data?.error?.message || "Cập nhật ảnh thất bại");
        setIsUploading(false);
      },
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    realProfileMutation.mutate({
      data: {
        displayName: values.displayName,
        emailAddress: values.emailAddress,
        phoneNumber: values.phoneNumber,
      },
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Hình ảnh vượt quá dung lượng tối đa 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload the picture using the direct axios request wrapper function
      const uploadResult = await postApiProfileUploadProfilePicture({
        body: formData as any,
      });

      const rawUpload = uploadResult as any;
      const fileToken =
        rawUpload?.fileToken ||
        rawUpload?.result?.fileToken ||
        rawUpload?.data?.fileToken ||
        rawUpload?.data?.result?.fileToken;

      if (!fileToken) {
        throw new Error("Không nhận được token tệp tin từ máy chủ");
      }

      // Apply picture
      await realPictureMutation.mutateAsync({
        data: {
          fileToken,
          x: 0,
          y: 0,
          width: 150,
          height: 150,
        },
      });
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast.error(err.response?.data?.error?.message || "Tải ảnh lên thất bại");
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Safe unwrap for picture data
  const getAvatarSrc = () => {
    const rawPic = pictureData as any;
    const pic =
      rawPic?.profilePicture ||
      rawPic?.result?.profilePicture ||
      rawPic?.data?.profilePicture ||
      rawPic?.data?.result?.profilePicture;
    if (!pic) return "";
    if (pic.startsWith("data:") || pic.startsWith("http")) return pic;
    return `data:image/jpeg;base64,${pic}`;
  };

  const rawSession = sessionData as any;
  const userData =
    rawSession?.user ||
    rawSession?.result?.user ||
    rawSession?.data?.user ||
    rawSession?.data?.result?.user;
  const currentUserName = userData?.userName || "";
  const avatarUrl = getAvatarSrc();
  const initials = form.getValues("displayName")?.substring(0, 2).toUpperCase() || user?.email.substring(0, 2).toUpperCase() || "US";

  const isPending = realProfileMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Hồ sơ cá nhân</DialogTitle>
          <DialogDescription>
            Xem và cập nhật thông tin tài khoản của bạn trên hệ thống.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
            Đang tải thông tin...
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center pb-4">
              <div 
                onClick={triggerFileInput}
                className="relative group h-20 w-20 rounded-full border-2 border-primary/20 shadow-md cursor-pointer overflow-hidden flex items-center justify-center bg-primary/5 hover:border-primary/50 transition-all duration-300"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-primary">{initials}</span>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground mt-2 hover:text-foreground cursor-pointer font-medium" onClick={triggerFileInput}>
                {isUploading ? "Đang tải lên..." : "Thay đổi ảnh đại diện"}
              </span>

              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
                disabled={isUploading}
              />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Username (Read-only) */}
                <FormItem>
                  <FormLabel>Tên tài khoản (Username)</FormLabel>
                  <FormControl>
                    <Input
                      value={currentUserName}
                      disabled
                      className="bg-muted/50 text-muted-foreground select-none cursor-not-allowed border-dashed h-10 rounded-xl"
                    />
                  </FormControl>
                </FormItem>

                {/* Display Name */}
                <FormInput
                  control={form.control}
                  name="displayName"
                  label="Họ và Tên"
                  placeholder="Nhập họ và tên..."
                  className="h-10 rounded-xl"
                  required
                  disabled={isPending}
                />

                {/* Email Address */}
                <FormInput
                  control={form.control}
                  name="emailAddress"
                  label="Địa chỉ Email"
                  placeholder="email@example.com"
                  type="email"
                  className="h-10 rounded-xl"
                  required
                  disabled={isPending}
                />

                {/* Phone Number */}
                <FormInput
                  control={form.control}
                  name="phoneNumber"
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại..."
                  className="h-10 rounded-xl"
                  required
                  disabled={isPending}
                />

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isPending}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
