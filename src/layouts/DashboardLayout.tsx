import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/shared/layout/Sidebar";
import { Header } from "@/components/shared/layout/Header";

export function DashboardLayout() {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background">
      {/* Ambient background glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/8 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <Sidebar />
      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-transparent">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
