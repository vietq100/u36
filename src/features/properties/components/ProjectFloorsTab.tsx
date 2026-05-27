import { useState } from "react";
import { Plus, Edit, Check, X, Power } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useGetProjectFloors,
  useCreateOrUpdateFloor,
  useToggleFloorActive,
} from "../hooks/useProperties";
import type { Floor } from "../types";

interface ProjectFloorsTabProps {
  projectId: number;
}

export function ProjectFloorsTab({ projectId }: ProjectFloorsTabProps) {
  const { data: floors = [], isLoading, refetch } = useGetProjectFloors(projectId);
  
  // State for tracking which row is being edited/created
  const [editingId, setEditingId] = useState<number | string | null>(null);
  
  // Temporary state for the inline form inputs
  const [editForm, setEditForm] = useState({
    floorName: "",
    size: 0,
  });

  // Local list to easily prepend a temporary "new row"
  const [localNewFloor, setLocalNewFloor] = useState<Floor | null>(null);

  const saveMutation = useCreateOrUpdateFloor({
    onSuccess: () => {
      toast.success("Lưu thông tin tầng thành công");
      setEditingId(null);
      setLocalNewFloor(null);
      refetch();
    },
  });

  const toggleActiveMutation = useToggleFloorActive({
    onSuccess: () => {
      refetch();
    },
  });

  const handleAddRow = () => {
    if (editingId !== null) {
      toast.warning("Vui lòng hoàn tất hoặc hủy hàng đang chỉnh sửa trước.");
      return;
    }

    const tempNewFloor: Floor = {
      id: 0, // 0 signifies a new record to the API
      floorName: "",
      size: 0,
      order: floors.length + 1,
      isActive: true,
      projectId,
      numberOfUnits: 0,
    };

    setLocalNewFloor(tempNewFloor);
    setEditingId("new");
    setEditForm({
      floorName: "",
      size: 0,
    });
  };

  const handleEditClick = (floor: Floor) => {
    if (editingId !== null) {
      toast.warning("Vui lòng hoàn tất hoặc hủy hàng đang chỉnh sửa trước.");
      return;
    }

    setEditingId(floor.id);
    setEditForm({
      floorName: floor.floorName,
      size: floor.size,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setLocalNewFloor(null);
  };

  const handleSave = (id: number | string) => {
    if (!editForm.floorName.trim()) {
      toast.error("Tên tầng không được để trống");
      return;
    }

    saveMutation.mutate({
      data: {
        id: id === "new" ? undefined : (id as number),
        projectId,
        floorName: editForm.floorName,
        size: editForm.size,
        order: id === "new" ? floors.length + 1 : undefined,
      },
    });
  };

  const handleToggleActive = (floor: Floor) => {
    toggleActiveMutation.mutate({
      data: { id: floor.id },
      params: { isActive: !floor.isActive },
    }, {
      onSuccess: () => {
        toast.success(
          floor.isActive ? `Đã ngưng hoạt động tầng ${floor.floorName}` : `Đã kích hoạt tầng ${floor.floorName}`
        );
      }
    });
  };

  // Combine fetched floors with the unsaved new floor if present
  const displayFloors = localNewFloor ? [localNewFloor, ...floors] : floors;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Danh sách sàn/tầng</h3>
          <p className="text-xs text-muted-foreground">
            Quản lý thông tin chi tiết diện tích các tầng trong dự án.
          </p>
        </div>
        <Button 
          type="button" 
          onClick={handleAddRow}
          size="sm"
          disabled={editingId !== null || isLoading}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Thêm Tầng
        </Button>
      </div>

      <div className="border border-border/40 rounded-xl overflow-hidden bg-card/25 backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px]">Trạng thái</TableHead>
              <TableHead>Tên Tầng / Sàn</TableHead>
              <TableHead className="text-right">Diện tích (m²)</TableHead>
              <TableHead className="text-right">Số Căn hộ</TableHead>
              <TableHead className="w-[120px] text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Đang tải danh sách tầng...
                </TableCell>
              </TableRow>
            ) : displayFloors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Chưa có thông tin tầng nào được thiết lập.
                </TableCell>
              </TableRow>
            ) : (
              displayFloors.map((floor) => {
                const isEditing = editingId === (floor.id === 0 ? "new" : floor.id);
                
                return (
                  <TableRow key={floor.id === 0 ? "new" : floor.id} className="hover:bg-muted/20 dark:hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            floor.isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {floor.isActive ? "Hoạt động" : "Ngưng"}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editForm.floorName}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, floorName: e.target.value }))}
                          placeholder="Ví dụ: Tầng 1"
                          className="h-8 max-w-[200px]"
                        />
                      ) : (
                        <span className="font-medium text-foreground">{floor.floorName}</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.size || ""}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, size: Number(e.target.value) }))}
                          placeholder="0"
                          className="h-8 w-24 ml-auto text-right"
                        />
                      ) : (
                        <span className="font-mono">{floor.size.toLocaleString("vi-VN")} m²</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right text-muted-foreground font-mono">
                      {floor.id === 0 ? "-" : `${floor.numberOfUnits || 0} căn`}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                            onClick={() => handleSave(floor.id === 0 ? "new" : floor.id)}
                            disabled={saveMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            onClick={handleCancel}
                            disabled={saveMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => handleEditClick(floor)}
                            title="Sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {floor.id !== 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                floor.isActive 
                                  ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                                  : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                              }`}
                              onClick={() => handleToggleActive(floor)}
                              title={floor.isActive ? "Ngưng hoạt động" : "Kích hoạt"}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
