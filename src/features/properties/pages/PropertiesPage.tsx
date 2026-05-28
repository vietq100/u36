import { useState } from "react";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { ProjectList } from "../components/ProjectList";
import { UnitList } from "../components/UnitList";
import { TenantList } from "../components/TenantList";
import { Building2, LayoutGrid, Users } from "lucide-react";

export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState<"units" | "projects" | "tenants">("units");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Bất động sản"
        description="Quản lý thông tin dự án khu đô thị và các căn hộ, biệt thự, shophouse, mặt bằng thương mại cho thuê."
      />

      {/* Modern Premium Tabs Header */}
      <div className="flex border-b border-border/40 gap-6">
        <button
          onClick={() => setActiveTab("units")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative ${
            activeTab === "units" 
              ? "text-primary font-bold" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Căn hộ & Mặt bằng
          {activeTab === "units" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative ${
            activeTab === "projects" 
              ? "text-primary font-bold" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Dự án Đô thị
          {activeTab === "projects" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("tenants")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative ${
            activeTab === "tenants" 
              ? "text-primary font-bold" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Cư dân & Khách thuê
          {activeTab === "tenants" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-2 transition-all duration-300">
        {activeTab === "units" && <UnitList />}
        {activeTab === "projects" && <ProjectList />}
        {activeTab === "tenants" && <TenantList />}
      </div>
    </div>
  );
}
