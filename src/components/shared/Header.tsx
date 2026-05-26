import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  LogOut, 
  User, 
  Sun, 
  Moon, 
  Monitor, 
  Search, 
  Plus, 
  Building2, 
  Users, 
  FileText, 
  MessageSquare, 
  Bell, 
  Settings, 
  Sparkles,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Header() {
  const navigate = useNavigate();
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Sáng";
      case "dark":
        return "Tối";
      default:
        return "Hệ thống";
    }
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Chức năng tìm kiếm toàn cục (⌘K) đang được tích hợp...");
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/50 bg-card/45 dark:bg-white/3 backdrop-blur-lg px-4 md:px-6 sticky top-0 z-30">
      {/* Left section: Sidebar toggle & Global Search Mock */}
      <div className="flex items-center gap-4 flex-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="hover:bg-muted/50 dark:hover:bg-white/5 hover:text-accent transition-all duration-200 shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Mock Search Input */}
        <form onSubmit={handleQuickSearch} className="relative hidden md:block max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm dự án, khách hàng... ⌘K"
            className="h-8 w-full rounded-xl border border-border/60 bg-muted/20 dark:bg-white/5 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:bg-card/85 transition-all duration-300"
          />
        </form>
      </div>

      {/* Right section: Quick Actions, Notifications, Theme, & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        
        {/* Quick Add Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:text-primary transition-all flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tạo nhanh</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 border border-border/60 bg-popover/80 dark:bg-black/60 backdrop-blur-xl shadow-2xl rounded-xl">
            <DropdownMenuLabel>Tạo mới dữ liệu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/properties")} className="cursor-pointer">
                <Building2 className="h-4 w-4 mr-2 text-primary" />
                <span>Thêm Bất động sản</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/clients")} className="cursor-pointer">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span>Đăng ký Khách hàng</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/contracts")} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                <span>Lập Hợp đồng mới</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/inquiries")} className="cursor-pointer">
                <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                <span>Tiếp nhận Yêu cầu</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 relative text-muted-foreground hover:bg-accent/10 hover:text-accent transition-all shrink-0"
              title="Thông báo"
            >
              <Bell className="h-4 w-4" />
              {/* Pulsing indicator dot */}
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 border border-border/60 bg-popover/80 dark:bg-black/60 backdrop-blur-xl shadow-2xl rounded-xl">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Thông báo gần đây</span>
              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">3 tin mới</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-60 overflow-y-auto py-1">
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-semibold text-xs text-foreground">Hợp đồng sắp hết hạn</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">Hợp đồng HD-2024-001 (Toyota Tsusho) còn 90 ngày hiệu lực. Hãy liên hệ gia hạn.</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="opacity-50" />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-semibold text-xs text-foreground">Yêu cầu tư vấn mới</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">Khách hàng Trần Thị Mai vừa gửi một yêu cầu tìm căn hộ 2-3 phòng ngủ tại Scenic Valley.</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="opacity-50" />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-xs text-foreground">Mặt bằng sẵn sàng</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">Shophouse MD-01-02 (Midtown) đã hoàn tất bảo trì và sẫn sàng cho thuê.</p>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 p-1 rounded-full border border-border/40 bg-muted/10 hover:bg-accent/10 transition-all cursor-pointer text-left focus-visible:outline-none">
                {/* Custom Avatar with initials */}
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shadow-inner font-bold text-xs shrink-0">
                  {user.email.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden flex-col text-left md:flex pr-1.5">
                  <span className="font-semibold text-foreground text-[11px] leading-tight max-w-[100px] truncate">{user.email}</span>
                  <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider leading-none mt-0.5">
                    {user.roles[0]}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block shrink-0 pr-0.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border border-border/60 bg-popover/80 dark:bg-black/60 backdrop-blur-xl shadow-2xl rounded-xl">
              <DropdownMenuLabel className="font-normal flex flex-col gap-0.5 p-3">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                  <span className="font-bold text-foreground text-xs">Phú Mỹ Hưng Leasing</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 truncate">{user.email}</span>
                <span className="text-[9px] text-primary font-bold uppercase tracking-wider mt-0.5">
                  Vai trò: {user.roles.join(", ")}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  <span>Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Cài đặt hệ thống</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              {/* Theme Sub Menu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  {getThemeIcon()}
                  <span className="ml-2">Giao diện ({getThemeLabel()})</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="border border-border/60 bg-popover/80 dark:bg-black/60 backdrop-blur-xl shadow-2xl rounded-xl">
                  <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer flex justify-between items-center">
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 mr-2 text-amber-500" />
                      <span>Sáng</span>
                    </div>
                    {theme === "light" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer flex justify-between items-center">
                    <div className="flex items-center">
                      <Moon className="h-4 w-4 mr-2 text-sky-500" />
                      <span>Tối</span>
                    </div>
                    {theme === "dark" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer flex justify-between items-center">
                    <div className="flex items-center">
                      <Monitor className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Hệ thống</span>
                    </div>
                    {theme === "system" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout} 
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20"
                variant="destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
