import { useState } from "react";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { ProjectList } from "../components/ProjectList";
import { UnitList } from "../components/UnitList";
import { TenantList } from "../components/TenantList";
import { Building2, LayoutGrid, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState<"units" | "projects" | "tenants">("units");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Bất động sản"
        description="Quản lý thông tin dự án khu đô thị và các căn hộ, biệt thự, shophouse, mặt bằng thương mại cho thuê."
      />

      {/* Modern Premium Tabs Header */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "units" | "projects" | "tenants")} className="w-full">
        <TabsList variant="underline">
          <TabsTrigger value="units" layoutId="propertiesTabIndicator">
            <LayoutGrid className="h-4 w-4" />
            <span>Căn hộ & Mặt bằng</span>
          </TabsTrigger>
          <TabsTrigger value="projects" layoutId="propertiesTabIndicator">
            <Building2 className="h-4 w-4" />
            <span>Dự án Đô thị</span>
          </TabsTrigger>
          <TabsTrigger value="tenants" layoutId="propertiesTabIndicator">
            <Users className="h-4 w-4" />
            <span>Cư dân & Khách thuê</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Panels */}
        <div className="mt-2 transition-all duration-300">
          <TabsContent value="units" className="mt-0 focus:outline-none">
            <UnitList />
          </TabsContent>
          <TabsContent value="projects" className="mt-0 focus:outline-none">
            <ProjectList />
          </TabsContent>
          <TabsContent value="tenants" className="mt-0 focus:outline-none">
            <TenantList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
