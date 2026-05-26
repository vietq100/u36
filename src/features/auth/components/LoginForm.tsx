import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { usePostApiTokenAuthAuthenticate } from "@/api/generated/token-auth/token-auth";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const authMutation = usePostApiTokenAuthAuthenticate();

  // Handle real API submit
  const onSubmit = (values: LoginValues) => {
    authMutation.mutate(
      {
        data: {
          userNameOrEmailAddress: values.email,
          password: values.password,
          rememberClient: true,
        },
      },
      {
        onSuccess: (response) => {
          const result = (response as any).data || response;
          if (result.accessToken) {
            toast.success("Đăng nhập thành công!");
            setAuth(
              { 
                id: String(result.userId || "1"), 
                email: values.email, 
                roles: ["ADMIN"] 
              }, 
              result.accessToken
            );
            navigate("/");
          } else {
            toast.error("Không nhận được token từ hệ thống.");
          }
        },
        onError: (err: any) => {
          console.error("Login error:", err);
          toast.error(err.response?.data?.error?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        },
      }
    );
  };

  // Demo fallback login
  const handleDemoLogin = () => {
    toast.success("Đăng nhập thử nghiệm thành công!");
    setAuth(
      { id: "demo-id", email: "admin@example.com", roles: ["ADMIN"] }, 
      "fake-jwt-token"
    );
    navigate("/");
  };

  return (
    <Card className="w-full max-w-[400px] border-border/50 bg-card/70 backdrop-blur-md shadow-2xl transition-all duration-300 hover:shadow-primary/5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Đăng nhập</CardTitle>
        <CardDescription className="text-muted-foreground">Nhập thông tin để truy cập hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              control={form.control}
              name="email"
              label="Email"
              placeholder="admin@example.com"
              type="email"
              disabled={authMutation.isPending}
            />
            <FormInput
              control={form.control}
              name="password"
              label="Mật khẩu"
              placeholder="********"
              type="password"
              disabled={authMutation.isPending}
            />
            
            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" className="w-full" disabled={authMutation.isPending}>
                {authMutation.isPending ? "Đang xác thực..." : "Đăng nhập hệ thống"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-dashed"
                onClick={handleDemoLogin}
                disabled={authMutation.isPending}
              >
                Chạy bản Demo (Offline)
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
