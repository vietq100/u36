import { NavLink } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { to: "/", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/properties", label: "Bất động sản", icon: Building2 },
  { to: "/clients", label: "Khách hàng", icon: Users },
  { to: "/contracts", label: "Hợp đồng", icon: FileText },
  { to: "/inquiries", label: "Yêu cầu hỗ trợ", icon: MessageSquare },
];

export function Sidebar() {
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/40 bg-card/85 backdrop-blur-md transition-transform duration-300 md:static md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand logo & mobile close button */}
        <div className="flex h-14 items-center justify-between px-6 border-b border-border/40">
          <div className="flex items-center gap-2.5 font-bold">
            <Building2 className="h-5 w-5 text-accent animate-pulse" />
            <span className="text-base tracking-wide bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              PMH LEASING
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-accent/10 hover:text-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => {
                  // Auto close sidebar on mobile click
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-sm shadow-primary/5 pl-4"
                      : "text-muted-foreground hover:bg-accent/10 hover:text-foreground hover:translate-x-1 pl-3"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Golden Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-accent animate-fade-in" />
                    )}
                    <Icon className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
