import { useState } from "react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Edit, Power, Search, Building2, ShieldCheck, FilePlus2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/shared/inputs/Input";
import { DataTable } from "@/components/shared/tables/DataTable";
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { useGetProjects, useToggleProjectActive } from "../hooks/useProperties";
import { ProjectForm } from "./ProjectForm";
import { CreateProposalDialog } from "./CreateProposalDialog";
import { AddUserPermissionDialog } from "./AddUserPermissionDialog";
import type { Project } from "../types";

export function ProjectList() {
  // Query Filters & Paging state
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Edit / Toggle State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmProject, setConfirmProject] = useState<Project | null>(null);
  
  // Permissions & Proposal states
  const [initialTab, setInitialTab] = useState<any>("summary");
  const [proposalProjectId, setProposalProjectId] = useState<number | null>(null);
  const [proposalProjectName, setProposalProjectName] = useState<string>("");
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);

  // Fetch projects data
  const { data, isLoading, refetch } = useGetProjects({
    Keyword: keyword || undefined,
    SkipCount: pagination.pageIndex * pagination.pageSize,
    MaxResultCount: pagination.pageSize,
  });

  // Toggle Active Mutation
  const toggleActiveMutation = useToggleProjectActive({
    onSuccess: () => {
      toast.success(
        confirmProject?.isActive
          ? "Đã ngưng hoạt động dự án"
          : "Đã kích hoạt hoạt động dự án"
      );
      refetch();
      setConfirmProject(null);
    },
  });

  // Table columns definition
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "projectCode",
      header: "Mã Dự án",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          {row.original.projectCode}
        </span>
      ),
    },
    {
      accessorKey: "projectName",
      header: "Tên Dự án",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <span>{row.original.projectName}</span>
        </div>
      ),
    },
    {
      accessorKey: "numberOfFloors",
      header: "Số Tầng",
      cell: ({ row }) => <span>{row.original.numberOfFloors} tầng</span>,
    },
    {
      accessorKey: "numberOfUnits",
      header: "Số Căn hộ",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.numberOfUnits} căn</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
              }`}
            />
            <span className={`text-xs font-medium ${isActive ? "text-emerald-500" : "text-muted-foreground"}`}>
              {isActive ? "Hoạt động" : "Ngưng hoạt động"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => {
                setSelectedProject(project);
                setInitialTab("permissions");
                setIsFormOpen(true);
              }}
              title="Phân quyền thành viên"
            >
              <ShieldCheck className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => {
                setProposalProjectId(project.id);
                setProposalProjectName(project.projectName);
              }}
              title="Tạo đề xuất"
            >
              <FilePlus2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => {
                setSelectedProject(project);
                setInitialTab("summary");
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
                project.isActive 
                  ? "text-muted-foreground hover:text-destructive" 
                  : "text-muted-foreground hover:text-emerald-500"
              }`}
              onClick={() => setConfirmProject(project)}
              title={project.isActive ? "Ngưng hoạt động" : "Kích hoạt"}
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

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên hoặc mã dự án..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Button variant="outline" onClick={() => setIsPermissionDialogOpen(true)}>
            <ShieldCheck className="h-4 w-4 mr-2" /> Phân quyền nhanh
          </Button>
          <Button onClick={() => {
            setSelectedProject(null);
            setInitialTab("summary");
            setIsFormOpen(true);
          }}>
            Thêm Dự án
          </Button>
        </div>
      </div>

      {/* Projects DataTable */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        pageCount={data ? Math.ceil(data.totalCount / pagination.pageSize) : 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      {/* Project Form Dialog */}
      <ProjectForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        project={selectedProject}
        onSuccess={refetch}
        initialTab={initialTab}
      />

      {/* Create Proposal Dialog */}
      <CreateProposalDialog
        open={proposalProjectId !== null}
        onOpenChange={(open) => !open && setProposalProjectId(null)}
        projectId={proposalProjectId || 0}
        projectName={proposalProjectName}
      />

      {/* Batch Permission Dialog */}
      <AddUserPermissionDialog
        open={isPermissionDialogOpen}
        onOpenChange={setIsPermissionDialogOpen}
        onSuccess={refetch}
      />

      {/* Deactivate/Activate Confirm Dialog */}
      <ConfirmDialog
        open={confirmProject !== null}
        onOpenChange={(open) => !open && setConfirmProject(null)}
        title={confirmProject?.isActive ? "Xác nhận ngưng hoạt động" : "Xác nhận kích hoạt"}
        description={`Bạn có chắc chắn muốn ${
          confirmProject?.isActive ? "ngưng hoạt động" : "kích hoạt hoạt động"
        } cho dự án "${confirmProject?.projectName}"?`}
        variant={confirmProject?.isActive ? "destructive" : "default"}
        confirmText={confirmProject?.isActive ? "Ngưng hoạt động" : "Kích hoạt"}
        onConfirm={() => {
          if (confirmProject) {
            toggleActiveMutation.mutate(confirmProject.id);
          }
        }}
      />
    </div>
  );
}
