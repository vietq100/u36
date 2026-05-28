import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Search, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/shared/inputs/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/inputs/Select";
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { DetailDialog } from "@/components/shared/dialogs/DetailDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useGetProjectPermissions,
  useCreateOrUpdateProjectPermission,
  useDeleteProjectPermission,
  useGetAssignableUsers,
} from "../hooks/useProjectPermissions";

interface TabProjectUserPermissionProps {
  projectId: number;
}

const ROLES = [
  { value: 1, label: "Quản lý (Manager)" },
  { value: 2, label: "Nhân viên (Staff)" },
];

export function TabProjectUserPermission({ projectId }: TabProjectUserPermissionProps) {
  const [keyword, setKeyword] = useState("");
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [confirmDeletePermission, setConfirmDeletePermission] = useState<any | null>(null);

  // Assignment Form State
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("2"); // default Staff

  // Fetch current permissions
  const { data, isLoading, refetch } = useGetProjectPermissions({
    ProjectId: projectId,
    Keyword: keyword || undefined,
  });

  // Fetch users for assignment dropdown
  const { data: users = [], isLoading: isUsersLoading } = useGetAssignableUsers();

  const assignMutation = useCreateOrUpdateProjectPermission({
    onSuccess: () => {
      toast.success("Phân quyền người dùng thành công");
      refetch();
      setIsAssignOpen(false);
      setSelectedUserId("");
      setSelectedRoleId("2");
    },
  });

  const deleteMutation = useDeleteProjectPermission({
    onSuccess: () => {
      toast.success("Đã thu hồi quyền truy cập");
      refetch();
      setConfirmDeletePermission(null);
    },
  });

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Vui lòng chọn người dùng");
      return;
    }
    if (!selectedRoleId) {
      toast.error("Vui lòng chọn vai trò");
      return;
    }

    // Call API with array of inputs
    assignMutation.mutate({
      data: [
        {
          projectId,
          userId: Number(selectedUserId),
          typeId: Number(selectedRoleId) as any,
          isActive: true,
        },
      ],
    });
  };

  const getRoleLabel = (typeId?: number) => {
    const role = ROLES.find((r) => r.value === typeId);
    return role ? role.label : `Vai trò #${typeId}`;
  };

  const items = data ? (data as any).items || [] : [];

  return (
    <div className="space-y-4 pt-2">
      {/* Action Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên người dùng..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsAssignOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Thêm Thành viên
        </Button>
      </div>

      {/* Permissions List Table */}
      <div className="rounded-md border border-border/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thành viên</TableHead>
              <TableHead>Tên tài khoản</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead className="w-[100px] text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Đang tải danh sách phân quyền...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Chưa có thành viên nào được phân quyền cho dự án này.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-2.5 font-medium">
                      <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span>
                        {item.user?.displayName ||
                          `${item.user?.surname || ""} ${item.user?.name || ""}`.trim() ||
                          "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.user?.userName || "N/A"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.user?.emailAddress || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Shield className={`h-3.5 w-3.5 ${item.typeId === 1 ? "text-amber-500" : "text-blue-500"}`} />
                      <span className={`font-semibold ${item.typeId === 1 ? "text-amber-600 dark:text-amber-500" : "text-blue-600 dark:text-blue-500"}`}>
                        {getRoleLabel(item.typeId)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setConfirmDeletePermission(item)}
                      className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      title="Thu hồi quyền"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Assign User Permission Dialog */}
      <DetailDialog
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        title="Thêm thành viên dự án"
        description="Cấp quyền truy cập và chỉ định vai trò cho thành viên trong dự án này."
        formId="assign-permission-form"
        isPending={assignMutation.isPending}
      >
        <form id="assign-permission-form" onSubmit={handleAssignSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Chọn thành viên *</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={assignMutation.isPending}>
              <SelectTrigger>
                <SelectValue placeholder={isUsersLoading ? "Đang tải danh sách..." : "Chọn người dùng"} />
              </SelectTrigger>
              <SelectContent>
                {users.map((u: any) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.name} ({u.email || "Không có email"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Vai trò dự án *</label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId} disabled={assignMutation.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={String(r.value)}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </DetailDialog>

      {/* Confirm Revoke Permission Dialog */}
      <ConfirmDialog
        open={!!confirmDeletePermission}
        onOpenChange={(open) => !open && setConfirmDeletePermission(null)}
        title="Thu hồi quyền truy cập"
        description={`Bạn có chắc chắn muốn thu hồi quyền truy cập dự án của thành viên "${
          confirmDeletePermission?.user?.displayName || confirmDeletePermission?.user?.userName
        }" không?`}
        variant="destructive"
        onConfirm={() => {
          if (confirmDeletePermission) {
            deleteMutation.mutate({ params: { id: confirmDeletePermission.id } });
          }
        }}
      />
    </div>
  );
}
