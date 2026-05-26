import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/forms/FormInput";
import { Combobox } from "@/components/shared/forms/Combobox";
import { RichTextEditor } from "@/components/shared/forms/RichTextEditor";
import { FileUploader } from "@/components/shared/forms/FileUploader";

import { useCreateOrUpdateContract } from "../hooks/useContracts";
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
}

export function ContractForm({ open, onOpenChange, contract, onSuccess }: ContractFormProps) {
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

  // Reset/populate form when contract changes
  useEffect(() => {
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

  const mutation = useCreateOrUpdateContract({
    onSuccess: () => {
      toast.success(contract ? "Cập nhật hợp đồng thành công!" : "Tạo hợp đồng thuê thành công!");
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const onSubmit = (values: ContractFormValues) => {
    mutation.mutate({
      id: contract?.id,
      data: values,
    });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contract ? "Chỉnh sửa hợp đồng thuê" : "Tạo mới hợp đồng thuê"}</DialogTitle>
          <DialogDescription>
            Khai báo các điều khoản thuê bất động sản, bên thuê và tài liệu đính kèm. Bấm Lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 py-2">
            
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
              <FormField
                control={form.control as any}
                name="statusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái hợp đồng</FormLabel>
                    <Select
                      disabled={mutation.isPending}
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={String(field.value || 1)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-10 bg-card text-foreground border-input">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                              {s.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Select Unit */}
            <FormField
              control={form.control as any}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Căn hộ / Mặt bằng thương mại</FormLabel>
                  <FormControl>
                    <Combobox
                      options={unitOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tìm theo mã căn hộ hoặc tên dự án..."
                      disabled={mutation.isPending || !!contract} // Unit cannot be changed directly after creation
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Select Company */}
            <FormField
              control={form.control as any}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doanh nghiệp thuê (Bên B)</FormLabel>
                  <FormControl>
                    <Combobox
                      options={companyOptions}
                      value={field.value || 0}
                      onChange={field.onChange}
                      placeholder="Tìm và chọn công ty đối tác..."
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Select Contact Signatory */}
            <FormField
              control={form.control as any}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người đại diện ký kết</FormLabel>
                  <FormControl>
                    <Combobox
                      options={contactOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Chọn liên hệ đại diện..."
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="commencementDate"
                label="Ngày bắt đầu"
                type="date"
                required
                disabled={mutation.isPending}
              />
              <FormInput
                control={form.control}
                name="expiryDate"
                label="Ngày hết hạn"
                type="date"
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
            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Điều khoản đặc biệt / Ghi chú</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachment scan */}
            <FormItem>
              <FormLabel>File đính kèm / Bản chụp Hợp đồng scan (Tùy chọn)</FormLabel>
              <FormControl>
                <FileUploader
                  placeholder="Kéo thả file PDF bản scan hợp đồng tại đây (Tối đa 10MB)"
                  onChange={(file) => {
                    if (file) {
                      toast.info(`Đã nhận file scan hợp đồng: ${file.name}`);
                    }
                  }}
                  disabled={mutation.isPending}
                />
              </FormControl>
            </FormItem>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Đang lưu..." : "Ký Hợp đồng"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
