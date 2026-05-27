import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building, MapPin, Landmark, FileText, Settings, ShieldCheck, DollarSign } from "lucide-react";

import { DetailSheet } from "@/components/shared/DetailSheet";
import { Form, FormField, FormLabel } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormCombobox } from "@/components/shared/forms/FormCombobox";
import { FormDatePicker } from "@/components/shared/forms/FormDatePicker";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";

import { useCreateOrUpdateProject } from "../hooks/useProperties";
import { projectSchema } from "../types";
import type { Project, ProjectFormValues } from "../types";
import { ProjectFloorsTab } from "./ProjectFloorsTab";

// Import API Queries for Search Dropdowns
import { useGetApiServicesAppCompanyGetAll } from "@/api/generated/company/company";
import { useGetApiServicesAppContactGetAll } from "@/api/generated/contact/contact";
import {
  useGetApiServicesAppLocationsGetListProvince,
  useGetApiServicesAppLocationsGetListDistrict,
} from "@/api/generated/locations/locations";
import { useGetApiServicesAppCategoryGetListProjectFacility } from "@/api/generated/category/category";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSuccess?: () => void;
}

type TabType = "summary" | "floors";

export function ProjectForm({ open, onOpenChange, project, onSuccess }: ProjectFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      projectName: "",
      projectCode: "",
      numberOfFloors: 1,
      sortNumber: 0,
      landlordName: "",
      totalSize: null,
      builtDate: "",
      link: "",
      description: "",
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
      contactId: null,
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

  const { data: contactsData } = useGetApiServicesAppContactGetAll({
    MaxResultCount: 100,
    IsActive: true,
  });

  const contactOptions = ((contactsData as any)?.items || []).map((c: any) => ({
    value: c.id,
    label: c.contactName || `Liên hệ #${c.id}`,
  }));

  const { data: provinces } = useGetApiServicesAppLocationsGetListProvince();
  const provinceOptions = ((provinces as any) || []).map((p: any) => ({
    value: p.id,
    label: p.provinceName || "",
  }));

  const provinceId = form.watch("provinceId");
  const { data: districts } = useGetApiServicesAppLocationsGetListDistrict(
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


  // Reset form values when project changes
  useEffect(() => {
    if (open) {
      setActiveTab("summary");
      if (project) {
        // Format ISO Date to YYYY-MM-DD for standard html inputs
        const formatDate = (val?: string) => {
          if (!val) return "";
          return val.substring(0, 10);
        };

        form.reset({
          projectName: project.projectName,
          projectCode: project.projectCode,
          numberOfFloors: project.numberOfFloors,
          sortNumber: project.sortNumber || 0,
          landlordName: project.landlordName || "",
          totalSize: project.totalSize || null,
          builtDate: project.builtDate || "",
          link: project.link || "",
          description: project.description || "",
          budgetCode: project.budgetCode || "",
          projectManagerName: project.projectManagerName || "",

          lessorAddress: project.lessorAddress || "",
          lessorAddressVi: project.lessorAddressVi || "",
          representativeOf: project.representativeOf || "",
          representativeOfVi: project.representativeOfVi || "",
          lessorPosition: project.lessorPosition || "",
          lessorPositionVi: project.lessorPositionVi || "",
          lessorCertificateName: project.lessorCertificateName || "",
          lessorCertificateNameVi: project.lessorCertificateNameVi || "",
          lessorCertificateNumber: project.lessorCertificateNumber || "",
          lessorCertificateNumberVi: project.lessorCertificateNumberVi || "",
          lessorCertificateIssuedBy: project.lessorCertificateIssuedBy || "",
          lessorCertificateIssuedByVi: project.lessorCertificateIssuedByVi || "",
          lessorCertificateIssuedDate: formatDate(project.lessorCertificateIssuedDate) as any,
          registerAddress: project.registerAddress || "",
          registerAddressVi: project.registerAddressVi || "",

          representativeBy: project.representativeBy || "",
          representativeByVi: project.representativeByVi || "",
          representativePosition: project.representativePosition || "",
          representativePositionVi: project.representativePositionVi || "",
          representativeCertificateNumber: project.representativeCertificateNumber || "",
          representativeCertificateNumberVi: project.representativeCertificateNumberVi || "",
          representativeExecuteBy: project.representativeExecuteBy || "",
          representativeExecuteByVi: project.representativeExecuteByVi || "",
          representativeCertificateEffectiveDate: formatDate(project.representativeCertificateEffectiveDate) as any,

          bankAccount: project.bankAccount || "",
          bankName: project.bankName || "",
          bankNameVi: project.bankNameVi || "",
          bankAddress: project.bankAddress || "",
          bankAddressVi: project.bankAddressVi || "",

          optionalBankAccount: project.optionalBankAccount || "",
          optionalBankName: project.optionalBankName || "",
          optionalBankNameVi: project.optionalBankNameVi || "",
          optionalBankAddress: project.optionalBankAddress || "",
          optionalBankAddressVi: project.optionalBankAddressVi || "",

          managingAgentCompany: project.managingAgentCompany || "",
          managingAgentCompanyVi: project.managingAgentCompanyVi || "",
          holderOf: project.holderOf || "",
          holderOfVi: project.holderOfVi || "",
          managingAgentCertificateNumber: project.managingAgentCertificateNumber || "",
          managingAgentCertificateNumberVi: project.managingAgentCertificateNumberVi || "",
          managingAgentCertificateIssuedDate: formatDate(project.managingAgentCertificateIssuedDate) as any,
          managingAgentCertificateIssuedBy: project.managingAgentCertificateIssuedBy || "",
          managingAgentCertificateIssuedByVi: project.managingAgentCertificateIssuedByVi || "",

          motorbikeCost: project.motorbikeCost || null,
          dedicatedCarCost: project.dedicatedCarCost || null,
          petFees: project.petFees || null,

          landlordId: project.landlordId || null,
          propertyManagementId: project.propertyManagementId || null,
          contactId: project.contactId || null,
          projectFacilityIds: project.projectFacilityIds || [],
          
          projectAddressText: project.projectAddressText || "",
          projectAddressTextVi: project.projectAddressTextVi || "",
          provinceId: project.provinceId || null,
          districtId: project.districtId || null,
        });
      } else {
        form.reset({
          projectName: "",
          projectCode: "",
          numberOfFloors: 1,
          sortNumber: 0,
          landlordName: "",
          totalSize: null,
          builtDate: "",
          link: "",
          description: "",
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
          contactId: null,
          projectFacilityIds: [],
          
          projectAddressText: "",
          projectAddressTextVi: "",
          provinceId: null,
          districtId: null,
        });
      }
    }
  }, [project, open, form]);

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
        countryId: 1, // Vietnam
        provinceId: values.provinceId || null,
        districtId: values.districtId || null,
        address: values.projectAddressText || "",
        addressVi: values.projectAddressTextVi || "",
        isActive: true,
      }
    ] : null;

    // Map facility ids
    const projectFacilityMap = (values.projectFacilityIds || []).map(fid => ({
      projectFacilityId: fid,
    }));

    const apiPayload: any = {
      ...values,
      id: project?.id,
      lessorCertificateIssuedDate: toISODate(values.lessorCertificateIssuedDate),
      representativeCertificateEffectiveDate: toISODate(values.representativeCertificateEffectiveDate),
      managingAgentCertificateIssuedDate: toISODate(values.managingAgentCertificateIssuedDate),
      projectAddress,
      projectFacilityMap,
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
    <div className="flex border-b border-border/20 gap-6 mt-4 pb-1">
      <button
        type="button"
        onClick={() => setActiveTab("summary")}
        className={`pb-2 text-xs uppercase tracking-wider font-bold transition-all relative ${
          activeTab === "summary"
            ? "text-primary font-extrabold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Tổng quan dự án
        {activeTab === "summary" && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
        )}
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("floors")}
        className={`pb-2 text-xs uppercase tracking-wider font-bold transition-all relative ${
          activeTab === "floors"
            ? "text-primary font-extrabold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Sơ đồ tầng / sàn
        {activeTab === "floors" && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
        )}
      </button>
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
      showSave={activeTab === "summary"}
      showCancel={activeTab === "summary"}
      isPending={mutation.isPending}
      extraHeaderContent={projectTabs}
      onCancel={() => onOpenChange(false)}
    >
      {activeTab === "summary" ? (
        <Form {...form}>
          <form id="project-form" onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                
                {/* 1. Basic Info Section */}
                <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                    <Building className="h-4 w-4" />
                    <span>Thông tin cơ bản</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput control={form.control} name="projectName" label="Tên dự án" placeholder="Ví dụ: Midtown M7" required />
                    <FormInput control={form.control} name="projectCode" label="Mã dự án" placeholder="Ví dụ: MD-M7" required disabled={!!project} />
                    <FormInput control={form.control} name="numberOfFloors" label="Số tầng/sàn" type="number" placeholder="Ví dụ: 15" required />
                    <FormInput control={form.control} name="sortNumber" label="Số thứ tự (Sắp xếp)" type="number" placeholder="0" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput control={form.control} name="totalSize" label="Tổng diện tích đất (m²)" type="number" placeholder="Ví dụ: 1200" />
                    <FormInput control={form.control} name="builtDate" label="Năm xây dựng" type="number" placeholder="Ví dụ: 2019" />
                    <FormInput control={form.control} name="budgetCode" label="Mã ngân sách (Budget)" placeholder="Mã code" />
                    <FormInput control={form.control} name="projectManagerName" label="Quản lý dự án" placeholder="Họ và tên" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Landlord Dropdown */}
                    <FormCombobox
                      control={form.control}
                      name="landlordId"
                      label="Chủ đầu tư (Lessor)"
                      options={companyOptions}
                      placeholder="Tìm kiếm công ty..."
                      searchPlaceholder="Nhập tên công ty..."
                      emptyMessage="Không tìm thấy công ty nào"
                    />

                    {/* Property Management Dropdown */}
                    <FormCombobox
                      control={form.control}
                      name="propertyManagementId"
                      label="Đơn vị Quản lý vận hành"
                      options={companyOptions}
                      placeholder="Tìm kiếm công ty..."
                      searchPlaceholder="Nhập tên công ty..."
                      emptyMessage="Không tìm thấy công ty nào"
                    />

                    {/* Contact Person Dropdown */}
                    <FormCombobox
                      control={form.control}
                      name="contactId"
                      label="Người liên hệ"
                      options={contactOptions}
                      placeholder="Tìm kiếm liên hệ..."
                      searchPlaceholder="Nhập tên người..."
                      emptyMessage="Không tìm thấy liên hệ nào"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput control={form.control} name="link" label="Đường dẫn trang web dự án" placeholder="https://..." />
                    <FormTextarea control={form.control} name="description" label="Mô tả dự án" placeholder="Nhập ghi chú hoặc mô tả..." />
                  </div>

                  {/* Project Facilities Checkbox/Badge List */}
                  {facilityOptions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/10">
                      <FormLabel>Tiện ích dự án</FormLabel>
                      <FormField
                        control={form.control}
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
                                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all border ${
                                    isChecked
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

                {/* 2. Project Address Section */}
                <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                    <MapPin className="h-4 w-4" />
                    <span>Địa chỉ dự án</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Province Dropdown */}
                    <FormCombobox
                      control={form.control}
                      name="provinceId"
                      label="Tỉnh / Thành phố"
                      options={provinceOptions}
                      onChange={() => {
                        form.setValue("districtId", null);
                      }}
                      placeholder="Chọn Tỉnh / Thành phố"
                      searchPlaceholder="Tìm kiếm..."
                    />

                    {/* District Dropdown */}
                    <FormCombobox
                      control={form.control}
                      name="districtId"
                      label="Quận / Huyện"
                      options={districtOptions}
                      placeholder="Chọn Quận / Huyện"
                      searchPlaceholder="Tìm kiếm..."
                      disabled={!provinceId}
                    />

                    <FormInput control={form.control} name="projectAddressTextVi" label="Địa chỉ đầy đủ (Tiếng Việt)" placeholder="Ví dụ: Crescent Residence, Quận 7" />
                    <FormInput control={form.control} name="projectAddressText" label="Địa chỉ đầy đủ (Tiếng Anh)" placeholder="Ví dụ: Crescent Residence, District 7" />
                  </div>
                </div>

                {/* 3. Lessor Information Section */}
                <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                    <Landmark className="h-4 w-4" />
                    <span>Thông tin bên cho thuê (Lessor Information)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput control={form.control} name="lessorAddressVi" label="Địa chỉ công ty (VI)" placeholder="Địa chỉ Bên Cho Thuê" />
                    <FormInput control={form.control} name="lessorAddress" label="Địa chỉ công ty (EN)" placeholder="Lessor Address" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput control={form.control} name="representativeOfVi" label="Đại diện cho (VI)" placeholder="Đại diện cho..." />
                    <FormInput control={form.control} name="representativeOf" label="Đại diện cho (EN)" placeholder="Representative of..." />
                    <FormDatePicker control={form.control} name="lessorCertificateIssuedDate" label="Ngày cấp chứng chỉ" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput control={form.control} name="lessorPositionVi" label="Chức vụ người đại diện (VI)" placeholder="Chức vụ" />
                    <FormInput control={form.control} name="lessorPosition" label="Chức vụ người đại diện (EN)" placeholder="Lessor Position" />
                    <FormInput control={form.control} name="lessorCertificateNameVi" label="Tên GCN đăng ký DN (VI)" placeholder="Tên GCN đăng ký doanh nghiệp" />
                    <FormInput control={form.control} name="lessorCertificateName" label="Tên GCN đăng ký DN (EN)" placeholder="e.g. Business registration" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput control={form.control} name="lessorCertificateNumberVi" label="Số chứng chỉ đăng ký (VI)" placeholder="Số GCN" />
                    <FormInput control={form.control} name="lessorCertificateNumber" label="Số chứng chỉ đăng ký (EN)" placeholder="e.g. 0300... " />
                    <FormInput control={form.control} name="lessorCertificateIssuedByVi" label="Nơi cấp chứng chỉ (VI)" placeholder="Nơi cấp" />
                    <FormInput control={form.control} name="lessorCertificateIssuedBy" label="Nơi cấp chứng chỉ (EN)" placeholder="Issued by" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput control={form.control} name="representativeByVi" label="Tên người đại diện (VI)" placeholder="Tên người đại diện" />
                    <FormInput control={form.control} name="representativeBy" label="Tên người đại diện (EN)" placeholder="Representative name" />
                    <FormInput control={form.control} name="representativePositionVi" label="Chức vụ (VI)" placeholder="Chức vụ" />
                    <FormInput control={form.control} name="representativePosition" label="Chức vụ (EN)" placeholder="Position" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput control={form.control} name="representativeCertificateNumberVi" label="Số ủy quyền / LOA (VI)" placeholder="Số ủy quyền" />
                    <FormInput control={form.control} name="representativeCertificateNumber" label="Số ủy quyền / LOA (EN)" placeholder="LOA number" />
                    <FormInput control={form.control} name="representativeExecuteByVi" label="Người thực hiện ký (VI)" placeholder="Ký bởi" />
                    <FormInput control={form.control} name="representativeExecuteBy" label="Người thực hiện ký (EN)" placeholder="e.g. CEO" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormDatePicker control={form.control} name="representativeCertificateEffectiveDate" label="Ngày hiệu lực ủy quyền" />
                  </div>
                </div>

                {/* 5. Bank Accounts Section */}
                <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Thông tin tài khoản Ngân hàng</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput control={form.control} name="bankAccount" label="Số tài khoản chính" placeholder="Ví dụ: 007100..." />
                    <FormInput control={form.control} name="bankNameVi" label="Tên ngân hàng chính (VI)" placeholder="Tên ngân hàng" />
                    <FormInput control={form.control} name="bankName" label="Tên ngân hàng chính (EN)" placeholder="Bank Name" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput control={form.control} name="bankAddressVi" label="Địa chỉ ngân hàng chính (VI)" placeholder="Địa chỉ chi nhánh" />
                    <FormInput control={form.control} name="bankAddress" label="Địa chỉ ngân hàng chính (EN)" placeholder="Bank Address" />
                  </div>

                  {/* Optional Bank Info 2 */}
                  <div className="pt-4 border-t border-border/10 space-y-4">
                    <h5 className="text-xs font-semibold text-muted-foreground">Tài khoản ngân hàng 2 (Phụ / Tùy chọn)</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormInput control={form.control} name="optionalBankAccount" label="Số tài khoản phụ" placeholder="Ví dụ: 1903..." />
                      <FormInput control={form.control} name="optionalBankNameVi" label="Tên ngân hàng phụ (VI)" placeholder="Tên ngân hàng" />
                      <FormInput control={form.control} name="optionalBankName" label="Tên ngân hàng phụ (EN)" placeholder="Bank Name" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput control={form.control} name="managingAgentCompanyVi" label="Tên công ty đại lý (VI)" placeholder="Tên công ty đại lý quản lý" />
                    <FormInput control={form.control} name="managingAgentCompany" label="Tên công ty đại lý (EN)" placeholder="Agent company name" />
                    <FormInput control={form.control} name="holderOfVi" label="Đại diện cho (VI)" placeholder="Nắm giữ của..." />
                    <FormInput control={form.control} name="holderOf" label="Đại diện cho (EN)" placeholder="Holder of..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput control={form.control} name="managingAgentCertificateNumberVi" label="Số chứng chỉ quản lý (VI)" placeholder="Số chứng chỉ đại lý" />
                    <FormInput control={form.control} name="managingAgentCertificateNumber" label="Số chứng chỉ quản lý (EN)" placeholder="Agent cert number" />
                    <FormInput control={form.control} name="managingAgentCertificateIssuedByVi" label="Nơi cấp chứng chỉ (VI)" placeholder="Nơi cấp" />
                    <FormInput control={form.control} name="managingAgentCertificateIssuedBy" label="Nơi cấp chứng chỉ (EN)" placeholder="Issued by" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormDatePicker control={form.control} name="managingAgentCertificateIssuedDate" label="Ngày cấp chứng chỉ đại lý" />
                  </div>
                </div>

                {/* 7. Parking and Pet Fees Section */}
                <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-2xl p-5 space-y-4 shadow-sm backdrop-blur-md">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                    <Settings className="h-4 w-4" />
                    <span>Phí đỗ xe & Thú cưng</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput control={form.control} name="motorbikeCost" label="Phí gửi xe máy (VND/tháng)" type="number" placeholder="Ví dụ: 120000" />
                    <FormInput control={form.control} name="dedicatedCarCost" label="Phí gửi ô tô (VND/tháng)" type="number" placeholder="Ví dụ: 1200000" />
                    <FormInput control={form.control} name="petFees" label="Phí nuôi thú cưng (VND)" type="number" placeholder="Ví dụ: 50000" />
                  </div>
                </div>

              </form>
            </Form>
          ) : (
            project && <ProjectFloorsTab projectId={project.id} />
          )}
    </DetailSheet>
  );
}
