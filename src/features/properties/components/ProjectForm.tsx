import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building, MapPin, Landmark, FileText, Settings, ShieldCheck, DollarSign, Plus, Trash2, Layers, HelpCircle, FileSignature, FolderOpen, Users } from "lucide-react";

import { DetailSheet } from "@/components/shared/dialogs/DetailSheet";
import { Form, FormField, FormLabel } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormDatePicker } from "@/components/shared/forms/FormDatePicker";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shared/inputs/Select";

import { useCreateOrUpdateProject, useGetProject } from "../hooks/useProperties";
import { projectSchema } from "../types";
import type { Project, ProjectFormValues } from "../types";
import { countryEnum } from "@/types";
import { ProjectFloorsTab } from "./ProjectFloorsTab";
import { UnitList } from "./UnitList";
import { InquiryList } from "@/features/inquiries/components/InquiryList";
import { ContractList } from "@/features/contracts/components/ContractList";
import { TabDocument } from "./TabDocument";
import { TabProjectUserPermission } from "./TabProjectUserPermission";

// Import API Queries for Search Dropdowns
import { useGetApiServicesAppCompanyGetAll } from "@/api/generated/company/company";
import {
  useGetApiServicesAppCategoryGetListProjectFacility,
  useGetApiServicesAppCategoryGetListProvince,
  useGetApiServicesAppCategoryGetListDistrict,
  useGetApiServicesAppCategoryGetListPropertyType,
  useGetApiServicesAppCategoryGetListUnitType,
} from "@/api/generated/category/category";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSuccess?: () => void;
  initialTab?: TabType;
}

type TabType = "summary" | "floors" | "units" | "inquiries" | "la" | "documents" | "permissions";

