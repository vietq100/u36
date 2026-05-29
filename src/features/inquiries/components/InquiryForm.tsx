import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DetailSheet } from "@/components/shared/dialogs/DetailSheet";
import { Form, FormField, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormRichTextEditor } from "@/components/shared/forms/FormRichTextEditor";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, MapPin, Compass, FileText, HelpCircle } from "lucide-react";
import { countryEnum } from "@/types";

import { useCreateOrUpdateInquiry } from "../hooks/useInquiries";
import { useInquiriesStore } from "../stores/useInquiriesStore";
import { usePropertiesStore } from "@/features/properties/stores/usePropertiesStore";
import { useClientsStore } from "@/features/clients/stores/useClientsStore";
import { TabDocument } from "@/features/properties/components/TabDocument";
import { InquiryActivitiesTab } from "./activities/InquiryActivitiesTab";
import { InquiryProgressBar } from "./InquiryProgressBar";
import { InquiryQuickActions } from "./InquiryQuickActions";
import { InquiryMatchingTab } from "./InquiryMatchingTab";
import { inquirySchema } from "../types";
import type { Inquiry, InquiryFormValues } from "../types";

// Import API Queries for Dropdowns
import {
  useGetApiServicesAppCategoryGetListInquirySource,
  useGetApiServicesAppCategoryGetListInquiryCategory,
  useGetApiServicesAppCategoryGetListPropertyType,
  useGetApiServicesAppCategoryGetListUnitType,
  useGetApiServicesAppCategoryGetListFacing,
  useGetApiServicesAppCategoryGetListView,
  useGetApiServicesAppCategoryGetListInquiryServiceType,
  useGetApiServicesAppCategoryGetListUnitFacility,
  useGetApiServicesAppCategoryGetListProvince,
  useGetApiServicesAppCategoryGetListDistrict,
} from "@/api/generated/category/category";

import { useGetApiServicesAppUnitGetMatchingUnit } from "@/api/generated/unit/unit";

interface InquiryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry?: Inquiry | null;
  onSuccess?: () => void;
  defaultProjectId?: number;
}

