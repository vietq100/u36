import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

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

  const onSubmit = (values: LoginValues) => {
    // Fake login
    console.log("Login with", values);
    setAuth({ id: "1", email: values.email, roles: ["ADMIN"] }, "fake-jwt-token");
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
            />
            <FormInput
              control={form.control}
              name="password"
              label="Mật khẩu"
              placeholder="********"
              type="password"
            />
            <Button type="submit" className="w-full">Đăng nhập</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
