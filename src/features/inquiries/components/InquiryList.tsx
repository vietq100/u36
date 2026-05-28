import { useState } from "react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Edit, Trash2, Search, Building2, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/shared/inputs/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/inputs/Select";
import { DataTable } from "@/components/shared/tables/DataTable";
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";

import { useGetInquiries, useDeleteInquiry } from "../hooks/useInquiries";
import { useInquiriesStore } from "../stores/useInquiriesStore";
import { usePropertiesStore } from "@/features/properties/stores/usePropertiesStore";
import { useClientsStore } from "@/features/clients/stores/useClientsStore";
import { InquiryForm } from "./InquiryForm";
import type { Inquiry } from "../types";

export function InquiryList({ projectId }: { projectId?: number }) {
  const statuses = useInquiriesStore((state) => state.statuses);
  const projects = usePropertiesStore((state) => state.projects).filter(p => p.isActive);
  const companies = useClientsStore((state) => state.companies).filter(c => c.isActive);

  // Filters & paging state
  const [keyword, setKeyword] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number>(projectId || 0);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);
  const [selectedStatusId, setSelectedStatusId] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Edit / Delete State
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteInquiryId, setDeleteInquiryId] = useState<number | null>(null);

  // Fetch inquiries
  const { data, isLoading, refetch } = useGetInquiries({
    Keyword: keyword || undefined,
    ProjectId: selectedProjectId || undefined,
    CompanyId: selectedCompanyId || undefined,
    StatusId: selectedStatusId || undefined,
    SkipCount: pagination.pageIndex * pagination.pageSize,
    MaxResultCount: pagination.pageSize,
  });

  const deleteMutation = useDeleteInquiry({
    onSuccess: () => {
      toast.success("Đã xóa yêu cầu hỗ trợ");
      refetch();
      setDeleteInquiryId(null);
    },
  });

  const columns: ColumnDef<Inquiry>[] = [
    {
      id: "clientRepresentative",
      header: "Khách liên hệ",
      cell: ({ row }) => {
        const i = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground leading-tight">{i.contactName}</span>
              {i.companyName && (
                <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                  Doanh nghiệp: {i.companyName}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "projectName",
      header: "Dự án quan tâm",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">{row.original.projectName}</span>
        </div>
      ),
    },
    {
      accessorKey: "actualSize",
      header: "Diện tích yc",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          &ge; {row.original.actualSize} m²
        </span>
      ),
    },
    {
      accessorKey: "askingRent",
      header: "Ngân sách tối đa",
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(row.original.askingRent)}
          <span className="text-[10px] font-normal text-muted-foreground">/tháng</span>
        </span>
      ),
    },
    {
      accessorKey: "creationTime",
      header: "Ngày tiếp nhận",
      cell: ({ row }) => {
        const dateStr = row.original.creationTime;
        return (
          <span className="text-xs text-muted-foreground">
            {dateStr ? dateStr.split("T")[0] : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "statusId",
      header: "Trạng thái",
      cell: ({ row }) => {
        const i = row.original;
        return (
          <div 
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border"
            style={{ 
              borderColor: `${i.statusColor}30`, 
              backgroundColor: `${i.statusColor}10`,
              color: i.statusColor
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: i.statusColor }} />
            {i.statusName}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const i = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => {
                setSelectedInquiry(i);
                setIsFormOpen(true);
              }}
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setDeleteInquiryId(i.id)}
              title="Xóa yêu cầu"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const clearFilters = () => {
    setKeyword("");
    setSelectedProjectId(projectId || 0);
    setSelectedCompanyId(0);
    setSelectedStatusId(0);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-4">
      {/* Advanced Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center flex-1 max-w-4xl">
          {/* Keyword Search */}
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên đại diện, ghi chú..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </form>

          {/* Project dropdown Filter */}
          {!projectId && (
            <Select
              value={String(selectedProjectId)}
              onValueChange={(val) => {
                setSelectedProjectId(Number(val));
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="w-full sm:w-[170px]">
                <SelectValue placeholder="Tất cả dự án" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Tất cả dự án</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Company dropdown Filter */}
          <Select
            value={String(selectedCompanyId)}
            onValueChange={(val) => {
              setSelectedCompanyId(Number(val));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-full sm:w-[190px]">
              <SelectValue placeholder="Tất cả doanh nghiệp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tất cả doanh nghiệp</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status dropdown Filter */}
          <Select
            value={String(selectedStatusId)}
            onValueChange={(val) => {
              setSelectedStatusId(Number(val));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tất cả trạng thái</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Filters button */}
          {(keyword || selectedProjectId !== (projectId || 0) || selectedCompanyId !== 0 || selectedStatusId !== 0) && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground text-xs hover:bg-accent/10">
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <Button onClick={() => {
          setSelectedInquiry(null);
          setIsFormOpen(true);
        }} className="shrink-0">
          Tiếp nhận Yêu cầu
        </Button>
      </div>

      {/* Inquiries DataTable */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        pageCount={data ? Math.ceil(data.totalCount / pagination.pageSize) : 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      {/* Inquiry Form Dialog */}
      <InquiryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        inquiry={selectedInquiry}
        onSuccess={refetch}
        defaultProjectId={projectId}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteInquiryId !== null}
        onOpenChange={(open) => !open && setDeleteInquiryId(null)}
        title="Xác nhận xóa yêu cầu hỗ trợ"
        description="Bạn có chắc chắn muốn xóa yêu cầu hỗ trợ này? Hành động này sẽ không thể khôi phục."
        variant="destructive"
        confirmText="Xác nhận xóa"
        onConfirm={() => {
          if (deleteInquiryId !== null) {
            deleteMutation.mutate(deleteInquiryId);
          }
        }}
      />
    </div>
  );
}
