import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, Sun, Moon, Monitor } from "lucide-react";

export function Header() {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

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

  const getThemeTitle = () => {
    switch (theme) {
      case "light":
        return "Giao diện: Sáng";
      case "dark":
        return "Giao diện: Tối";
      default:
        return "Giao diện: Hệ thống";
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/40 bg-card/85 backdrop-blur-md px-4 md:px-6 sticky top-0 z-30">
      {/* Left section: Sidebar toggle */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="hover:bg-accent/10 hover:text-accent transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="hidden text-sm font-semibold text-muted-foreground md:inline-block tracking-wide">
          HỆ THỐNG QUẢN LÝ LEASING
        </span>
      </div>

      {/* Right section: Theme Switcher, Profile & Logout */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={getThemeTitle()}
          className="text-muted-foreground hover:bg-accent/10 hover:text-accent transition-all duration-200"
        >
          {getThemeIcon()}
        </Button>

        {user && (
          <div className="flex items-center gap-2.5 text-sm border-l border-border/40 pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shadow-inner">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden flex-col text-left md:flex">
              <span className="font-semibold text-foreground text-xs max-w-[120px] truncate">{user.email}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {user.roles.join(", ")}
              </span>
            </div>
          </div>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={logout}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          title="Đăng xuất"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
