import { useState } from "react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Edit, Power, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useGetCompanies, useToggleCompanyActive } from "../hooks/useClients";
import { useClientsStore } from "../stores/useClientsStore";
import { CompanyForm } from "./CompanyForm";
import type { Company } from "../types";

export function CompanyList() {
  const industries = useClientsStore((state) => state.industries);

  // Filters & Pagination State
  const [keyword, setKeyword] = useState("");
  const [selectedIndustryId, setSelectedIndustryId] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Edit / Toggle Active state
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmCompany, setConfirmCompany] = useState<Company | null>(null);

  // Fetch data
  const { data, isLoading, refetch } = useGetCompanies({
    Keyword: keyword || undefined,
    IndustryId: selectedIndustryId || undefined,
    SkipCount: pagination.pageIndex * pagination.pageSize,
    MaxResultCount: pagination.pageSize,
  });

  // Toggle active status mutation
  const toggleActiveMutation = useToggleCompanyActive({
    onSuccess: () => {
      toast.success(
        confirmCompany?.isActive
          ? "Đã ngưng hoạt động doanh nghiệp"
          : "Đã kích hoạt hoạt động doanh nghiệp"
      );
      refetch();
      setConfirmCompany(null);
    },
  });

  // Columns definition
  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "companyName",
      header: "Tên Doanh nghiệp",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground leading-tight">
            {row.original.companyName}
          </span>
          {row.original.address && (
            <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {row.original.address}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "vatCode",
      header: "Mã số thuế",
      cell: ({ row }) => <span className="font-mono text-sm font-semibold">{row.original.vatCode}</span>,
    },
    {
      accessorKey: "phone",
      header: "Liên hệ",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs">
          <span>SĐT: {row.original.phone}</span>
          {row.original.email && <span className="text-muted-foreground">{row.original.email}</span>}
        </div>
      ),
    },
    {
      accessorKey: "industryName",
      header: "Ngành nghề",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-border">
          {row.original.industryName || "Khác"}
        </span>
      ),
    },
    {
      accessorKey: "nationalityName",
      header: "Quốc gia",
      cell: ({ row }) => <span>{row.original.nationalityName || "Chưa xác định"}</span>,
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isActive ? "bg-emerald-500" : "bg-muted-foreground"
              }`}
            />
            <span className={`text-xs font-medium ${isActive ? "text-emerald-500" : "text-muted-foreground"}`}>
              {isActive ? "Đang hoạt động" : "Tạm ngưng"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const company = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => {
                setSelectedCompany(company);
                setIsFormOpen(true);
              }}
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${
                company.isActive
                  ? "text-muted-foreground hover:text-destructive"
                  : "text-muted-foreground hover:text-emerald-500"
              }`}
              onClick={() => setConfirmCompany(company)}
              title={company.isActive ? "Ngưng hoạt động" : "Kích hoạt"}
            >
              <Power className="h-4 w-4" />
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
    setSelectedIndustryId(0);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-4">
      {/* Search and Advanced Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center flex-1 max-w-2xl">
          {/* Keyword Search */}
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên doanh nghiệp, MST..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </form>

          {/* Industry dropdown Filter */}
          <Select
            value={String(selectedIndustryId)}
            onValueChange={(val) => {
              setSelectedIndustryId(Number(val));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-card text-foreground border-input">
              <SelectValue placeholder="Tất cả ngành nghề" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tất cả ngành nghề</SelectItem>
              {industries.map((ind) => (
                <SelectItem key={ind.id} value={String(ind.id)}>
                  {ind.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Filters button */}
          {(keyword || selectedIndustryId !== 0) && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground h-10 text-xs">
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <Button onClick={() => {
          setSelectedCompany(null);
          setIsFormOpen(true);
        }} className="shrink-0">
          Thêm Doanh nghiệp
        </Button>
      </div>

      {/* Companies DataTable */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        pageCount={data ? Math.ceil(data.totalCount / pagination.pageSize) : 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      {/* Company Form Dialog */}
      <CompanyForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        company={selectedCompany}
        onSuccess={refetch}
      />

      {/* Toggle Active Confirm Dialog */}
      <ConfirmDialog
        open={confirmCompany !== null}
        onOpenChange={(open) => !open && setConfirmCompany(null)}
        title={confirmCompany?.isActive ? "Xác nhận ngưng hoạt động" : "Xác nhận kích hoạt"}
        description={`Bạn có chắc chắn muốn ${
          confirmCompany?.isActive ? "ngưng hoạt động" : "kích hoạt hoạt động"
        } cho doanh nghiệp "${confirmCompany?.companyName}"?`}
        variant={confirmCompany?.isActive ? "destructive" : "default"}
        confirmText={confirmCompany?.isActive ? "Ngưng hoạt động" : "Kích hoạt"}
        onConfirm={() => {
          if (confirmCompany) {
            toggleActiveMutation.mutate(confirmCompany.id);
          }
        }}
      />
    </div>
  );
}
