import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Shield, User, Building, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/shared/inputs/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/inputs/Select";
import { DetailDialog } from "@/components/shared/dialogs/DetailDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetProjects } from "../hooks/useProperties";
import { useGetAssignableUsers, useCreateOrUpdateProjectPermission } from "../hooks/useProjectPermissions";

interface AddUserPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface DraftPermission {
  userId: number;
  userName: string;
  projectId: number;
  projectName: string;
  typeId: number; // 1 = READ, 2 = WRITE
}

export function AddUserPermissionDialog({ open, onOpenChange, onSuccess }: AddUserPermissionDialogProps) {
  // Search states for selection boxes
  const [userKeyword, setUserKeyword] = useState("");
  const [projectKeyword, setProjectKeyword] = useState("");

  // Selected arrays
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [defaultTypeId, setDefaultTypeId] = useState<number>(2); // Default to WRITE (Toàn quyền)

  // Draft table state
  const [drafts, setDrafts] = useState<DraftPermission[]>([]);

  // Fetch projects and assignable users
  const { data: projectsData, isLoading: isProjectsLoading } = useGetProjects({
    SkipCount: 0,
    MaxResultCount: 500,
    IsActive: true,
  });

  const { data: users = [], isLoading: isUsersLoading } = useGetAssignableUsers();

  const mutation = useCreateOrUpdateProjectPermission({
    onSuccess: () => {
      toast.success("Lưu phân quyền hàng loạt thành công");
      onSuccess?.();
      onOpenChange(false);
      setDrafts([]);
    },
  });

  // Filter projects and users based on search
  const filteredUsers = users.filter((u: any) =>
    u.name.toLowerCase().includes(userKeyword.toLowerCase()) ||
    u.email.toLowerCase().includes(userKeyword.toLowerCase())
  );

  const filteredProjects = ((projectsData as any)?.items || []).filter((p: any) =>
    p.projectName.toLowerCase().includes(projectKeyword.toLowerCase()) ||
    p.projectCode.toLowerCase().includes(projectKeyword.toLowerCase())
  );

  // Clear states when dialog opens
  useEffect(() => {
    if (open) {
      setUserKeyword("");
      setProjectKeyword("");
      setSelectedUserIds([]);
      setSelectedProjectIds([]);
      setDefaultTypeId(2);
      setDrafts([]);
    }
  }, [open]);

  const handleToggleUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleProject = (projectId: number) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u: any) => u.id));
    }
  };

  const handleSelectAllProjects = () => {
    if (selectedProjectIds.length === filteredProjects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(filteredProjects.map((p: any) => p.id));
    }
  };

  // Push combinations to drafts
  const handlePush = () => {
    if (selectedUserIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một nhân viên");
      return;
    }
    if (selectedProjectIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dự án");
      return;
    }

    const newDrafts: DraftPermission[] = [];

    selectedUserIds.forEach((uId) => {
      const userObj = users.find((u: any) => u.id === uId);
      if (!userObj) return;

      selectedProjectIds.forEach((pId) => {
        const projObj = (projectsData?.items || []).find((p: any) => p.id === pId);
        if (!projObj) return;

        // Check duplicate in current drafts
        const isDuplicate = drafts.some((d) => d.userId === uId && d.projectId === pId);
        if (!isDuplicate) {
          newDrafts.push({
            userId: uId,
            userName: userObj.name,
            projectId: pId,
            projectName: projObj.projectName,
            typeId: defaultTypeId,
          });
        }
      });
    });

    if (newDrafts.length === 0) {
      toast.info("Tất cả các tổ hợp đã tồn tại trong danh sách nháp");
      return;
    }

    setDrafts((prev) => [...prev, ...newDrafts]);
    toast.success(`Đã thêm ${newDrafts.length} tổ hợp phân quyền vào danh sách nháp`);
    
    // Clear selection
    setSelectedUserIds([]);
    setSelectedProjectIds([]);
  };

  const handleRemoveDraft = (index: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleDraftPermission = (index: number) => {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, typeId: d.typeId === 1 ? 2 : 1 } : d))
    );
  };

  const handleSaveAll = () => {
    if (drafts.length === 0) {
      toast.error("Không có dữ liệu phân quyền nào trong danh sách nháp để lưu");
      return;
    }

    // Map drafts to backend payload list
    const payload = drafts.map((d) => ({
      projectId: d.projectId,
      userId: d.userId,
      typeId: d.typeId as any,
      isActive: true,
    }));

    mutation.mutate({
      data: payload,
    });
  };

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Phân quyền nhanh nhân sự & dự án"
      description="Gán nhanh quyền truy cập dự án cho nhiều nhân viên cùng lúc và xem trước trước khi lưu."
      className="sm:max-w-[900px] w-full"
      onSave={handleSaveAll}
      isPending={mutation.isPending}
      saveLabel="Lưu thay đổi"
    >
      <div className="space-y-6 py-2">
        {/* Step 1: Configuration Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* User selector column */}
          <div className="border border-border/40 rounded-dialog p-4 space-y-3 bg-muted/10 backdrop-blur-md shadow-sm flex flex-col h-[340px]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-1.5 text-primary">
                <User className="h-4 w-4" /> 1. Nhân viên ({selectedUserIds.length})
              </span>
              <button
                type="button"
                onClick={handleSelectAllUsers}
                className="text-[10px] text-muted-foreground hover:text-foreground font-semibold"
              >
                {selectedUserIds.length === filteredUsers.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>
            <Input
              placeholder="Tìm theo tên hoặc email..."
              value={userKeyword}
              onChange={(e) => setUserKeyword(e.target.value)}
              className="h-8 text-xs"
            />
            <div className="flex-1 overflow-y-auto border border-border/20 rounded-md p-2 space-y-2 bg-card">
              {isUsersLoading ? (
                <div className="text-xs text-muted-foreground text-center py-8">Đang tải danh sách...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-8">Không tìm thấy kết quả</div>
              ) : (
                filteredUsers.map((u: any) => (
                  <div key={u.id} className="flex items-center space-x-2 text-xs">
                    <Checkbox
                      id={`user-${u.id}`}
                      checked={selectedUserIds.includes(u.id)}
                      onCheckedChange={() => handleToggleUser(u.id)}
                    />
                    <label
                      htmlFor={`user-${u.id}`}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none truncate flex-1"
                      title={`${u.name} (${u.email})`}
                    >
                      {u.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Project selector column */}
          <div className="border border-border/40 rounded-dialog p-4 space-y-3 bg-muted/10 backdrop-blur-md shadow-sm flex flex-col h-[340px]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-1.5 text-primary">
                <Building className="h-4 w-4" /> 2. Dự án ({selectedProjectIds.length})
              </span>
              <button
                type="button"
                onClick={handleSelectAllProjects}
                className="text-[10px] text-muted-foreground hover:text-foreground font-semibold"
              >
                {selectedProjectIds.length === filteredProjects.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>
            <Input
              placeholder="Tìm theo tên hoặc mã..."
              value={projectKeyword}
              onChange={(e) => setProjectKeyword(e.target.value)}
              className="h-8 text-xs"
            />
            <div className="flex-1 overflow-y-auto border border-border/20 rounded-md p-2 space-y-2 bg-card">
              {isProjectsLoading ? (
                <div className="text-xs text-muted-foreground text-center py-8">Đang tải danh sách...</div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-8">Không tìm thấy kết quả</div>
              ) : (
                filteredProjects.map((p: any) => (
                  <div key={p.id} className="flex items-center space-x-2 text-xs">
                    <Checkbox
                      id={`project-${p.id}`}
                      checked={selectedProjectIds.includes(p.id)}
                      onCheckedChange={() => handleToggleProject(p.id)}
                    />
                    <label
                      htmlFor={`project-${p.id}`}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none truncate flex-1"
                      title={p.projectName}
                    >
                      {p.projectName}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Type and Add column */}
          <div className="border border-border/40 rounded-dialog p-4 bg-muted/10 backdrop-blur-md shadow-sm h-[340px] flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-sm font-semibold flex items-center gap-1.5 text-primary">
                <Shield className="h-4 w-4" /> 3. Quyền hạn gán
              </span>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Vai trò mặc định</label>
                <Select value={String(defaultTypeId)} onValueChange={(val) => setDefaultTypeId(Number(val))}>
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Chỉ xem (Read / Staff)</SelectItem>
                    <SelectItem value="2">Toàn quyền (Write / Manager)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                Nhấp vào <strong>Thêm vào danh sách</strong> để tạo các tổ hợp phân quyền. Sau đó có thể chỉnh sửa riêng biệt từng dòng ở bảng bên dưới.
              </p>
            </div>
            <Button type="button" onClick={handlePush} className="w-full shrink-0">
              <Plus className="h-4 w-4 mr-2" /> Thêm vào danh sách nháp
            </Button>
          </div>
        </div>

        {/* Step 2: Draft Preview Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Danh sách phân quyền nháp ({drafts.length} dòng)
            </h4>
            {drafts.length > 0 && (
              <button
                type="button"
                onClick={() => setDrafts([])}
                className="text-xs text-red-500 hover:text-red-600 font-semibold"
              >
                Xóa tất cả nháp
              </button>
            )}
          </div>

          <div className="rounded-md border border-border/40 overflow-hidden max-h-[220px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 backdrop-blur-sm z-10">
                <TableRow>
                  <TableHead>Nhân sự</TableHead>
                  <TableHead>Dự án</TableHead>
                  <TableHead className="w-[180px] text-center">Quyền hạn (Read / Write)</TableHead>
                  <TableHead className="w-[80px] text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drafts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs">
                      Chưa có tổ hợp phân quyền nào. Chọn nhân viên & dự án phía trên rồi nhấp "Thêm vào danh sách nháp".
                    </TableCell>
                  </TableRow>
                ) : (
                  drafts.map((d, index) => (
                    <TableRow key={`${d.userId}-${d.projectId}`} className="hover:bg-muted/10 text-xs">
                      <TableCell className="font-medium">{d.userName}</TableCell>
                      <TableCell>{d.projectName}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-[10px] font-semibold ${d.typeId === 1 ? "text-primary" : "text-muted-foreground"}`}>
                            Xem (Read)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleDraftPermission(index)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              d.typeId === 2 ? "bg-amber-500" : "bg-muted"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                                d.typeId === 2 ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-semibold ${d.typeId === 2 ? "text-amber-500" : "text-muted-foreground"}`}>
                            Ghi (Write)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDraft(index)}
                          className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DetailDialog>
  );
}
