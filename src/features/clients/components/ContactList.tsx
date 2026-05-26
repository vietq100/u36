import { useState } from "react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Edit, Power, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useGetContacts, useToggleContactActive } from "../hooks/useClients";
import { useClientsStore } from "../stores/useClientsStore";
import { ContactForm } from "./ContactForm";
import type { Contact } from "../types";

export function ContactList() {
  const companies = useClientsStore((state) => state.companies).filter(c => c.isActive);
  const leadSources = useClientsStore((state) => state.leadSources);

  // Filters & Pagination State
  const [keyword, setKeyword] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);
  const [selectedLeadSourceId, setSelectedLeadSourceId] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Edit / Toggle Active state
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmContact, setConfirmContact] = useState<Contact | null>(null);

  // Fetch data
  const { data, isLoading, refetch } = useGetContacts({
    Keyword: keyword || undefined,
    CompanyId: selectedCompanyId || undefined,
    LeadSourceId: selectedLeadSourceId || undefined,
    SkipCount: pagination.pageIndex * pagination.pageSize,
    MaxResultCount: pagination.pageSize,
  });

  // Toggle active status mutation
  const toggleActiveMutation = useToggleContactActive({
    onSuccess: () => {
      toast.success(
        confirmContact?.isActive
          ? "Đã ngưng hoạt động liên hệ"
          : "Đã kích hoạt hoạt động liên hệ"
      );
      refetch();
      setConfirmContact(null);
    },
  });

  // Columns definition
  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: "contactName",
      header: "Họ và tên",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground leading-tight">
            {row.original.contactName}
          </span>
          {row.original.gender && (
            <span className="text-xs text-muted-foreground mt-0.5">
              {row.original.gender === "MALE" ? "Nam" : row.original.gender === "FEMALE" ? "Nữ" : "Khác"}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "companyName",
      header: "Thuộc Doanh nghiệp",
      cell: ({ row }) => {
        const companyName = row.original.companyName;
        return companyName ? (
          <span className="font-medium text-primary line-clamp-1">{companyName}</span>
        ) : (
          <span className="text-xs text-muted-foreground italic">Cá nhân tự do</span>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Điện thoại",
      cell: ({ row }) => <span>{row.original.phone}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.email}</span>,
    },
    {
      accessorKey: "levelName",
      header: "Chức vụ",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-700/10 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20">
          {row.original.levelName || "Khách hàng"}
        </span>
      ),
    },
    {
      accessorKey: "leadSourceName",
      header: "Nguồn khách",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.leadSourceName || "Khác"}</span>,
    },
    {
      accessorKey: "nationalityName",
      header: "Quốc tịch",
      cell: ({ row }) => <span>{row.original.nationalityName || "Việt Nam"}</span>,
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
              {isActive ? "Bật" : "Tắt"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => {
                setSelectedContact(contact);
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
                contact.isActive
                  ? "text-muted-foreground hover:text-destructive"
                  : "text-muted-foreground hover:text-emerald-500"
              }`}
              onClick={() => setConfirmContact(contact)}
              title={contact.isActive ? "Ngưng hoạt động" : "Kích hoạt"}
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
    setSelectedCompanyId(0);
    setSelectedLeadSourceId(0);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-4">
      {/* Search and Advanced Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center flex-1 max-w-3xl">
          {/* Keyword Search */}
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, email, SĐT..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </form>

          {/* Company dropdown Filter */}
          <Select
            value={String(selectedCompanyId)}
            onValueChange={(val) => {
              setSelectedCompanyId(Number(val));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px] h-10 bg-card text-foreground border-input">
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

          {/* LeadSource dropdown Filter */}
          <Select
            value={String(selectedLeadSourceId)}
            onValueChange={(val) => {
              setSelectedLeadSourceId(Number(val));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px] h-10 bg-card text-foreground border-input">
              <SelectValue placeholder="Tất cả nguồn khách" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tất cả nguồn khách</SelectItem>
              {leadSources.map((ls) => (
                <SelectItem key={ls.id} value={String(ls.id)}>
                  {ls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Filters button */}
          {(keyword || selectedCompanyId !== 0 || selectedLeadSourceId !== 0) && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground h-10 text-xs">
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <Button onClick={() => {
          setSelectedContact(null);
          setIsFormOpen(true);
        }} className="shrink-0">
          Thêm Khách hàng
        </Button>
      </div>

      {/* Contacts DataTable */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        pageCount={data ? Math.ceil(data.totalCount / pagination.pageSize) : 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      {/* Contact Form Dialog */}
      <ContactForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        contact={selectedContact}
        onSuccess={refetch}
      />

      {/* Toggle Active Confirm Dialog */}
      <ConfirmDialog
        open={confirmContact !== null}
        onOpenChange={(open) => !open && setConfirmContact(null)}
        title={confirmContact?.isActive ? "Xác nhận ngưng hoạt động" : "Xác nhận kích hoạt"}
        description={`Bạn có chắc chắn muốn ${
          confirmContact?.isActive ? "ngưng hoạt động" : "kích hoạt hoạt động"
        } cho liên hệ "${confirmContact?.contactName}"?`}
        variant={confirmContact?.isActive ? "destructive" : "default"}
        confirmText={confirmContact?.isActive ? "Ngưng hoạt động" : "Kích hoạt"}
        onConfirm={() => {
          if (confirmContact) {
            toggleActiveMutation.mutate(confirmContact.id);
          }
        }}
      />
    </div>
  );
}
