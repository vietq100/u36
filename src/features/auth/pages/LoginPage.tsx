import { LoginForm } from "../components/LoginForm";
import { Building2, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Left panel: Premium Brand Info (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative flex-col justify-between p-12 bg-gradient-to-br from-emerald-950 via-primary to-emerald-900 text-primary-foreground overflow-hidden">
        {/* Subtle grid background overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
            <Building2 className="h-6 w-6 text-accent" />
          </div>
          <span className="text-xl font-bold tracking-wider text-accent uppercase">
            Phú Mỹ Hưng
          </span>
        </div>

        {/* Brand Statement */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-none text-white">
            Giải pháp Quản lý <span className="text-accent">Leasing</span> Cao cấp
          </h2>
          <p className="text-base text-white/80 leading-relaxed">
            Hệ thống quản lý bất động sản thương mại, văn phòng và căn hộ dịch vụ cao cấp tại đô thị kiểu mẫu Phú Mỹ Hưng. Tối ưu hóa quy trình, nâng tầm trải nghiệm.
          </p>
          <div className="space-y-3 pt-4">
            {[
              "Quản lý mặt bằng thông minh & trực quan",
              "Theo dõi và lập hóa đơn hợp đồng tự động",
              "Hỗ trợ phản hồi nhanh yêu cầu của cư dân và đối tác",
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-sm text-white/90">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} Công ty TNHH Phát triển Phú Mỹ Hưng. Bảo lưu mọi quyền.
        </div>
      </div>

      {/* Right panel: Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-muted/10 relative">
        {/* Subtle abstract color blobs in the background */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />

        <div className="w-full max-w-[400px] space-y-6 relative z-10">
          {/* Mobile Brand Header */}
          <div className="flex flex-col items-center space-y-2 text-center md:hidden mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Building2 className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Phú Mỹ Hưng Leasing
            </h1>
            <p className="text-xs text-muted-foreground">
              Hệ thống quản lý bất động sản và hợp đồng
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
