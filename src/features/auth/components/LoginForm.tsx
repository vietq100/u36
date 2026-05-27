import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { usePostApiTokenAuthAuthenticate } from "@/api/generated/token-auth/token-auth";
import { User, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const authMutation = usePostApiTokenAuthAuthenticate();

  const onSubmit = (values: LoginValues) => {
    authMutation.mutate(
      {
        data: {
          userNameOrEmailAddress: values.email,
          password: values.password,
          rememberClient: values.rememberMe,
        },
      },
      {
        onSuccess: (response) => {
          const result = (response as any).data || response;
          if (result.accessToken) {
            toast.success("Login successful!");
            setAuth({ id: String(result.userId || "1"), email: values.email, roles: ["ADMIN"] }, result.accessToken);
            navigate("/");
          } else {
            toast.error("Failed to authenticate.");
          }
        },
        onError: (err: any) => {
          console.error("Login error:", err);
          toast.error(err.response?.data?.error?.message || "Login failed. Please try again.");
        },
      }
    );
  };

  return (
    <div className="w-full rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white">
      <div className="mb-8 text-center">
        <h1 className="text-[32px] font-bold tracking-tight text-white mb-1">Login</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/60" strokeWidth={2} />
                    <Input 
                      placeholder="Username" 
                      className="h-[52px] rounded-xl border-white/20 bg-white/5 pl-11 pr-4 text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:border-white/40 transition-colors"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-300 font-medium" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/60" strokeWidth={2} />
                    <Input 
                      type="password"
                      placeholder="Password" 
                      className="h-[52px] rounded-xl border-white/20 bg-white/5 pl-11 pr-4 text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:border-white/40 transition-colors"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-300 font-medium" />
              </FormItem>
            )}
          />
          
          <div className="flex items-center justify-between pt-1">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-white/50 rounded data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                  </FormControl>
                  <label className="text-sm font-medium leading-none text-white/80 cursor-pointer">
                    Remember me
                  </label>
                </FormItem>
              )}
            />
            
            <a href="#" className="text-sm font-medium text-white/80 hover:text-white hover:underline transition-colors">
              Forgot password?
            </a>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="h-[52px] w-full rounded-xl bg-white text-base font-bold text-black hover:bg-white/90 transition-all shadow-lg hover:shadow-xl" 
              disabled={authMutation.isPending}
            >
              {authMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="mt-8 text-center text-sm text-white/70">
        Don't have an account?{" "}
        <a href="#" className="font-semibold text-white hover:underline transition-colors">
          Register
        </a>
      </div>
    </div>
  );
}
