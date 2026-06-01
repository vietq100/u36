import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DetailDialog } from "@/components/shared/dialogs/DetailDialog";
import { Form, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { FormInput } from "@/components/shared/forms/FormInput";
import { FormSelect } from "@/components/shared/forms/FormSelect";
import { FormRichTextEditor } from "@/components/shared/forms/FormRichTextEditor";
import { FormDatePicker } from "@/components/shared/forms/FormDatePicker";
import { FileUploader } from "@/components/shared/inputs/FileUploader";

import { useCreateOrUpdateContract, useUploadContractDocument } from "../hooks/useContracts";
import { useGetDocuments } from "@/features/properties/hooks/useProjectDocuments";
import { useContractsStore } from "../stores/useContractsStore";
import { usePropertiesStore } from "@/features/properties/stores/usePropertiesStore";
import { useClientsStore } from "@/features/clients/stores/useClientsStore";
import { contractSchema } from "../types";
import type { LeaseContract, ContractFormValues } from "../types";

interface ContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: LeaseContract | null;
  onSuccess?: () => void;
  defaultProjectId?: number;
}

export function ContractForm({ open, onOpenChange, contract, onSuccess, defaultProjectId }: ContractFormProps) {
  const statuses = useContractsStore((state) => state.statuses);
  const units = usePropertiesStore((state) => state.units);
  const rawCompanies = useClientsStore((state) => state.companies);
  const rawContacts = useClientsStore((state) => state.contacts);

  const companies = useMemo(() => rawCompanies.filter(c => c.isActive), [rawCompanies]);
  const contacts = useMemo(() => rawContacts.filter(c => c.isActive), [rawContacts]);

  // Form setup
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema) as any,
    defaultValues: {
      referenceNumber: "",
      companyId: 0,
      contactId: 0,
      unitId: 0,
      commencementDate: "",
      expiryDate: "",
      depositAmount: 0,
      contractAmount: 0,
      statusId: 1,
      description: "",
    },
  });

  // Load available units options
  // If editing, make sure the current unit is included even if it's currently marked as 'RENTED'
  const unitOptions = units
    .filter(u => u.isActive && (u.statusId === 1 || (contract && u.id === contract.unitId)))
    .filter(u => !defaultProjectId || u.projectId === defaultProjectId)
    .map(u => ({
      value: u.id,
      label: `${u.unitName} - ${u.projectName} (${u.floorName})`
    }));

  const companyOptions = [
    { value: 0, label: "-- Cá nhân tự thuê (Không qua doanh nghiệp) --" },
    ...companies.map(c => ({ value: c.id, label: c.companyName }))
  ];

  const contactOptions = contacts.map(c => ({
    value: c.id,
    label: `${c.contactName} (${c.phone})`
  }));

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch existing documents if contract exists
  const { data: docData } = useGetDocuments({ inputId: contract?.uniqueId });
  const existingFileUrl = docData && (docData as any).items?.[0]?.fileUrl || null;

  // Reset/populate form when contract changes
  useEffect(() => {
    setSelectedFile(null);
    if (contract) {
      form.reset({
        referenceNumber: contract.referenceNumber,
        companyId: contract.companyId || 0,
        contactId: contract.contactId,
        unitId: contract.unitId,
        commencementDate: contract.commencementDate,
        expiryDate: contract.expiryDate,
        depositAmount: contract.depositAmount,
        contractAmount: contract.contractAmount,
        statusId: contract.statusId,
        description: contract.description || "",
      });
    } else {
      // Auto generate reference number
      const autoRef = `HD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      form.reset({
        referenceNumber: autoRef,
        companyId: 0,
        contactId: contacts[0]?.id || 0,
        unitId: units.find(u => u.statusId === 1)?.id || 0,
        commencementDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        depositAmount: 0,
        contractAmount: 0,
        statusId: 1,
        description: "",
      });
    }
  }, [contract, open, form, contacts, units]);

  const mutation = useCreateOrUpdateContract();
  const uploadMutation = useUploadContractDocument();

  const onSubmit = async (values: ContractFormValues) => {
    try {
      const result = await mutation.mutateAsync({
        id: contract?.id,
        data: values,
      });

      const uniqueId = (result as any)?.uniqueId;

      if (selectedFile && uniqueId) {
        toast.info("Đang tải lên bản scan hợp đồng...");
        await uploadMutation.mutateAsync({
          params: {
            UniqueId: uniqueId,
            DocumentName: selectedFile.name,
            UploadDate: new Date().toISOString(),
          },
          file: selectedFile,
        });
      }

      toast.success(contract ? "Cập nhật hợp đồng thành công!" : "Tạo hợp đồng thuê thành công!");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Có lỗi xảy ra: " + (error?.message || error));
    }
  };

  // Autocomplete price when unit is selected
  const watchUnitId = form.watch("unitId");
  useEffect(() => {
    if (watchUnitId && !contract) {
      const selectedUnit = units.find(u => u.id === watchUnitId);
      if (selectedUnit) {
        // Set standard deposit as 3 months rent
        form.setValue("depositAmount", selectedUnit.price * 3);
        // Set standard total contract value as 12 months rent
        form.setValue("contractAmount", selectedUnit.price * 12);
      }
    }
  }, [watchUnitId, contract, units, form]);

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title={contract ? "Chỉnh sửa hợp đồng thuê" : "Tạo mới hợp đồng thuê"}
      description="Khai báo các điều khoản thuê bất động sản, bên thuê và tài liệu đính kèm. Bấm Lưu khi hoàn tất."
      formId="contract-form"
      isPending={mutation.isPending || uploadMutation.isPending}
      saveLabel={contract ? "Lưu thay đổi" : "Ký Hợp đồng"}
    >
      <Form {...form}>
        <form id="contract-form" onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-2">
            
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="referenceNumber"
                label="Số Hợp đồng"
                placeholder="Ví dụ: HD-2026-1002"
                required
                disabled={mutation.isPending}
              />

              {/* Status Select */}
              <FormSelect
                control={form.control}
                name="statusId"
                label="Trạng thái hợp đồng"
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
            </div>

            {/* Select Unit */}
            <FormSelect
              control={form.control}
              name="unitId"
              label="Căn hộ / Mặt bằng thương mại"
              options={unitOptions}
              placeholder="Tìm theo mã căn hộ hoặc tên dự án..."
              disabled={mutation.isPending || !!contract} // Unit cannot be changed directly after creation
            />

            {/* Select Company */}
            <FormSelect
              control={form.control}
              name="companyId"
              label="Doanh nghiệp thuê (Bên B)"
              options={companyOptions}
              placeholder="Tìm và chọn công ty đối tác..."
              disabled={mutation.isPending}
            />

            {/* Select Contact Signatory */}
            <FormSelect
              control={form.control}
              name="contactId"
              label="Người đại diện ký kết"
              options={contactOptions}
              placeholder="Chọn liên hệ đại diện..."
              disabled={mutation.isPending}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormDatePicker
                control={form.control}
                name="commencementDate"
                label="Ngày bắt đầu"
                required
                disabled={mutation.isPending}
              />
              <FormDatePicker
                control={form.control}
                name="expiryDate"
                label="Ngày hết hạn"
                required
                disabled={mutation.isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="depositAmount"
                label="Tiền đặt cọc (USD)"
                type="number"
                required
                disabled={mutation.isPending}
              />
              <FormInput
                control={form.control}
                name="contractAmount"
                label="Tổng giá trị hợp đồng (USD)"
                type="number"
                required
                disabled={mutation.isPending}
              />
            </div>

            {/* Description clauses */}
            <FormRichTextEditor
              control={form.control}
              name="description"
              label="Điều khoản đặc biệt / Ghi chú"
              disabled={mutation.isPending}
            />

            <FormItem>
              <FormLabel>File đính kèm / Bản chụp Hợp đồng scan (Tùy chọn)</FormLabel>
              <FormControl>
                <FileUploader
                  placeholder="Kéo thả file PDF bản scan hợp đồng tại đây (Tối đa 10MB)"
                  value={selectedFile || existingFileUrl}
                  onChange={(file) => {
                    setSelectedFile(file);
                  }}
                  disabled={mutation.isPending || uploadMutation.isPending}
                />
              </FormControl>
            </FormItem>

          </form>
        </Form>
      </DetailDialog>
  );
}