export function InquiryForm({ open, onOpenChange, inquiry, onSuccess, defaultProjectId }: InquiryFormProps) {
  const statuses = useInquiriesStore((state) => state.statuses);
  const rawProjects = usePropertiesStore((state) => state.projects);
  const rawCompanies = useClientsStore((state) => state.companies);
  const rawContacts = useClientsStore((state) => state.contacts);

  const [activeTab, setActiveTab] = useState<"info" | "activities" | "matching" | "documents">("info");

  const projects = useMemo(() => rawProjects.filter(p => p.isActive), [rawProjects]);
  const companies = useMemo(() => rawCompanies.filter(c => c.isActive), [rawCompanies]);
  const contacts = useMemo(() => rawContacts.filter(c => c.isActive), [rawContacts]);

  // Reset tab to info whenever sheet opens
  useEffect(() => {
    if (open) {
      setActiveTab("info");
    }
  }, [open]);

  // Form setup
  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema) as any,
    defaultValues: {
      inquiryName: "",
      contactId: 0,
      companyId: 0,
      projectIds: [],
      fromPrice: 0,
      toPrice: 0,
      fromSize: 0,
      toSize: 0,
      statusId: 1,
      description: "",

      // Additional fields from Pico/Leasing source
      sourceId: 0,
      statusDetailId: 0,
      occupierName: "",
      moveInDate: "",
      leaseTerm: 0,
      facingIds: [],
      viewIds: [],
      serviceTypeIds: [],
      unitFacilityIds: [],
      propertyTypeIds: [],
      unitTypeIds: [],
      provinceId: 0,
      districtId: 0,
      addressText: "",
    },
  });

  // Load backend dropdowns
  // 1. Inquiry sources
  const { data: inquirySources } = useGetApiServicesAppCategoryGetListInquirySource();
  const sourceOptions = ((inquirySources as any) || []).map((s: any) => ({
    value: s.id,
    label: s.name || s.sourceName || "",
  }));

  // 2. Inquiry categories (for subStages)
  const { data: inquiryCategories } = useGetApiServicesAppCategoryGetListInquiryCategory();
  
  // Watch statusId to filter substages
  const selectedStatusId = form.watch("statusId");
  const subStageOptions = useMemo(() => {
    return ((inquiryCategories as any) || [])
      .filter((c: any) => c.parentId === selectedStatusId)
      .map((c: any) => ({
        value: c.id,
        label: c.name || "",
      }));
  }, [inquiryCategories, selectedStatusId]);

  // 3. Property Types
  const { data: propertyTypes } = useGetApiServicesAppCategoryGetListPropertyType();
  const propertyTypeOptions = ((propertyTypes as any) || []).map((t: any) => ({
    id: t.id,
    name: t.name || t.propertyTypeName || "",
  }));

  // 4. Unit Types
  const { data: unitTypes } = useGetApiServicesAppCategoryGetListUnitType();
  const unitTypeOptions = ((unitTypes as any) || []).map((u: any) => ({
    id: u.id,
    name: u.name || u.unitTypeName || "",
  }));

  // 5. Facing
  const { data: facings } = useGetApiServicesAppCategoryGetListFacing();
  const facingOptions = ((facings as any) || []).map((f: any) => ({
    id: f.id,
    name: f.name || f.facingName || "",
  }));

  // 6. Views
  const { data: views } = useGetApiServicesAppCategoryGetListView();
  const viewOptions = ((views as any) || []).map((v: any) => ({
    id: v.id,
    name: v.name || v.viewName || "",
  }));

  // 7. Unit Service Types
  const { data: serviceTypes } = useGetApiServicesAppCategoryGetListInquiryServiceType();
  const serviceTypeOptions = ((serviceTypes as any) || []).map((s: any) => ({
    id: s.id,
    name: s.name || s.serviceTypeName || "",
  }));

  // 8. Unit Facilities
  const { data: unitFacilities } = useGetApiServicesAppCategoryGetListUnitFacility();
  const facilityOptions = ((unitFacilities as any) || []).map((f: any) => ({
    id: f.id,
    name: f.name || f.facilityName || "",
  }));

  // 9. Location (Provinces & Districts)
  const { data: provinces } = useGetApiServicesAppCategoryGetListProvince({
    countryId: countryEnum.vietnam,
  });
  const provinceOptions = ((provinces as any) || []).map((p: any) => ({
    value: p.id,
    label: p.provinceName || "",
  }));

  const selectedProvinceId = form.watch("provinceId");
  const { data: districts } = useGetApiServicesAppCategoryGetListDistrict(
    { provinceId: selectedProvinceId || undefined },
    { query: { enabled: !!selectedProvinceId } }
  );
  const districtOptions = ((districts as any) || []).map((d: any) => ({
    value: d.id,
    label: d.districtName || "",
  }));

  // Match Units Query
  const { data: matchingUnitsData, isLoading: isMatchingLoading } = useGetApiServicesAppUnitGetMatchingUnit(
    { InquiryId: inquiry?.id },
    { query: { enabled: !!inquiry?.id && activeTab === "matching" } }
  );

  const contactOptions = contacts.map(c => ({ value: c.id, label: `${c.contactName} (${c.phone})` }));
  const companyOptions = [
    { value: 0, label: "-- Không liên kết Doanh nghiệp --" },
    ...companies.map(c => ({ value: c.id, label: c.companyName }))
  ];

  // Populate data when form opens/resets
  useEffect(() => {
    if (inquiry) {
      form.reset({
        inquiryName: inquiry.inquiryName,
        contactId: inquiry.contactId,
        companyId: inquiry.companyId || 0,
        projectIds: inquiry.projectIds || (inquiry.projectId ? [inquiry.projectId] : []),
        fromPrice: inquiry.fromPrice || 0,
        toPrice: inquiry.toPrice || inquiry.askingRent || 0,
        fromSize: inquiry.fromSize || 0,
        toSize: inquiry.toSize || inquiry.actualSize || 0,
        statusId: inquiry.statusId,
        description: inquiry.description || "",
        
        // New fields
        sourceId: inquiry.sourceId || 0,
        statusDetailId: inquiry.statusDetailId || 0,
        occupierName: inquiry.occupierName || "",
        moveInDate: inquiry.moveInDate ? inquiry.moveInDate.split("T")[0] : "",
        leaseTerm: inquiry.leaseTerm || 0,
        facingIds: inquiry.facingIds || [],
        viewIds: inquiry.viewIds || [],
        serviceTypeIds: inquiry.serviceTypeIds || [],
        unitFacilityIds: inquiry.unitFacilityIds || [],
        propertyTypeIds: inquiry.propertyTypeIds || [],
        unitTypeIds: inquiry.unitTypeIds || [],
        provinceId: inquiry.provinceId || 0,
        districtId: inquiry.districtId || 0,
        addressText: inquiry.addressText || "",
      });
    } else {
      form.reset({
        inquiryName: "",
        contactId: contacts[0]?.id || 0,
        companyId: 0,
        projectIds: defaultProjectId ? [defaultProjectId] : projects[0]?.id ? [projects[0].id] : [],
        fromPrice: 0,
        toPrice: 1000,
        fromSize: 0,
        toSize: 75,
        statusId: 1,
        description: "",

        // New fields
        sourceId: 0,
        statusDetailId: 0,
        occupierName: "",
        moveInDate: "",
        leaseTerm: 0,
        facingIds: [],
        viewIds: [],
        serviceTypeIds: [],
        unitFacilityIds: [],
        propertyTypeIds: [],
        unitTypeIds: [],
        provinceId: 0,
        districtId: 0,
        addressText: "",
      });
    }
  }, [inquiry, open, form, contacts, projects, defaultProjectId]);

  const mutation = useCreateOrUpdateInquiry({
    onSuccess: () => {
      toast.success(inquiry ? "Cập nhật yêu cầu thành công!" : "Ghi nhận yêu cầu thành công!");
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const onSubmit = (values: InquiryFormValues) => {
    mutation.mutate({
      id: inquiry?.id,
      data: values,
    });
  };

  const handleMarkStatus = (newStatusId: number) => {
    if (!inquiry) return;
    form.setValue("statusId", newStatusId);
    
    mutation.mutate({
      id: inquiry.id,
      data: {
        ...form.getValues(),
        statusId: newStatusId,
      },
    });
  };

  const handleToggleId = (id: number, currentIds: number[], fieldName: "facingIds" | "viewIds" | "serviceTypeIds" | "unitFacilityIds" | "propertyTypeIds" | "unitTypeIds") => {
    const nextIds = currentIds.includes(id)
      ? currentIds.filter(x => x !== id)
      : [...currentIds, id];
    form.setValue(fieldName, nextIds, { shouldDirty: true });
  };

  // Status Bar (Line Progress)
  const progressBar = inquiry ? (
    <InquiryProgressBar currentStatusId={inquiry.statusId} statuses={statuses} />
  ) : null;

  // Actions Bar
  const quickActions = inquiry ? (
    <InquiryQuickActions 
      statusId={inquiry.statusId} 
      onMarkStatus={handleMarkStatus} 
      isPending={mutation.isPending} 
    />
  ) : null;

  // Header tabs selector
  const headerTabs = inquiry ? (
    <TabsList variant="pills" className="mt-3">
      {[
        { id: "info", label: "Yêu cầu chi tiết", icon: User },
        { id: "activities", label: "Nhật ký hoạt động (Activities)", icon: HelpCircle },
        { id: "matching", label: "Khớp mặt bằng (Unit Matching)", icon: Building2 },
        { id: "documents", label: "Tài liệu đính kèm", icon: FileText },
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <TabsTrigger
            type="button"
            key={tab.id}
            value={tab.id}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
            <span>{tab.label}</span>
          </TabsTrigger>
        );
      })}
    </TabsList>
  ) : null;

  return (
    <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
      <DetailSheet
        open={open}
        onOpenChange={onOpenChange}
        title={inquiry ? inquiry.inquiryName : "Ghi nhận yêu cầu hỗ trợ mới"}
        description={inquiry ? "Xem chi tiết yêu cầu, quản lý tệp tin đính kèm hoặc tìm kiếm căn hộ phù hợp." : "Điền chi tiết nhu cầu tìm kiếm mặt bằng, diện tích, ngân sách và thông tin liên hệ của khách hàng."}
        formId={activeTab === "info" ? "inquiry-form" : undefined}
        showSave={activeTab === "info"}
        showCancel={activeTab === "info"}
        isPending={mutation.isPending}
        extraHeaderContent={headerTabs}
        onCancel={() => onOpenChange(false)}
      >
        {activeTab === "info" ? (
          <Form {...form}>
            <form id="inquiry-form" onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
              
              {/* Line Progress */}
              {progressBar}

              {/* Status functional buttons */}
              {quickActions}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* COLUMN 1: Client & General Info */}
                <div className="space-y-4">
                  <div className="border border-border/30 bg-muted/5 dark:bg-white/1 rounded-dialog p-4 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                      <User className="h-4 w-4" />
                      <span>Thông tin khách hàng & Đối tác</span>
                    </div>
                    
                    <FormSelect
                      control={form.control}
                      name="contactId"
                      label="Khách hàng yêu cầu (Liên hệ đại diện)"
                      options={contactOptions}
                      placeholder="Tìm theo họ tên hoặc số điện thoại..."
                      disabled={mutation.isPending}
                    />

                    <FormSelect
                      control={form.control}
                      name="companyId"
                      label="Doanh nghiệp liên kết (Tùy chọn)"
                      options={companyOptions}
                      placeholder="Tìm và chọn doanh nghiệp đối tác..."
                      disabled={mutation.isPending}
                    />

                    <FormSelect
                      control={form.control}
                      name="sourceId"
                      label="Nguồn yêu cầu"
                      options={sourceOptions}
                      placeholder="Chọn nguồn tiếp nhận..."
                      disabled={mutation.isPending}
                    />
                  </div>

                  <div className="border border-border/30 bg-muted/5 dark:bg-white/1 rounded-dialog p-4 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                      <Building2 className="h-4 w-4" />
                      <span>Chi tiết yêu cầu & Trạng thái</span>
                    </div>

                    <FormInput
                      control={form.control}
                      name="inquiryName"
                      label="Tên yêu cầu / Tiêu đề tìm kiếm"
                      placeholder="Ví dụ: Nhu cầu thuê Shophouse kinh doanh cafe - Chị Mai"
                      required
                      disabled={mutation.isPending}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormSelect
                        control={form.control}
                        name="statusId"
                        label="Trạng thái xử lý"
                        options={statuses.map((s) => ({
                          value: s.id,
                          label: (
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                              {s.name}
                            </div>
                          ),
                        }))}
                        placeholder="Chọn trạng thái"
                        disabled={mutation.isPending}
                      />

                      <FormSelect
                        control={form.control}
                        name="statusDetailId"
                        label="Chi tiết trạng thái"
                        options={subStageOptions}
                        placeholder="Chọn chi tiết..."
                        disabled={mutation.isPending}
                      />
                    </div>

                    <FormInput
                      control={form.control}
                      name="occupierName"
                      label="Người sử dụng thực tế (Tên Occupier)"
                      placeholder="Nhập tên người sử dụng..."
                      disabled={mutation.isPending}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        control={form.control}
                        name="moveInDate"
                        label="Ngày chuyển vào"
                        type="date"
                        disabled={mutation.isPending}
                      />

                      <FormInput
                        control={form.control}
                        name="leaseTerm"
                        label="Thời hạn thuê mong muốn (Tháng)"
                        type="number"
                        disabled={mutation.isPending}
                      />
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: Preferences, Budget & Location */}
                <div className="space-y-4">
                  <div className="border border-border/30 bg-muted/5 dark:bg-white/1 rounded-dialog p-4 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span>Diện tích, Ngân sách & Vị trí</span>
                    </div>

                    <FormField
                      control={form.control}
                      name="projectIds"
                      render={({ field }) => (
                        <div className="space-y-2">
                          <FormLabel className="text-xs font-semibold text-foreground">Dự án khu đô thị quan tâm</FormLabel>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[120px] overflow-y-auto p-3 border border-border/40 rounded-lg bg-muted/10">
                            {projects.map((project) => {
                              const isChecked = field.value?.includes(project.id);
                              return (
                                <label
                                  key={project.id}
                                  className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer select-none"
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...(field.value || []), project.id]);
                                      } else {
                                        field.onChange((field.value || []).filter((id: number) => id !== project.id));
                                      }
                                    }}
                                    disabled={mutation.isPending || !!defaultProjectId}
                                  />
                                  <span>{project.projectName}</span>
                                </label>
                              );
                            })}
                          </div>
                          {form.formState.errors.projectIds && (
                            <p className="text-[10px] font-semibold text-destructive mt-1">
                              {form.formState.errors.projectIds.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    {propertyTypeOptions.length > 0 && (
                      <div className="space-y-2">
                        <FormLabel>Loại hình BĐS</FormLabel>
                        <FormField
                          control={form.control}
                          name="propertyTypeIds"
                          render={({ field }) => (
                            <div className="flex flex-wrap gap-1.5">
                              {propertyTypeOptions.map((opt: any) => {
                                const isChecked = (field.value || []).includes(opt.id);
                                return (
                                  <button
                                    type="button"
                                    key={opt.id}
                                    onClick={() => handleToggleId(opt.id, field.value || [], "propertyTypeIds")}
                                    className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all border ${isChecked
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted"
                                      }`}
                                  >
                                    {opt.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        />
                      </div>
                    )}

                    {unitTypeOptions.length > 0 && (
                      <div className="space-y-2">
                        <FormLabel>Kiểu thiết kế (Unit Type)</FormLabel>
                        <FormField
                          control={form.control}
                          name="unitTypeIds"
                          render={({ field }) => (
                            <div className="flex flex-wrap gap-1.5">
                              {unitTypeOptions.map((opt: any) => {
                                const isChecked = (field.value || []).includes(opt.id);
                                return (
                                  <button
                                    type="button"
                                    key={opt.id}
                                    onClick={() => handleToggleId(opt.id, field.value || [], "unitTypeIds")}
                                    className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all border ${isChecked
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted"
                                      }`}
                                  >
                                    {opt.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        control={form.control}
                        name="fromPrice"
                        label="Ngân sách tối thiểu (USD)"
                        type="number"
                        disabled={mutation.isPending}
                      />
                      <FormInput
                        control={form.control}
                        name="toPrice"
                        label="Ngân sách tối đa (USD)"
                        type="number"
                        disabled={mutation.isPending}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        control={form.control}
                        name="fromSize"
                        label="Diện tích tối thiểu (m²)"
                        type="number"
                        disabled={mutation.isPending}
                      />
                      <FormInput
                        control={form.control}
                        name="toSize"
                        label="Diện tích tối đa (m²)"
                        type="number"
                        disabled={mutation.isPending}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormSelect
                        control={form.control}
                        name="provinceId"
                        label="Tỉnh/Thành phố"
                        options={provinceOptions}
                        placeholder="Chọn Tỉnh/TP..."
                        disabled={mutation.isPending}
                      />
                      <FormSelect
                        control={form.control}
                        name="districtId"
                        label="Quận/Huyện"
                        options={districtOptions}
                        placeholder="Chọn Quận/Huyện..."
                        disabled={mutation.isPending || !selectedProvinceId}
                      />
                    </div>

                    <FormInput
                      control={form.control}
                      name="addressText"
                      label="Vị trí chi tiết"
                      placeholder="Nhập ngõ ngách, tên đường..."
                      disabled={mutation.isPending}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Technical Features & Amenities */}
              <div className="border border-border/30 bg-muted/5 dark:bg-white/1 rounded-dialog p-4 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                  <Compass className="h-4 w-4" />
                  <span>Đặc điểm kỹ thuật & Tiện ích đi kèm</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {facingOptions?.length > 0 && (
                      <div className="space-y-2">
                        <FormLabel>Hướng cửa / Hướng ban công</FormLabel>
                        <FormField
                          control={form.control}
                          name="facingIds"
                          render={({ field }) => (
                            <div className="flex flex-wrap gap-1.5">
                              {facingOptions.map((opt: any) => {
                                const isChecked = (field.value || []).includes(opt.id);
                                return (
                                  <button
                                    type="button"
                                    key={opt.id}
                                    onClick={() => handleToggleId(opt.id, field.value || [], "facingIds")}
                                    className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all border ${isChecked
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted"
                                      }`}
                                  >
                                    {opt.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        />
                      </div>
                    )}

                    {viewOptions?.length > 0 && (
                      <div className="space-y-2">
                        <FormLabel>Hướng tầm nhìn (View)</FormLabel>
                        <FormField
                          control={form.control}
                          name="viewIds"
                          render={({ field }) => (
                            <div className="flex flex-wrap gap-1.5">
                              {viewOptions.map((opt: any) => {
                                const isChecked = (field.value || []).includes(opt.id);
                                return (
                                  <button
                                    type="button"
                                    key={opt.id}
                                    onClick={() => handleToggleId(opt.id, field.value || [], "viewIds")}
                                    className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all border ${isChecked
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted"
                                      }`}
                                  >
                                    {opt.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {serviceTypeOptions?.length > 0 && (
                      <div className="space-y-2">
                        <FormLabel>Loại hình Dịch vụ (Service Type)</FormLabel>
                        <FormField
                          control={form.control}
                          name="serviceTypeIds"
                          render={({ field }) => (
                            <div className="flex flex-wrap gap-1.5">
                              {serviceTypeOptions.map((opt: any) => {
                                const isChecked = (field.value || []).includes(opt.id);
                                return (
                                  <button
                                    type="button"
                                    key={opt.id}
                                    onClick={() => handleToggleId(opt.id, field.value || [], "serviceTypeIds")}
                                    className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all border ${isChecked
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted"
                                      }`}
                                  >
                                    {opt.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        />
                      </div>
                    )}

                    {facilityOptions?.length > 0 && (
                      <div className="space-y-2">
                        <FormLabel>Yêu cầu tiện ích đi kèm (Facilities)</FormLabel>
                        <FormField
                          control={form.control}
                          name="unitFacilityIds"
                          render={({ field }) => (
                            <div className="flex flex-wrap gap-1.5">
                              {facilityOptions.map((opt: any) => {
                                const isChecked = (field.value || []).includes(opt.id);
                                return (
                                  <button
                                    type="button"
                                    key={opt.id}
                                    onClick={() => handleToggleId(opt.id, field.value || [], "unitFacilityIds")}
                                    className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all border ${isChecked
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted"
                                      }`}
                                  >
                                    {opt.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <FormRichTextEditor
                control={form.control}
                name="description"
                label="Chi tiết nhu cầu & Lịch sử trao đổi"
                disabled={mutation.isPending}
              />

            </form>
          </Form>
        ) : activeTab === "activities" && inquiry ? (
          <InquiryActivitiesTab inquiryId={inquiry.id} />
        ) : activeTab === "matching" ? (
          <InquiryMatchingTab isLoading={isMatchingLoading} matchingUnits={(matchingUnitsData as any) || []} />
        ) : (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground">Tài liệu hồ sơ đính kèm</h3>
            <p className="text-xs text-muted-foreground">Quản lý và lưu trữ các tệp hợp đồng, đề xuất hoặc hình ảnh mặt bằng của khách hàng.</p>
            
            {inquiry?.uniqueId ? (
              <TabDocument inputId={inquiry.uniqueId} />
            ) : (
              <div className="text-center py-10 text-xs text-muted-foreground">
                Đang chuẩn bị mã định danh tài liệu...
              </div>
            )}
          </div>
        )}
      </DetailSheet>
    </Tabs>
  );
}
