import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LayoutGrid, DollarSign, Eye, ShieldCheck, FileText } from "lucide-react";

import { DetailSheet } from "@/components/shared/dialogs/DetailSheet";
import { Form, FormField, FormLabel } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormTextarea } from "@/components/shared/forms/FormTextarea";

import { useGetProjects, useGetProjectFloors, useCreateOrUpdateUnit } from "../hooks/useProperties";
import { unitSchema } from "../types";
import type { Unit, UnitFormValues } from "../types";

// Import API Queries for Dropdowns
import { useGetApiServicesAppUnitStatusManagementGetAll } from "@/api/generated/unit-status-management/unit-status-management";
import {
  useGetApiServicesAppCategoryGetPropertyTypeByProject,
  useGetApiServicesAppCategoryGetListUnitTypeByProject,
  useGetApiServicesAppCategoryGetListFacing,
  useGetApiServicesAppCategoryGetListView,
  useGetApiServicesAppCategoryGetListUnitFacility,
} from "@/api/generated/category/category";

interface UnitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: Unit | null;
  onSuccess?: () => void;
  defaultProjectId?: number;
}

export function UnitForm({ open, onOpenChange, unit, onSuccess, defaultProjectId }: UnitFormProps) {
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema) as any,
    defaultValues: {
      unitName: "",
      projectId: 0,
      floorId: 0,
      floorName: "",
      actualSize: 0,
      price: 0,
      statusId: 1,
      description: "",

      productTypeId: null,
      unitTypeId: null,
      balcony: null,
      askingRent: null,
      facingId: null,
      viewIds: [],
      unitFacilityIds: [],
    },
  });

  // 1. Fetch active projects list
  const { data: projectsData } = useGetProjects({
    SkipCount: 0,
    MaxResultCount: 500,
    IsActive: true,
  });
  const projectOptions = (projectsData?.items || []).map((p: any) => ({
    value: p.id,
    label: `${p.projectName} (${p.projectCode})`,
  }));

  // Watch selected project ID
  const selectedProjectId = form.watch("projectId");

  // 2. Fetch project floors list
  const { data: floorsData } = useGetProjectFloors(selectedProjectId || undefined);
  const floorOptions = (floorsData || []).map((f: any) => ({
    value: f.id,
    label: f.floorName,
  }));

  // Watch selected floor ID to sync floorName
  const selectedFloorId = form.watch("floorId");
  useEffect(() => {
    if (selectedFloorId && floorsData) {
      const matchFloor = floorsData.find((f: any) => f.id === selectedFloorId);
      if (matchFloor) {
        form.setValue("floorName", matchFloor.floorName);
      }
    }
  }, [selectedFloorId, floorsData, form]);

  // 3. Fetch product types by project
  const { data: productTypesData } = useGetApiServicesAppCategoryGetPropertyTypeByProject(
    { projectId: selectedProjectId || undefined },
    { query: { enabled: !!selectedProjectId } }
  );
  const productTypeOptions = ((productTypesData as any) || []).map((pt: any) => ({
    value: pt.id,
    label: pt.name || pt.typeName || "",
  }));

  // Watch selected product type ID
  const selectedProductTypeId = form.watch("productTypeId");

  // 4. Fetch unit types by project & product type
  const { data: unitTypesData } = useGetApiServicesAppCategoryGetListUnitTypeByProject(
    {
      projectId: selectedProjectId || undefined,
      propertyTypeId: selectedProductTypeId || undefined,
    },
    { query: { enabled: !!selectedProjectId && !!selectedProductTypeId } }
  );
  const unitTypeOptions = ((unitTypesData as any) || []).map((ut: any) => ({
    value: ut.id,
    label: ut.name || ut.typeName || "",
  }));

  // 5. Fetch unit status list
  const { data: statusesData } = useGetApiServicesAppUnitStatusManagementGetAll({
    MaxResultCount: 100,
  });
  const statusOptions = ((statusesData as any)?.items || []).map((s: any) => ({
    value: s.id,
    label: s.name || "",
  }));

  // 6. Fetch facings list
  const { data: facingsData } = useGetApiServicesAppCategoryGetListFacing();
  const facingOptions = ((facingsData as any) || []).map((f: any) => ({
    value: f.id,
    label: f.name || f.facingName || "",
  }));

  // 7. Fetch views list
  const { data: viewsData } = useGetApiServicesAppCategoryGetListView();
  const viewOptions = ((viewsData as any) || []).map((v: any) => ({
    id: v.id,
    name: v.name || v.viewName || "",
  }));

  // 8. Fetch unit facilities list
  const { data: facilitiesData } = useGetApiServicesAppCategoryGetListUnitFacility();
  const facilityOptions = ((facilitiesData as any) || []).map((f: any) => ({
    id: f.id,
    name: f.name || f.facilityName || "",
  }));

  // Reset form values when unit changes
  useEffect(() => {
    if (open) {
      if (unit) {
        form.reset({
          unitName: unit.unitName,
          projectId: unit.projectId,
          floorId: unit.floorId,
          floorName: unit.floorName,
          actualSize: unit.actualSize,
          price: unit.price,
          statusId: unit.statusId,
          description: unit.description || "",

          productTypeId: unit.productTypeId || null,
          unitTypeId: unit.unitTypeId || null,
          balcony: unit.balcony || null,
          askingRent: unit.askingRent || null,
          facingId: unit.facingId || null,
          viewIds: unit.viewIds || [],
          unitFacilityIds: unit.unitFacilityIds || [],
        });
      } else {
        form.reset({
          unitName: "",
          projectId: defaultProjectId || 0,
          floorId: 0,
          floorName: "",
          actualSize: 0,
          price: 0,
          statusId: 1,
          description: "",

          productTypeId: null,
          unitTypeId: null,
          balcony: null,
          askingRent: null,
          facingId: null,
          viewIds: [],
          unitFacilityIds: [],
        });
      }
    }
  }, [unit, open, form, defaultProjectId]);

  const mutation = useCreateOrUpdateUnit({
    onSuccess: () => {
      toast.success(unit ? "Cập nhật căn hộ thành công" : "Thêm mới căn hộ thành công");
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const onSubmit = (values: UnitFormValues) => {
    // Format viewIds and unitFacilityIds to backend expected DTO structures
    const unitViewMap = (values.viewIds || []).map(vid => ({
      viewId: vid,
    }));
    const unitFacilityMap = (values.unitFacilityIds || []).map(fid => ({
      unitFacilityId: fid,
    }));

    const apiPayload: any = {
      ...values,
      id: unit?.id,
      unitViewMap,
      unitFacilityMap,
    };

    mutation.mutate({
      data: apiPayload,
    });
  };

  const handleToggleId = (id: number, currentIds: number[], fieldName: "viewIds" | "unitFacilityIds") => {
    const nextIds = currentIds.includes(id)
      ? currentIds.filter(x => x !== id)
      : [...currentIds, id];
    form.setValue(fieldName, nextIds, { shouldDirty: true });
  };

  return (
    <DetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={unit ? `Căn hộ: ${unit.unitName}` : "Thêm mới Căn hộ/Mặt bằng"}
      description={unit 
        ? "Chỉnh sửa thông tin chi tiết kỹ thuật, giá thuê và trạng thái căn hộ." 
        : "Nhập thông tin chi tiết căn hộ hoặc biệt thự, shophouse mới cho thuê."}
      formId="unit-form"
      isPending={mutation.isPending}
    >
      <Form {...form}>
        <form id="unit-form" onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

                {/* Cột trái: Thông tin cốt lõi (3/5 chiều rộng) */}
                <div className="lg:col-span-3 space-y-6">
                  {/* 1. Basic Specifications Section */}
                  <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                      <LayoutGrid className="h-4 w-4" />
                      <span>Thông số kỹ thuật & Vị trí</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Project Selector */}
                      <FormSelect
                        control={form.control}
                        name="projectId"
                        label="Dự án"
                        options={projectOptions}
                        onChange={() => {
                          form.setValue("floorId", 0); // Reset floor
                          form.setValue("productTypeId", null); // Reset product type
                          form.setValue("unitTypeId", null); // Reset unit type
                        }}
                        placeholder="Chọn Dự án"
                        searchPlaceholder="Tìm kiếm..."
                        disabled={!!defaultProjectId}
                      />

                      {/* Floor Selector */}
                      <FormSelect
                        control={form.control}
                        name="floorId"
                        label="Tầng / Sàn"
                        options={floorOptions}
                        placeholder="Chọn Tầng"
                        disabled={!selectedProjectId}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput control={form.control} name="unitName" label="Mã căn hộ / Mặt bằng" placeholder="Ví dụ: CR2-01-01" required />

                      {/* Product Type Selector */}
                      <FormSelect
                        control={form.control}
                        name="productTypeId"
                        label="Loại sản phẩm"
                        options={productTypeOptions}
                        onChange={() => {
                          form.setValue("unitTypeId", null); // Reset unit type
                        }}
                        placeholder="Chọn Loại SP"
                        disabled={!selectedProjectId}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Unit Type Selector */}
                      <FormSelect
                        control={form.control}
                        name="unitTypeId"
                        label="Loại căn hộ"
                        options={unitTypeOptions}
                        placeholder="Chọn Loại căn"
                        disabled={!selectedProjectId || !selectedProductTypeId}
                      />

                      {/* Unit Status Selector */}
                      <FormSelect
                        control={form.control}
                        name="statusId"
                        label="Trạng thái"
                        options={statusOptions}
                        placeholder="Chọn Trạng thái"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput control={form.control} name="actualSize" label="Diện tích sử dụng (m²)" type="number" placeholder="0" required />
                      <FormInput control={form.control} name="balcony" label="Diện tích ban công (m²)" type="number" placeholder="0" />
                    </div>
                  </div>

                  {/* 2. Rent Section */}
                  <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Giá thuê (USD/tháng)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput control={form.control} name="price" label="Giá thuê chính thức" type="number" placeholder="0" required />
                      <FormInput control={form.control} name="askingRent" label="Giá thuê mong muốn" type="number" placeholder="0" />
                    </div>
                  </div>
                </div>

                {/* Cột phải: Đặc trưng & Tiện ích (2/5 chiều rộng) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* 3. Orientation & View Section */}
                  <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                      <Eye className="h-4 w-4" />
                      <span>Hướng & View cảnh quan</span>
                    </div>

                    {/* Facing direction selector */}
                    <FormSelect
                      control={form.control}
                      name="facingId"
                      label="Hướng ban công/Cửa chính"
                      options={facingOptions}
                      placeholder="Chọn hướng chính"
                    />

                    {/* View choices */}
                    {viewOptions.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <FormLabel>Cảnh quan (View)</FormLabel>
                        <FormField
                          control={form.control}
                          name="viewIds"
                          render={({ field }) => (
                            <div className="flex flex-wrap gap-1.5">
                              {viewOptions.map((view: any) => {
                                const isChecked = (field.value || []).includes(view.id);
                                return (
                                  <button
                                    type="button"
                                    key={view.id}
                                    onClick={() => handleToggleId(view.id, field.value || [], "viewIds")}
                                    className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all border ${isChecked
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted"
                                      }`}
                                  >
                                    {view.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* 4. Unit Facilities Section */}
                  {facilityOptions.length > 0 && (
                    <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
                      <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Tiện ích đi kèm (Facilities)</span>
                      </div>

                      <FormField
                        control={form.control}
                        name="unitFacilityIds"
                        render={({ field }) => (
                          <div className="flex flex-wrap gap-1.5">
                            {facilityOptions.map((facility: any) => {
                              const isChecked = (field.value || []).includes(facility.id);
                              return (
                                <button
                                  type="button"
                                  key={facility.id}
                                  onClick={() => handleToggleId(facility.id, field.value || [], "unitFacilityIds")}
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

                  {/* 5. Description Section */}
                  <div className="border border-border/30 bg-muted/10 dark:bg-white/1 rounded-dialog p-5 space-y-4 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm border-b border-border/20 pb-2 mb-1">
                      <FileText className="h-4 w-4" />
                      <span>Ghi chú thêm</span>
                    </div>
                    <FormTextarea control={form.control} name="description" label="Mô tả chi tiết" placeholder="Nhập mô tả hoặc ghi chú..." />
                  </div>
                </div>

              </div>
        </form>
      </Form>
    </DetailSheet>
  );
}
