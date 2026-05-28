import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Input } from "@/components/shared/inputs/Input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Landmark, Settings2, ShieldCheck, ListFilter, Save, Building2, Plus, RefreshCw, Power } from "lucide-react";

// Import real API hooks
import { useGetApiServicesAppCategoryGetListPropertyType } from "@/api/generated/category/category";
import { 
  useGetProjects, 
  useCreateOrUpdateProject, 
  useToggleProjectActive 
} from "@/features/properties/hooks/useProperties";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"financial" | "profile" | "categories" | "projects">("financial");

  // Load state from localStorage or default values
  const [fxRate, setFxRate] = useState("25400");
  const [vatRate, setVatRate] = useState("10");
  const [depositMonths, setDepositMonths] = useState("3");
  const [graceDays, setGraceDays] = useState("15");

  const [lessorName, setLessorName] = useState("Công ty TNHH Phát triển Phú Mỹ Hưng");
  const [representative, setRepresentative] = useState("Ông Nguyễn Văn A");
  const [title, setTitle] = useState("Giám đốc Tiếp thị");
  const [taxCode, setTaxCode] = useState("0300123456");
  const [address, setAddress] = useState("Crescent Plaza, 105 Tôn Dật Tiên, Quận 7, TP. HCM");
  const [bankName, setBankName] = useState("Vietcombank - Chi nhánh Nam Sài Gòn");
  const [bankAccount, setBankAccount] = useState("0071001234567");

  const [leasedColor, setLeasedColor] = useState("#10b981");
  const [offeredColor, setOfferedColor] = useState("#3b82f6");
  const [vacantColor, setVacantColor] = useState("#ef4444");
  const [fitoutColor, setFitoutColor] = useState("#f59e0b");
  const [inhouseColor, setInhouseColor] = useState("#6b7280");

  // Fetch real categories / property types from API
  const { data: propertyTypesData } = useGetApiServicesAppCategoryGetListPropertyType();
  const propertyTypes = Array.isArray(propertyTypesData)
    ? propertyTypesData
    : ((propertyTypesData as any)?.data || []);

  // Fetch real projects from API (Retrieve both active and inactive so they can manage all)
  const { data: projectsData, isLoading: isProjectsLoading, refetch: refetchProjects } = useGetProjects({
    SkipCount: 0,
    MaxResultCount: 1000,
  });
  const projects = projectsData?.items || [];

  // API Mutations
  const createProjectMutation = useCreateOrUpdateProject({
    onSuccess: () => {
      toast.success("Đã lưu dự án mới thành công!");
      setNewProjName("");
      setNewProjCode("");
      setNewProjFloors("1");
      refetchProjects();
    }
  });

  const toggleActiveMutation = useToggleProjectActive({
    onSuccess: () => {
      toast.success("Cập nhật trạng thái hoạt động thành công!");
      refetchProjects();
    }
  });

  // New Project Form State
  const [newProjName, setNewProjName] = useState("");
  const [newProjCode, setNewProjCode] = useState("");
  const [newProjFloors, setNewProjFloors] = useState("1");
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  // Set default selected property type once types load
  useEffect(() => {
    if (propertyTypes.length > 0 && !selectedPropertyTypeId) {
      setSelectedPropertyTypeId(String(propertyTypes[0].id));
    }
  }, [propertyTypes, selectedPropertyTypeId]);

  useEffect(() => {
    // Load persisted values
    const loadSetting = (key: string, setter: (val: string) => void) => {
      const val = localStorage.getItem(`pmh_settings_${key}`);
      if (val) setter(val);
    };

    loadSetting("fxRate", setFxRate);
    loadSetting("vatRate", setVatRate);
    loadSetting("depositMonths", setDepositMonths);
    loadSetting("graceDays", setGraceDays);

    loadSetting("lessorName", setLessorName);
    loadSetting("representative", setRepresentative);
    loadSetting("title", setTitle);
    loadSetting("taxCode", setTaxCode);
    loadSetting("address", setAddress);
    loadSetting("bankName", setBankName);
    loadSetting("bankAccount", setBankAccount);

    loadSetting("color_leased", setLeasedColor);
    loadSetting("color_offered", setOfferedColor);
    loadSetting("color_vacant", setVacantColor);
    loadSetting("color_fitout", setFitoutColor);
    loadSetting("color_inhouse", setInhouseColor);
  }, []);

  const handleSave = () => {
    const saveSetting = (key: string, val: string) => {
      localStorage.setItem(`pmh_settings_${key}`, val);
    };

    saveSetting("fxRate", fxRate);
    saveSetting("vatRate", vatRate);
    saveSetting("depositMonths", depositMonths);
    saveSetting("graceDays", graceDays);

    saveSetting("lessorName", lessorName);
    saveSetting("representative", representative);
    saveSetting("title", title);
    saveSetting("taxCode", taxCode);
    saveSetting("address", address);
    saveSetting("bankName", bankName);
    saveSetting("bankAccount", bankAccount);

    saveSetting("color_leased", leasedColor);
    saveSetting("color_offered", offeredColor);
    saveSetting("color_vacant", vacantColor);
    saveSetting("color_fitout", fitoutColor);
    saveSetting("color_inhouse", inhouseColor);

    toast.success("Cấu hình hệ thống đã được lưu thành công!");
  };

  const handleAddProject = () => {
    if (!newProjName.trim() || !newProjCode.trim() || !selectedPropertyTypeId) {
      toast.error("Vui lòng điền đầy đủ tên, mã và loại hình dự án!");
      return;
    }

    createProjectMutation.mutate({
      projectName: newProjName.trim(),
      projectCode: newProjCode.trim().toUpperCase(),
      numberOfFloors: Number(newProjFloors) || 1,
      isActive: true,
      projectTypeIds: [Number(selectedPropertyTypeId)],
    } as any);
  };

  const handleToggleActive = (p: any) => {
    toggleActiveMutation.mutate({
      id: p.id,
      isActive: !p.isActive
    });
  };

  // Helper to check classification
  const getGroupTitle = (p: any) => {
    const maps = p.projectTypeMap || [];
    const isComm = maps.some((m: any) => {
      const name = (m.propertyType?.name || "").toLowerCase();
      const code = (m.propertyType?.code || "").toUpperCase();
      return (
        code.includes('MALL') || name.includes('mall') || name.includes('tttm') || name.includes('thương mại') ||
        code.includes('OFFICE') || name.includes('office') || name.includes('văn phòng') ||
        code.includes('RETAIL') || name.includes('retail') || name.includes('bán lẻ') ||
        code.includes('SHOPHOUSE') || name.includes('shophouse') || name.includes('cửa hàng')
      );
    });
    return isComm ? 'commercial' : 'residential';
  };

  const getPropertyTypeLabel = (p: any) => {
    const maps = p.projectTypeMap || [];
    if (maps.length === 0) return "Chưa phân loại";
    return maps.map((m: any) => m.propertyType?.name || "N/A").join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="🛠️ Cấu hình hệ thống (Settings)"
          description="Thiết lập các tham số tài chính mặc định, thông tin Bên Cho Thuê để kết xuất tài liệu và quản lý danh mục."
        />
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Lưu cấu hình
        </Button>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-border/40 gap-6">
        <button
          onClick={() => setActiveTab("financial")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative ${
            activeTab === "financial" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings2 className="h-4 w-4" />
          Tham số Cho thuê
          {activeTab === "financial" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative ${
            activeTab === "profile" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Landmark className="h-4 w-4" />
          Bên Cho Thuê (Lessor)
          {activeTab === "profile" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative ${
            activeTab === "projects" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Dự án Đô thị (Sidebar)
          {activeTab === "projects" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative ${
            activeTab === "categories" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListFilter className="h-4 w-4" />
          Màu Trạng thái & Danh mục
          {activeTab === "categories" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-card border border-border/30 rounded-dialog p-6 shadow-sm transition-all duration-300">
        {activeTab === "financial" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-foreground border-b border-border/40 pb-2">Cấu hình Quy tắc Tài chính & Đặt cọc</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Tỷ giá USD/VND mặc định (FX Rate)</label>
                <Input type="number" value={fxRate} onChange={(e) => setFxRate(e.target.value)} />
                <p className="text-[10px] text-muted-foreground">Được sử dụng để quy đổi giá trị đặt cọc và tiền thuê từ USD sang VND trong đề xuất chào thuê.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Thuế giá trị gia tăng mặc định (VAT %)</label>
                <Input type="number" value={vatRate} onChange={(e) => setVatRate(e.target.value)} />
                <p className="text-[10px] text-muted-foreground">Thuế suất GTGT áp dụng cho dịch vụ thuê mặt bằng kinh doanh hoặc căn hộ (thông thường là 10%).</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Số tháng tiền cọc mặc định (Lease Deposit Months)</label>
                <Input type="number" value={depositMonths} onChange={(e) => setDepositMonths(e.target.value)} />
                <p className="text-[10px] text-muted-foreground">Số tháng cọc quy định mặc định khi tạo mới một hợp đồng thương mại.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Thời gian ân hạn bàn giao mặc định (Ngày Fit-out miễn phí)</label>
                <Input type="number" value={graceDays} onChange={(e) => setGraceDays(e.target.value)} />
                <p className="text-[10px] text-muted-foreground">Số ngày miễn phí tiền thuê hỗ trợ khách sửa chữa thi công nội thất (mặc định là 15 ngày).</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-foreground border-b border-border/40 pb-2">Thông tin Pháp lý bên Cho Thuê (Lessor Profile)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Tên đầy đủ của Bên Cho Thuê (Tiếng Việt)</label>
                <Input value={lessorName} onChange={(e) => setLessorName(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Người đại diện ký kết</label>
                <Input value={representative} onChange={(e) => setRepresentative(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Chức vụ đại diện</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Mã số thuế</label>
                <Input value={taxCode} onChange={(e) => setTaxCode(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Địa chỉ trụ sở chính</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Ngân hàng thụ hưởng</label>
                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Số tài khoản ngân hàng</label>
                <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
              </div>
            </div>
            <div className="p-3.5 bg-muted/20 border border-border/40 rounded-md text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Thông tin này sẽ được tự động chèn vào các file tài liệu khi kết xuất <b>Thư chào thuê (Offer Letter)</b> và <b>Hợp đồng thuê mặt bằng (Lease Agreement)</b> trong hệ thống.</span>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-foreground border-b border-border/40 pb-2">Màu hiển thị Trạng thái Căn hộ & Mặt bằng</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Màu trạng thái: ĐÃ THUÊ (Leased)</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={leasedColor} onChange={(e) => setLeasedColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <Input value={leasedColor} onChange={(e) => setLeasedColor(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Màu trạng thái: ĐỀ XUẤT (Offered)</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={offeredColor} onChange={(e) => setOfferedColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <Input value={offeredColor} onChange={(e) => setOfferedColor(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Màu trạng thái: TRỐNG (Vacant)</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={vacantColor} onChange={(e) => setVacantColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <Input value={vacantColor} onChange={(e) => setVacantColor(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Màu trạng thái: THI CÔNG (Fit-out)</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={fitoutColor} onChange={(e) => setFitoutColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <Input value={fitoutColor} onChange={(e) => setFitoutColor(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Màu trạng thái: NỘI BỘ (In-house)</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={inhouseColor} onChange={(e) => setInhouseColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <Input value={inhouseColor} onChange={(e) => setInhouseColor(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">Danh sách Dự án Đô thị (Left Menu Navigation)</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Thêm hoặc dừng hoạt động các dự án đô thị và mặt bằng thương mại hiển thị trên Menu chính bên trái.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchProjects()} 
                className="flex items-center gap-1.5 text-xs text-primary"
              >
                <RefreshCw className="h-3 w-3" />
                Tải lại danh sách
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form to Add Project */}
              <div className="space-y-4 border border-border/40 rounded-md p-4 bg-muted/10 h-fit">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-primary" />
                  Thêm dự án mới
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Tên Dự Án</label>
                    <Input 
                      placeholder="Ví dụ: Crescent Mall (CP)" 
                      value={newProjName} 
                      onChange={(e) => setNewProjName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Mã Dự Án (Code)</label>
                    <Input 
                      placeholder="Ví dụ: CP" 
                      value={newProjCode} 
                      onChange={(e) => setNewProjCode(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Số Tầng (NumberOfFloors)</label>
                    <Input 
                      type="number"
                      placeholder="Ví dụ: 5" 
                      value={newProjFloors} 
                      onChange={(e) => setNewProjFloors(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Loại hình & Danh mục (API PropertyType)</label>
                    <select 
                      value={selectedPropertyTypeId} 
                      onChange={(e) => setSelectedPropertyTypeId(e.target.value)} 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {propertyTypes.length === 0 ? (
                        <option value="">Không tìm thấy loại hình...</option>
                      ) : (
                        propertyTypes.map((t: any) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.code})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <Button 
                    onClick={handleAddProject} 
                    disabled={createProjectMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 mt-2"
                  >
                    <Plus className="h-4 w-4" />
                    {createProjectMutation.isPending ? "Đang xử lý..." : "Thêm Dự Án"}
                  </Button>
                </div>
              </div>

              {/* Project List Table */}
              <div className="lg:col-span-2 border border-border/30 rounded-md p-4 bg-card max-h-[500px] overflow-y-auto">
                <h4 className="text-xs font-bold text-foreground mb-3 flex items-center justify-between">
                  <span>Danh sách dự án trong hệ thống ({projects.length})</span>
                  <input
                    type="text"
                    placeholder="Tìm nhanh..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="h-8 px-2.5 rounded-md border border-input bg-background text-xs w-48 font-normal"
                  />
                </h4>
                {isProjectsLoading ? (
                  <div className="py-8 text-center text-xs text-muted-foreground italic">
                    Đang tải danh sách dự án...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {['commercial', 'residential'].map((group) => {
                      const groupTitle = group === 'commercial' ? '🏢 Phân khu Thương mại (Commercial)' : '🏘️ Phân khu Dân cư (Residential)';
                      const filteredProjs = projects.filter(
                        (p: any) =>
                          getGroupTitle(p) === group &&
                          (searchFilter === '' ||
                            p.projectName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            p.projectCode.toLowerCase().includes(searchFilter.toLowerCase()))
                      );

                      if (filteredProjs.length === 0) return null;

                      return (
                        <div key={group} className="space-y-2">
                          <h5 className="text-xs font-bold text-primary border-b border-border/40 pb-1 mt-2">
                            {groupTitle}
                          </h5>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-muted-foreground border-b border-border/30 text-left bg-muted/20">
                                <th className="py-2 px-2 w-20">Mã</th>
                                <th className="py-2 px-2">Tên dự án</th>
                                <th className="py-2 px-2 w-36">Loại hình (API)</th>
                                <th className="py-2 px-2 w-24">Trạng thái</th>
                                <th className="py-2 px-2 text-right w-16">Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredProjs.map((p: any) => (
                                <tr key={p.id} className="border-b border-border/10 hover:bg-muted/10">
                                  <td className="py-2 px-2 font-mono font-bold text-foreground">{p.projectCode}</td>
                                  <td className="py-2 px-2 font-medium text-foreground">{p.projectName}</td>
                                  <td className="py-2 px-2">
                                    <span className="inline-block px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground max-w-[140px] truncate" title={getPropertyTypeLabel(p)}>
                                      {getPropertyTypeLabel(p)}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                                      p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
                                    }`}>
                                      {p.isActive ? "Hoạt động" : "Ngưng"}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleToggleActive(p)}
                                      disabled={toggleActiveMutation.isPending}
                                      className={`h-6 w-6 rounded-md ${
                                        p.isActive 
                                          ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" 
                                          : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                      }`}
                                      title={p.isActive ? "Ngưng hoạt động" : "Kích hoạt"}
                                    >
                                      <Power className="h-3.5 w-3.5" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