export function ProjectForm({ open, onOpenChange, project, onSuccess, initialTab }: ProjectFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  const { data: fullProject, isLoading: isProjectLoading } = useGetProject(project?.id || undefined, {
    enabled: !!project?.id && open,
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      projectName: "",
      projectCode: "",
      numberOfFloors: 1,
      numberOfUnits: null,
      sortNumber: 0,
      landlordName: "",
      totalSize: null,
      builtDate: "",
      link: "",
      description: "",
      bankInfo: "",
      projectTypeMap: [],
      budgetCode: "",
      projectManagerName: "",

      lessorAddress: "",
      lessorAddressVi: "",
      representativeOf: "",
      representativeOfVi: "",
      lessorPosition: "",
      lessorPositionVi: "",
      lessorCertificateName: "",
      lessorCertificateNameVi: "",
      lessorCertificateNumber: "",
      lessorCertificateNumberVi: "",
      lessorCertificateIssuedBy: "",
      lessorCertificateIssuedByVi: "",
      lessorCertificateIssuedDate: null,
      registerAddress: "",
      registerAddressVi: "",

      representativeBy: "",
      representativeByVi: "",
      representativePosition: "",
      representativePositionVi: "",
      representativeCertificateNumber: "",
      representativeCertificateNumberVi: "",
      representativeExecuteBy: "",
      representativeExecuteByVi: "",
      representativeCertificateEffectiveDate: null,

      bankAccount: "",
      bankName: "",
      bankNameVi: "",
      bankAddress: "",
      bankAddressVi: "",

      optionalBankAccount: "",
      optionalBankName: "",
      optionalBankNameVi: "",
      optionalBankAddress: "",
      optionalBankAddressVi: "",

      managingAgentCompany: "",
      managingAgentCompanyVi: "",
      holderOf: "",
      holderOfVi: "",
      managingAgentCertificateNumber: "",
      managingAgentCertificateNumberVi: "",
      managingAgentCertificateIssuedDate: null,
      managingAgentCertificateIssuedBy: "",
      managingAgentCertificateIssuedByVi: "",

      motorbikeCost: null,
      dedicatedCarCost: null,
      petFees: null,

      landlordId: null,
      propertyManagementId: null,

      projectFacilityIds: [],

      projectAddressText: "",
      projectAddressTextVi: "",
      provinceId: null,
      districtId: null,
    },
  });

  // Queries for Dropdowns
  const { data: companiesData } = useGetApiServicesAppCompanyGetAll({
    MaxResultCount: 100,
    IsActive: true,
  });

  const companyOptions = ((companiesData as any)?.items || []).map((c: any) => ({
    value: c.id,
    label: c.businessName || c.legalName || `Công ty #${c.id}`,
  }));



  const { data: provinces } = useGetApiServicesAppCategoryGetListProvince({
    countryId: countryEnum.vietnam,
  });
  const provinceOptions = ((provinces as any) || []).map((p: any) => ({
    value: p.id,
    label: p.provinceName || "",
  }));

  const provinceId = form.watch("provinceId");
  const { data: districts } = useGetApiServicesAppCategoryGetListDistrict(
    { provinceId: provinceId || undefined },
    { query: { enabled: !!provinceId } }
  );
  const districtOptions = ((districts as any) || []).map((d: any) => ({
    value: d.id,
    label: d.districtName || "",
  }));

  const { data: facilitiesData } = useGetApiServicesAppCategoryGetListProjectFacility();
  const facilityOptions = ((facilitiesData as any) || []).map((f: any) => ({
    id: f.id,
    name: f.name || f.facilityName || "",
  }));

  const { data: propertyTypesData } = useGetApiServicesAppCategoryGetListPropertyType();
  const propertyTypeOptions = ((propertyTypesData as any) || []).map((t: any) => ({
    value: t.id,
    label: t.name || t.propertyTypeName || "",
  }));

  const { data: unitTypesData } = useGetApiServicesAppCategoryGetListUnitType();
  const unitTypeOptions = ((unitTypesData as any) || []).map((u: any) => ({
    value: u.id,
    label: u.name || u.unitTypeName || "",
  }));


  // Reset form values when project changes
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab || "summary");
      if (project) {
        if (isProjectLoading || !fullProject) return;

        // Format ISO Date to YYYY-MM-DD for standard html inputs
        const formatDate = (val?: string) => {
          if (!val) return "";
          return val.substring(0, 10);
        };

        form.reset({
          projectName: fullProject.projectName,
          projectCode: fullProject.projectCode,
          numberOfFloors: fullProject.numberOfFloors,
          numberOfUnits: fullProject.numberOfUnits || null,
          sortNumber: fullProject.sortNumber || 0,
          landlordName: fullProject.landlordName || "",
          totalSize: fullProject.totalSize || null,
          builtDate: fullProject.builtDate || "",
          link: fullProject.link || "",
          description: fullProject.description || "",
          bankInfo: fullProject.bankInfo || "",
          projectTypeMap: fullProject.projectTypeMap || [],
          budgetCode: fullProject.budgetCode || "",
          projectManagerName: fullProject.projectManagerName || "",

          lessorAddress: fullProject.lessorAddress || "",
          lessorAddressVi: fullProject.lessorAddressVi || "",
          representativeOf: fullProject.representativeOf || "",
          representativeOfVi: fullProject.representativeOfVi || "",
          lessorPosition: fullProject.lessorPosition || "",
          lessorPositionVi: fullProject.lessorPositionVi || "",
          lessorCertificateName: fullProject.lessorCertificateName || "",
          lessorCertificateNameVi: fullProject.lessorCertificateNameVi || "",
          lessorCertificateNumber: fullProject.lessorCertificateNumber || "",
          lessorCertificateNumberVi: fullProject.lessorCertificateNumberVi || "",
          lessorCertificateIssuedBy: fullProject.lessorCertificateIssuedBy || "",
          lessorCertificateIssuedByVi: fullProject.lessorCertificateIssuedByVi || "",
          lessorCertificateIssuedDate: formatDate(fullProject.lessorCertificateIssuedDate) as any,
          registerAddress: fullProject.registerAddress || "",
          registerAddressVi: fullProject.registerAddressVi || "",

          representativeBy: fullProject.representativeBy || "",
          representativeByVi: fullProject.representativeByVi || "",
          representativePosition: fullProject.representativePosition || "",
          representativePositionVi: fullProject.representativePositionVi || "",
          representativeCertificateNumber: fullProject.representativeCertificateNumber || "",
          representativeCertificateNumberVi: fullProject.representativeCertificateNumberVi || "",
          representativeExecuteBy: fullProject.representativeExecuteBy || "",
          representativeExecuteByVi: fullProject.representativeExecuteByVi || "",
          representativeCertificateEffectiveDate: formatDate(fullProject.representativeCertificateEffectiveDate) as any,

          bankAccount: fullProject.bankAccount || "",
          bankName: fullProject.bankName || "",
          bankNameVi: fullProject.bankNameVi || "",
          bankAddress: fullProject.bankAddress || "",
          bankAddressVi: fullProject.bankAddressVi || "",

          optionalBankAccount: fullProject.optionalBankAccount || "",
          optionalBankName: fullProject.optionalBankName || "",
          optionalBankNameVi: fullProject.optionalBankNameVi || "",
          optionalBankAddress: fullProject.optionalBankAddress || "",
          optionalBankAddressVi: fullProject.optionalBankAddressVi || "",

          managingAgentCompany: fullProject.managingAgentCompany || "",
          managingAgentCompanyVi: fullProject.managingAgentCompanyVi || "",
          holderOf: fullProject.holderOf || "",
          holderOfVi: fullProject.holderOfVi || "",
          managingAgentCertificateNumber: fullProject.managingAgentCertificateNumber || "",
          managingAgentCertificateNumberVi: fullProject.managingAgentCertificateNumberVi || "",
          managingAgentCertificateIssuedDate: formatDate(fullProject.managingAgentCertificateIssuedDate) as any,
          managingAgentCertificateIssuedBy: fullProject.managingAgentCertificateIssuedBy || "",
          managingAgentCertificateIssuedByVi: fullProject.managingAgentCertificateIssuedByVi || "",

          motorbikeCost: fullProject.motorbikeCost || null,
          dedicatedCarCost: fullProject.dedicatedCarCost || null,
          petFees: fullProject.petFees || null,

          landlordId: fullProject.landlordId || null,
          propertyManagementId: fullProject.propertyManagementId || null,

          projectFacilityIds: fullProject.projectFacilityIds || [],

          projectAddressText: fullProject.projectAddressText || "",
          projectAddressTextVi: fullProject.projectAddressTextVi || "",
          provinceId: fullProject.provinceId || null,
          districtId: fullProject.districtId || null,
        });
      } else {
        form.reset({
          projectName: "",
          projectCode: "",
          numberOfFloors: 1,
          numberOfUnits: null,
          sortNumber: 0,
          landlordName: "",
          totalSize: null,
          builtDate: "",
          link: "",
          description: "",
          bankInfo: "",
          projectTypeMap: [],
          budgetCode: "",
          projectManagerName: "",

          lessorAddress: "",
          lessorAddressVi: "",
          representativeOf: "",
          representativeOfVi: "",
          lessorPosition: "",
          lessorPositionVi: "",
          lessorCertificateName: "",
          lessorCertificateNameVi: "",
          lessorCertificateNumber: "",
          lessorCertificateNumberVi: "",
          lessorCertificateIssuedBy: "",
          lessorCertificateIssuedByVi: "",
          lessorCertificateIssuedDate: null,
          registerAddress: "",
          registerAddressVi: "",

          representativeBy: "",
          representativeByVi: "",
          representativePosition: "",
          representativePositionVi: "",
          representativeCertificateNumber: "",
          representativeCertificateNumberVi: "",
          representativeExecuteBy: "",
          representativeExecuteByVi: "",
          representativeCertificateEffectiveDate: null,

          bankAccount: "",
          bankName: "",
          bankNameVi: "",
          bankAddress: "",
          bankAddressVi: "",

          optionalBankAccount: "",
          optionalBankName: "",
          optionalBankNameVi: "",
          optionalBankAddress: "",
          optionalBankAddressVi: "",

          managingAgentCompany: "",
          managingAgentCompanyVi: "",
          holderOf: "",
          holderOfVi: "",
          managingAgentCertificateNumber: "",
          managingAgentCertificateNumberVi: "",
          managingAgentCertificateIssuedDate: null,
          managingAgentCertificateIssuedBy: "",
          managingAgentCertificateIssuedByVi: "",

          motorbikeCost: null,
          dedicatedCarCost: null,
          petFees: null,

          landlordId: null,
          propertyManagementId: null,

          projectFacilityIds: [],

          projectAddressText: "",
          projectAddressTextVi: "",
          provinceId: null,
          districtId: null,
        });
      }
    }
  }, [project, fullProject, isProjectLoading, open, form, initialTab]);

  const mutation = useCreateOrUpdateProject({
    onSuccess: () => {
      toast.success(project ? "Cập nhật dự án thành công" : "Thêm mới dự án thành công");
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const onSubmit = (values: ProjectFormValues) => {
    // Format dates to ISO strings if filled
    const toISODate = (val?: string | null) => {
      if (!val) return null;
      return new Date(val).toISOString();
    };

    // Format address object array
    const hasAddress = values.projectAddressText || values.projectAddressTextVi || values.provinceId || values.districtId;
    const projectAddress = hasAddress ? [
      {
        id: fullProject?.projectAddressId || undefined,
        projectId: project?.id || undefined,
        countryId: countryEnum.vietnam,
        provinceId: values.provinceId || null,
        districtId: values.districtId || null,
        address: values.projectAddressText || "",
        addressVi: values.projectAddressTextVi || "",
        isActive: true,
      }
    ] : null;

    // Flatten projectTypeMap for the API DTO in pure JS
    const projectTypeMapFlat = (values.projectTypeMap || []).flatMap((row: any) =>
      (row.unitTypeId || []).map((uId: any) => ({
        propertyTypeId: Number(row.propertyTypeId),
        unitTypeId: Number(uId),
      }))
    );



    const apiPayload: any = {
      ...values,
      id: project?.id,
      lessorCertificateIssuedDate: toISODate(values.lessorCertificateIssuedDate),
      representativeCertificateEffectiveDate: toISODate(values.representativeCertificateEffectiveDate),
      managingAgentCertificateIssuedDate: toISODate(values.managingAgentCertificateIssuedDate),
      projectAddress,

      projectTypeMap: projectTypeMapFlat,
    };

    mutation.mutate({
      data: apiPayload,
    });
  };

  const handleFacilityToggle = (facilityId: number, currentIds: number[]) => {
    const nextIds = currentIds.includes(facilityId)
      ? currentIds.filter(id => id !== facilityId)
      : [...currentIds, facilityId];
    form.setValue("projectFacilityIds", nextIds, { shouldDirty: true });
  };

  const projectTabs = project && (
    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/40 dark:bg-black/20 rounded-xl border border-border/10 max-w-full overflow-x-auto no-scrollbar mt-3">
      {[
        { id: "summary", label: "Tổng quan", icon: Building },
        { id: "floors", label: "Sơ đồ tầng", icon: Layers },
        { id: "units", label: "Căn hộ / Mặt bằng", icon: Settings },
        { id: "inquiries", label: "Yêu cầu thuê", icon: HelpCircle },
        { id: "la", label: "Hợp đồng (LA)", icon: FileSignature },
        { id: "documents", label: "Tài liệu", icon: FolderOpen },
        { id: "permissions", label: "Phân quyền", icon: Users },
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${isActive
              ? "bg-background text-primary shadow-sm border border-border/20 font-bold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={project ? `${project.projectName}` : "Thêm mới Dự án"}
      description={project
        ? "Cập nhật và chỉnh sửa thông tin chi tiết hoặc quản lý tầng dự án đô thị."
        : "Nhập thông tin chi tiết dự án đô thị/bất động sản mới để lưu trữ vào hệ thống."}
      formId={activeTab === "summary" ? "project-form" : undefined}
      showSave={activeTab === "summary" && !isProjectLoading}
      showCancel={activeTab === "summary"}
      isPending={mutation.isPending}
      extraHeaderContent={projectTabs}
      onCancel={() => onOpenChange(false)}
    >
      {isProjectLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-muted-foreground animate-pulse">Đang tải chi tiết dự án...</span>
        </div>
      ) : activeTab === "summary" ? (
        <Form {...form}>
          <form id="project-form" onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">

            {/* 1. Basic Info Section */}
            <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                <Building className="h-4 w-4" />
                <span>Thông tin cơ bản</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <FormInput control={form.control} name="projectName" label="Tên dự án" placeholder="Ví dụ: Midtown M7" required />
                </div>
                <FormInput control={form.control} name="projectCode" label="Mã dự án" placeholder="Ví dụ: MD-M7" required disabled={!!project} />
                <FormInput control={form.control} name="numberOfFloors" label="Số tầng/sàn" type="number" placeholder="Ví dụ: 15" required />
                <FormInput control={form.control} name="numberOfUnits" label="Số căn hộ" type="number" placeholder="Ví dụ: 250" />
                <FormInput control={form.control} name="sortNumber" label="Số thứ tự (Sắp xếp)" type="number" placeholder="0" />
                <FormInput control={form.control} name="totalSize" label="Tổng diện tích đất (m²)" type="number" placeholder="Ví dụ: 1200" />
                <FormInput control={form.control} name="builtDate" label="Năm xây dựng" type="number" placeholder="Ví dụ: 2019" />
                <FormInput control={form.control} name="budgetCode" label="Mã ngân sách (Budget)" placeholder="Mã code" />
                <FormInput control={form.control} name="projectManagerName" label="Quản lý dự án" placeholder="Họ và tên" />
                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                  <FormInput control={form.control} name="landlordName" label="Tên chủ đầu tư (Lessor)" placeholder="Tên chủ đầu tư..." />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Landlord Dropdown */}
                <FormSelect
                  control={form.control}
                  name="landlordId"
                  label="Chủ đầu tư (Lessor)"
                  options={companyOptions}
                  placeholder="Tìm kiếm công ty..."
                  searchPlaceholder="Nhập tên công ty..."
                  emptyMessage="Không tìm thấy công ty nào"
                />

                {/* Property Management Dropdown */}
                <FormSelect
                  control={form.control}
                  name="propertyManagementId"
                  label="Đơn vị Quản lý vận hành"
                  options={companyOptions}
                  placeholder="Tìm kiếm công ty..."
                  searchPlaceholder="Nhập tên công ty..."
                  emptyMessage="Không tìm thấy công ty nào"
                />


              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormInput control={form.control} name="link" label="Đường dẫn trang web dự án" placeholder="https://..." />
                <FormTextarea control={form.control} name="description" label="Mô tả dự án" placeholder="Nhập ghi chú hoặc mô tả..." />
              </div>

              {/* Project Facilities Checkbox/Badge List */}
              {facilityOptions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/10">
                  <FormLabel>Tiện ích dự án</FormLabel>
                  <FormField
                    control={form.control as any}
                    name="projectFacilityIds"
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-1.5">
                        {facilityOptions.map((facility: any) => {
                          const isChecked = (field.value || []).includes(facility.id);
                          return (
                            <button
                              type="button"
                              key={facility.id}
                              onClick={() => handleFacilityToggle(facility.id, field.value || [])}
                              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all border ${isChecked
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted"
                                }`}
                            >
                              {facility.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                </div>
              )}
            </div>

            {/* 1.5 Product & Unit Types Mapping Section */}
            <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-border/20 pb-2 mb-1">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Building className="h-4 w-4" />
                  <span>Loại Sản phẩm & Loại Căn hộ (Product & Unit Types)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const current = form.getValues("projectTypeMap") || [];
                    form.setValue("projectTypeMap", [...current, { propertyTypeId: 0, unitTypeId: [] }], { shouldDirty: true });
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-all bg-primary/10 hover:bg-primary/20 px-3.5 py-1.5 rounded-full border border-primary/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm loại liên kết</span>
                </button>
              </div>

              <FormField
                control={form.control as any}
                name="projectTypeMap"
                render={({ field }) => {
                  const rows = field.value || [];
                  return (
                    <div className="space-y-4">
                      {rows.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-border/40 rounded-xl text-xs text-muted-foreground bg-muted/5">
                          Chưa có thiết lập Loại Sản phẩm & Căn hộ nào cho dự án này.
                        </div>
                      ) : (
                        rows.map((row: any, rowIndex: number) => (
                          <div
                            key={rowIndex}
                            className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-border/25 bg-muted/5 dark:bg-white/0.5 shadow-sm relative group transition-all"
                          >
                            {/* Left: Property Type Selector */}
                            <div className="w-full md:w-1/3 space-y-1.5">
                              <label className="text-[11px] uppercase tracking-wider font-extrabold text-muted-foreground">Loại sản phẩm</label>
                              <Select
                                value={row.propertyTypeId ? String(row.propertyTypeId) : undefined}
                                onValueChange={(val) => {
                                  const next = [...rows];
                                  next[rowIndex] = { ...next[rowIndex], propertyTypeId: Number(val) };
                                  field.onChange(next);
                                }}
                                options={propertyTypeOptions}
                              >
                                <SelectTrigger className="w-full h-8 bg-input border border-border rounded-input">
                                  <SelectValue placeholder="Chọn loại sản phẩm..." />
                                </SelectTrigger>
                                <SelectContent showSearch={true}>
                                  {propertyTypeOptions.map((opt: any) => (
                                    <SelectItem key={opt.value} value={String(opt.value)}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Right: Unit Types Toggles */}
                            <div className="w-full md:w-2/3 space-y-1.5">
                              <label className="text-[11px] uppercase tracking-wider font-extrabold text-muted-foreground">Loại căn hộ / mặt bằng liên kết</label>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {unitTypeOptions.map((unitOpt: any) => {
                                  const isChecked = (row.unitTypeId || []).includes(unitOpt.value);
                                  return (
                                    <button
                                      type="button"
                                      key={unitOpt.value}
                                      onClick={() => {
                                        const currentUnits = row.unitTypeId || [];
                                        const nextUnits = currentUnits.includes(unitOpt.value)
                                          ? currentUnits.filter((id: number) => id !== unitOpt.value)
                                          : [...currentUnits, unitOpt.value];
                                        const next = [...rows];
                                        next[rowIndex] = { ...next[rowIndex], unitTypeId: nextUnits };
                                        field.onChange(next);
                                      }}
                                      className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all border ${isChecked
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm font-semibold"
                                        : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted"
                                        }`}
                                    >
                                      {unitOpt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Delete Row Button */}
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(rows.filter((_: any, i: number) => i !== rowIndex));
                              }}
                              className="absolute top-2 right-2 md:relative md:top-auto md:right-auto md:self-end h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                              title="Xóa dòng"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  );
                }}
              />
            </div>

            {/* 2. Project Address Section */}
            <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                <MapPin className="h-4 w-4" />
                <span>Địa chỉ dự án</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Province Dropdown */}
                <FormSelect
                  control={form.control}
                  name="provinceId"
                  label="Tỉnh / Thành phố"
                  options={provinceOptions}
                  onChange={() => {
                    form.setValue("districtId", null);
                  }}
                  placeholder="Chọn Tỉnh / Thành phố"
                  searchPlaceholder="Tìm kiếm..."
                  required
                />

                {/* District Dropdown */}
                <FormSelect
                  control={form.control}
                  name="districtId"
                  label="Quận / Huyện"
                  options={districtOptions}
                  placeholder="Chọn Quận / Huyện"
                  searchPlaceholder="Tìm kiếm..."
                  disabled={!provinceId}
                  required
                />

                <FormInput control={form.control} name="projectAddressTextVi" label="Địa chỉ đầy đủ (Tiếng Việt)" placeholder="Ví dụ: Crescent Residence, Quận 7" required />
                <FormInput control={form.control} name="projectAddressText" label="Địa chỉ đầy đủ (Tiếng Anh)" placeholder="Ví dụ: Crescent Residence, District 7" />
              </div>
            </div>

            {/* 3. Lessor Information Section */}
            <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                <Landmark className="h-4 w-4" />
                <span>Thông tin bên cho thuê (Lessor Information)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput control={form.control} name="lessorAddressVi" label="Địa chỉ công ty (VI)" placeholder="Địa chỉ Bên Cho Thuê" />
                <FormInput control={form.control} name="lessorAddress" label="Địa chỉ công ty (EN)" placeholder="Lessor Address" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput control={form.control} name="representativeOfVi" label="Đại diện cho (VI)" placeholder="Đại diện cho..." />
                <FormInput control={form.control} name="representativeOf" label="Đại diện cho (EN)" placeholder="Representative of..." />
                <FormDatePicker control={form.control} name="lessorCertificateIssuedDate" label="Ngày cấp chứng chỉ" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormInput control={form.control} name="lessorPositionVi" label="Chức vụ người đại diện (VI)" placeholder="Chức vụ" />
                <FormInput control={form.control} name="lessorPosition" label="Chức vụ người đại diện (EN)" placeholder="Lessor Position" />
                <FormInput control={form.control} name="lessorCertificateNameVi" label="Tên GCN đăng ký DN (VI)" placeholder="Tên GCN đăng ký doanh nghiệp" />
                <FormInput control={form.control} name="lessorCertificateName" label="Tên GCN đăng ký DN (EN)" placeholder="e.g. Business registration" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormInput control={form.control} name="lessorCertificateNumberVi" label="Số chứng chỉ đăng ký (VI)" placeholder="Số GCN" />
                <FormInput control={form.control} name="lessorCertificateNumber" label="Số chứng chỉ đăng ký (EN)" placeholder="e.g. 0300... " />
                <FormInput control={form.control} name="lessorCertificateIssuedByVi" label="Nơi cấp chứng chỉ (VI)" placeholder="Nơi cấp" />
                <FormInput control={form.control} name="lessorCertificateIssuedBy" label="Nơi cấp chứng chỉ (EN)" placeholder="Issued by" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput control={form.control} name="registerAddressVi" label="Địa chỉ đăng ký GPKD (VI)" placeholder="Địa chỉ đăng ký" />
                <FormInput control={form.control} name="registerAddress" label="Địa chỉ đăng ký GPKD (EN)" placeholder="Registered Address" />
              </div>
            </div>

            {/* 4. Lessor's Representative Section */}
            <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Thông tin Người đại diện ủy quyền</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormInput control={form.control} name="representativeByVi" label="Tên người đại diện (VI)" placeholder="Tên người đại diện" />
                <FormInput control={form.control} name="representativeBy" label="Tên người đại diện (EN)" placeholder="Representative name" />
                <FormInput control={form.control} name="representativePositionVi" label="Chức vụ (VI)" placeholder="Chức vụ" />
                <FormInput control={form.control} name="representativePosition" label="Chức vụ (EN)" placeholder="Position" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormInput control={form.control} name="representativeCertificateNumberVi" label="Số ủy quyền / LOA (VI)" placeholder="Số ủy quyền" />
                <FormInput control={form.control} name="representativeCertificateNumber" label="Số ủy quyền / LOA (EN)" placeholder="LOA number" />
                <FormInput control={form.control} name="representativeExecuteByVi" label="Người thực hiện ký (VI)" placeholder="Ký bởi" />
                <FormInput control={form.control} name="representativeExecuteBy" label="Người thực hiện ký (EN)" placeholder="e.g. CEO" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormDatePicker control={form.control} name="representativeCertificateEffectiveDate" label="Ngày hiệu lực ủy quyền" />
              </div>
            </div>

            {/* 5. Bank Accounts Section */}
            <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                <DollarSign className="h-4 w-4" />
                <span>Thông tin tài khoản Ngân hàng</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput control={form.control} name="bankAccount" label="Số tài khoản chính" placeholder="Ví dụ: 007100..." />
                <FormInput control={form.control} name="bankNameVi" label="Tên ngân hàng chính (VI)" placeholder="Tên ngân hàng" />
                <FormInput control={form.control} name="bankName" label="Tên ngân hàng chính (EN)" placeholder="Bank Name" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput control={form.control} name="bankAddressVi" label="Địa chỉ ngân hàng chính (VI)" placeholder="Địa chỉ chi nhánh" />
                <FormInput control={form.control} name="bankAddress" label="Địa chỉ ngân hàng chính (EN)" placeholder="Bank Address" />
              </div>

              <div className="pt-2">
                <FormTextarea control={form.control} name="bankInfo" label="Thông tin tài khoản chung (PROJECT_BANKING_INFO)" placeholder="Nhập chi tiết thông tin tài khoản chung của dự án..." />
              </div>

              {/* Optional Bank Info 2 */}
              <div className="pt-4 border-t border-border/10 space-y-4">
                <h5 className="text-xs font-semibold text-muted-foreground">Tài khoản ngân hàng 2 (Phụ / Tùy chọn)</h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormInput control={form.control} name="optionalBankAccount" label="Số tài khoản phụ" placeholder="Ví dụ: 1903..." />
                  <FormInput control={form.control} name="optionalBankNameVi" label="Tên ngân hàng phụ (VI)" placeholder="Tên ngân hàng" />
                  <FormInput control={form.control} name="optionalBankName" label="Tên ngân hàng phụ (EN)" placeholder="Bank Name" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput control={form.control} name="optionalBankAddressVi" label="Địa chỉ ngân hàng phụ (VI)" placeholder="Địa chỉ chi nhánh" />
                  <FormInput control={form.control} name="optionalBankAddress" label="Địa chỉ ngân hàng phụ (EN)" placeholder="Bank Address" />
                </div>
              </div>
            </div>

            {/* 6. Managing Agent Info Section */}
            <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                <FileText className="h-4 w-4" />
                <span>Thông tin Đơn vị đại lý quản lý (Managing Agent)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormInput control={form.control} name="managingAgentCompanyVi" label="Tên công ty đại lý (VI)" placeholder="Tên công ty đại lý quản lý" />
                <FormInput control={form.control} name="managingAgentCompany" label="Tên công ty đại lý (EN)" placeholder="Agent company name" />
                <FormInput control={form.control} name="holderOfVi" label="Đại diện cho (VI)" placeholder="Nắm giữ của..." />
                <FormInput control={form.control} name="holderOf" label="Đại diện cho (EN)" placeholder="Holder of..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormInput control={form.control} name="managingAgentCertificateNumberVi" label="Số chứng chỉ quản lý (VI)" placeholder="Số chứng chỉ đại lý" />
                <FormInput control={form.control} name="managingAgentCertificateNumber" label="Số chứng chỉ quản lý (EN)" placeholder="Agent cert number" />
                <FormInput control={form.control} name="managingAgentCertificateIssuedByVi" label="Nơi cấp chứng chỉ (VI)" placeholder="Nơi cấp" />
                <FormInput control={form.control} name="managingAgentCertificateIssuedBy" label="Nơi cấp chứng chỉ (EN)" placeholder="Issued by" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormDatePicker control={form.control} name="managingAgentCertificateIssuedDate" label="Ngày cấp chứng chỉ đại lý" />
              </div>
            </div>

            {/* 7. Parking and Pet Fees Section */}
            <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                <Settings className="h-4 w-4" />
                <span>Phí đỗ xe & Thú cưng</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput control={form.control} name="motorbikeCost" label="Phí gửi xe máy (VND/tháng)" type="number" placeholder="Ví dụ: 120000" />
                <FormInput control={form.control} name="dedicatedCarCost" label="Phí gửi ô tô (VND/tháng)" type="number" placeholder="Ví dụ: 1200000" />
                <FormInput control={form.control} name="petFees" label="Phí nuôi thú cưng (VND)" type="number" placeholder="Ví dụ: 50000" />
              </div>
            </div>

          </form>
        </Form>
      ) : activeTab === "floors" ? (
        project && <ProjectFloorsTab projectId={project.id} />
      ) : activeTab === "units" ? (
        project && <UnitList projectId={project.id} />
      ) : activeTab === "inquiries" ? (
        project && <InquiryList projectId={project.id} />
      ) : activeTab === "la" ? (
        project && <ContractList projectId={project.id} />
      ) : activeTab === "documents" ? (
        project && <TabDocument inputId={String(project.id)} />
      ) : activeTab === "permissions" ? (
        project && <TabProjectUserPermission projectId={project.id} />
      ) : null}
    </DetailSheet>
  );
}
