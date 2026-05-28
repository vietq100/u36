import { NavLink, useLocation } from "react-router-dom";
import { useAppStore } from "@/stores";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import real API hooks
import { useGetApiServicesAppCategoryGetListPropertyType } from "@/api/generated/category/category";
import { useGetProjects } from "@/features/properties/hooks/useProperties";

export function Sidebar() {
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const location = useLocation();

  const handleMobileClose = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Fetch Category Property Types from API
  const { data: propertyTypesData, isLoading: isTypesLoading } = useGetApiServicesAppCategoryGetListPropertyType();
  const propertyTypes = Array.isArray(propertyTypesData)
    ? propertyTypesData
    : ((propertyTypesData as any)?.data || []);
console.log(propertyTypesData,propertyTypes)
  // Fetch Projects from API (Active projects only)
  const { data: projectsData, isLoading: isProjectsLoading } = useGetProjects({
    SkipCount: 0,
    MaxResultCount: 1000,
    IsActive: true,
  });
  const allProjects = projectsData?.items || [];

  const isLinkActive = (toPath: string, exact = false) => {
    const [path, search] = toPath.split("?");
    
    // Check if pathname matches
    const isPathMatch = exact
      ? location.pathname === path
      : location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

    if (!isPathMatch) return false;

    // Check search queries if specified in destination
    if (search) {
      const cleanTargetSearch = decodeURIComponent("?" + search);
      const cleanCurrentSearch = decodeURIComponent(location.search);
      return cleanCurrentSearch === cleanTargetSearch;
    }

    // For base pages like /properties, if current URL has query params,
    // we want to make sure the base /properties link isn't highlighted as active
    if (path === "/properties" && location.search) {
      return false;
    }

    return true;
  };

  const isProjectActive = (pName?: string) => {
    if (!pName) return false;
    return isLinkActive(`/properties?tab=projects&keyword=${pName}`);
  };

  const isTypeActive = (typeId: number) => {
    const typeProjects = allProjects.filter((p: any) =>
      p.projectTypeMap?.some((m: any) => m.propertyTypeId === typeId)
    );
    return typeProjects.some((p: any) => isProjectActive(p.projectName));
  };

  const isCommercialType = (typeCode?: string | null, typeName?: string | null) => {
    const code = (typeCode || '').toUpperCase();
    const name = (typeName || '').toLowerCase();
    return (
      code.includes('MALL') || name.includes('mall') || name.includes('tttm') || name.includes('thương mại') ||
      code.includes('OFFICE') || name.includes('office') || name.includes('văn phòng') ||
      code.includes('RETAIL') || name.includes('retail') || name.includes('bán lẻ') ||
      code.includes('SHOPHOUSE') || name.includes('shophouse') || name.includes('cửa hàng')
    );
  };

  const isResidentialType = (typeCode?: string | null, typeName?: string | null) => {
    const code = (typeCode || '').toUpperCase();
    const name = (typeName || '').toLowerCase();
    return (
      code.includes('CONDO') || code.includes('APARTMENT') || name.includes('căn hộ') || name.includes('chung cư') || name.includes('apartment') || name.includes('condominium') ||
      code.includes('VILLA') || name.includes('villa') || name.includes('biệt thự') ||
      code.includes('TOWNHOUSE') || name.includes('townhouse') || name.includes('nhà phố') || name.includes('liền kề')
    );
  };

  const getTypeIcon = (typeCode?: string | null, typeName?: string | null) => {
    const code = (typeCode || '').toUpperCase();
    const name = (typeName || '').toLowerCase();
    if (code.includes('MALL') || name.includes('mall') || name.includes('tttm')) return '🛍️';
    if (code.includes('OFFICE') || name.includes('office') || name.includes('văn phòng')) return '🏢';
    if (code.includes('RETAIL') || name.includes('retail') || name.includes('bán lẻ')) return '🏬';
    if (code.includes('SHOPHOUSE') || name.includes('shophouse') || name.includes('cửa hàng')) return '🏪';
    if (code.includes('CONDO') || code.includes('APARTMENT') || name.includes('căn hộ') || name.includes('chung cư')) return '🏢';
    if (code.includes('VILLA') || name.includes('villa') || name.includes('biệt thự')) return '🏡';
    if (code.includes('TOWNHOUSE') || name.includes('townhouse') || name.includes('nhà phố') || name.includes('liền kề')) return '🏘️';
    return '🏢';
  };

  const commercialTypes = propertyTypes.filter((t: any) => isCommercialType(t.code, t.name));
  const residentialTypes = propertyTypes.filter((t: any) => isResidentialType(t.code, t.name));

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#1d3a5e] bg-[#0a2540] text-[#e7ecf2] transition-transform duration-300 md:static md:translate-x-0 h-screen overflow-y-auto select-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand logo & mobile close button */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-[#1d3a5e] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#c9a55c] text-[#0a2540] font-extrabold flex items-center justify-center rounded-md text-sm">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-wider leading-none">PMH CRM</span>
              <span className="text-[10px] text-[#93a6c1] font-normal mt-0.5 leading-none">Leasing & Operations</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-300 hover:bg-[#14365e] hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-4 px-3 py-6 overflow-y-auto">
          {/* GROUP: WORKSPACE */}
          <div className="space-y-1">
            <div className="px-4 py-1 text-[10px] font-bold text-[#6e8aaf] uppercase tracking-wider">
              Workspace
            </div>
            <NavLink
              to="/"
              end
              onClick={handleMobileClose}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all rounded-md",
                isLinkActive("/", true)
                  ? "bg-[#14365e] text-[#c9a55c] font-semibold border-l-[3px] border-[#c9a55c] pl-[15px]"
                  : "text-slate-300 hover:bg-[#14365e] hover:text-white"
              )}
            >
              <span className="text-sm">📊</span>
              <span>Dashboard / Tổng quan</span>
            </NavLink>
          </div>

          {/* GROUP: OPERATION */}
          <div className="space-y-1">
            <div className="px-4 py-1 text-[10px] font-bold text-[#6e8aaf] uppercase tracking-wider">
              Operation
            </div>
            <NavLink
              to="/operation"
              onClick={handleMobileClose}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all rounded-md",
                isLinkActive("/operation")
                  ? "bg-[#14365e] text-[#c9a55c] font-semibold border-l-[3px] border-[#c9a55c] pl-[15px]"
                  : "text-slate-300 hover:bg-[#14365e] hover:text-white"
              )}
            >
              <span className="text-sm">⚙️</span>
              <span>Operation / Vận hành</span>
            </NavLink>
          </div>

          {/* GROUP: RESIDENTIAL */}
          <div className="space-y-1">
            <div className="px-4 py-1 text-[10px] font-bold text-[#6e8aaf] uppercase tracking-wider">
              Residential
            </div>
            <NavLink
              to="/residential"
              onClick={handleMobileClose}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all rounded-md",
                isLinkActive("/residential")
                  ? "bg-[#14365e] text-[#c9a55c] font-semibold border-l-[3px] border-[#c9a55c] pl-[15px]"
                  : "text-slate-300 hover:bg-[#14365e] hover:text-white"
              )}
            >
              <span className="text-sm">📊</span>
              <span>Residential / Tổng quan</span>
            </NavLink>

            {isTypesLoading || isProjectsLoading ? (
              <div className="px-4 py-2 text-xs text-[#6e8aaf] italic">Loading Residential...</div>
            ) : residentialTypes.length === 0 ? (
              <div className="px-4 py-2 text-xs text-[#6e8aaf] italic">No Residential Categories</div>
            ) : (
              residentialTypes.map((type: any) => {
                const typeIcon = getTypeIcon(type.code, type.name);
                const typeProjs = allProjects.filter((p: any) =>
                  p.projectTypeMap?.some((m: any) => m.propertyTypeId === type.id)
                );
                const isActive = type.id ? isTypeActive(type.id) : false;

                return (
                  <details key={type.id} className="group" open={isActive || undefined}>
                    <summary className="flex items-center justify-between gap-2.5 px-4 py-2 cursor-pointer text-slate-300 hover:bg-[#14365e] hover:text-white text-sm transition-all rounded-md list-none [&::-webkit-details-marker]:hidden">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{typeIcon}</span>
                        <span>{type.name}</span>
                      </div>
                      <span className="text-[9px] text-[#6e8aaf] transition-transform duration-200 group-open:rotate-90">▶</span>
                    </summary>
                    <div className="pl-6 pr-2 py-1 space-y-1 text-xs">
                      <div className="italic text-[10px] text-[#6e8aaf] pl-[15px] py-0.5">Your accessible projects</div>
                      {typeProjs.length === 0 ? (
                        <div className="pl-[15px] py-1 text-[11px] text-[#6e8aaf] italic">No projects found</div>
                      ) : (
                        typeProjs.map((p: any) => {
                          const toUrl = `/properties?tab=projects&keyword=${p.projectName}`;
                          const isProjActive = isProjectActive(p.projectName);
                          return (
                            <NavLink
                              key={p.id}
                              to={toUrl}
                              onClick={handleMobileClose}
                              className={cn(
                                "block pl-[15px] py-1.5 rounded-md transition-all",
                                isProjActive ? "text-[#c9a55c] font-semibold bg-[#14365e]" : "text-slate-300 hover:text-white"
                              )}
                            >
                              ▸ {p.projectName} {p.projectCode ? `(${p.projectCode})` : ""}
                            </NavLink>
                          );
                        })
                      )}
                    </div>
                  </details>
                );
              })
            )}
          </div>

          {/* GROUP: COMMERCIAL */}
          <div className="space-y-1">
            <div className="px-4 py-1 text-[10px] font-bold text-[#6e8aaf] uppercase tracking-wider">
              Commercial
            </div>

            {isTypesLoading || isProjectsLoading ? (
              <div className="px-4 py-2 text-xs text-[#6e8aaf] italic">Loading Commercial...</div>
            ) : commercialTypes.length === 0 ? (
              <div className="px-4 py-2 text-xs text-[#6e8aaf] italic">No Commercial Categories</div>
            ) : (
              commercialTypes.map((type: any) => {
                const typeIcon = getTypeIcon(type.code, type.name);
                const typeProjs = allProjects.filter((p: any) =>
                  p.projectTypeMap?.some((m: any) => m.propertyTypeId === type.id)
                );
                const isActive = type.id ? isTypeActive(type.id) : false;

                return (
                  <details key={type.id} className="group" open={isActive || undefined}>
                    <summary className="flex items-center justify-between gap-2.5 px-4 py-2 cursor-pointer text-slate-300 hover:bg-[#14365e] hover:text-white text-sm transition-all rounded-md list-none [&::-webkit-details-marker]:hidden">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{typeIcon}</span>
                        <span>{type.name}</span>
                      </div>
                      <span className="text-[9px] text-[#6e8aaf] transition-transform duration-200 group-open:rotate-90">▶</span>
                    </summary>
                    <div className="pl-6 pr-2 py-1 space-y-1 text-xs">
                      <div className="italic text-[10px] text-[#6e8aaf] pl-[15px] py-0.5">Your accessible projects</div>
                      {typeProjs.length === 0 ? (
                        <div className="pl-[15px] py-1 text-[11px] text-[#6e8aaf] italic">No projects found</div>
                      ) : (
                        typeProjs.map((p: any) => {
                          const toUrl = `/properties?tab=projects&keyword=${p.projectName}`;
                          const isProjActive = isProjectActive(p.projectName);
                          return (
                            <NavLink
                              key={p.id}
                              to={toUrl}
                              onClick={handleMobileClose}
                              className={cn(
                                "block pl-[15px] py-1.5 rounded-md transition-all",
                                isProjActive ? "text-[#c9a55c] font-semibold bg-[#14365e]" : "text-slate-300 hover:text-white"
                              )}
                            >
                              ▸ {p.projectName} {p.projectCode ? `(${p.projectCode})` : ""}
                            </NavLink>
                          );
                        })
                      )}
                    </div>
                  </details>
                );
              })
            )}
          </div>

          {/* GROUP: LEASING */}
          <div className="space-y-1">
            <div className="px-4 py-1 text-[10px] font-bold text-[#6e8aaf] uppercase tracking-wider">
              Leasing
            </div>
            <NavLink
              to="/inquiries"
              onClick={handleMobileClose}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all rounded-md",
                isLinkActive("/inquiries")
                  ? "bg-[#14365e] text-[#c9a55c] font-semibold border-l-[3px] border-[#c9a55c] pl-[15px]"
                  : "text-slate-300 hover:bg-[#14365e] hover:text-white"
              )}
            >
              <span className="text-sm">📋</span>
              <span>Leasing Pipeline</span>
            </NavLink>

            <NavLink
              to="/proposals"
              onClick={handleMobileClose}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all rounded-md",
                isLinkActive("/proposals")
                  ? "bg-[#14365e] text-[#c9a55c] font-semibold border-l-[3px] border-[#c9a55c] pl-[15px]"
                  : "text-slate-300 hover:bg-[#14365e] hover:text-white"
              )}
            >
              <span className="text-sm">📝</span>
              <span>Offer Letter</span>
            </NavLink>

            <NavLink
              to="/contracts"
              onClick={handleMobileClose}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all rounded-md",
                isLinkActive("/contracts")
                  ? "bg-[#14365e] text-[#c9a55c] font-semibold border-l-[3px] border-[#c9a55c] pl-[15px]"
                  : "text-slate-300 hover:bg-[#14365e] hover:text-white"
              )}
            >
              <span className="text-sm">📜</span>
              <span>Lease Agreement</span>
            </NavLink>

            <NavLink
              to="/tenants"
              onClick={handleMobileClose}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all rounded-md",
                isLinkActive("/tenants")
                  ? "bg-[#14365e] text-[#c9a55c] font-semibold border-l-[3px] border-[#c9a55c] pl-[15px]"
                  : "text-slate-300 hover:bg-[#14365e] hover:text-white"
              )}
            >
              <span className="text-sm">👥</span>
              <span>Tenants</span>
            </NavLink>
          </div>

          {/* GROUP: INSIGHTS */}
          <div className="space-y-1">
            <div className="px-4 py-1 text-[10px] font-bold text-[#6e8aaf] uppercase tracking-wider">
              Insights
            </div>
            <NavLink
              to="/reports"
              onClick={handleMobileClose}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all rounded-md",
                isLinkActive("/reports")
                  ? "bg-[#14365e] text-[#c9a55c] font-semibold border-l-[3px] border-[#c9a55c] pl-[15px]"
                  : "text-slate-300 hover:bg-[#14365e] hover:text-white"
              )}
            >
              <span className="text-sm">📈</span>
              <span>Reports Library</span>
            </NavLink>
          </div>

          {/* GROUP: CONFIGURATION */}
          <div className="space-y-1">
            <div className="px-4 py-1 text-[10px] font-bold text-[#6e8aaf] uppercase tracking-wider">
              Configuration
            </div>
            <NavLink
              to="/settings"
              onClick={handleMobileClose}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all rounded-md",
                isLinkActive("/settings")
                  ? "bg-[#14365e] text-[#c9a55c] font-semibold border-l-[3px] border-[#c9a55c] pl-[15px]"
                  : "text-slate-300 hover:bg-[#14365e] hover:text-white"
              )}
            >
              <span className="text-sm">🛠️</span>
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>
      </aside>
    </>
  );
}
