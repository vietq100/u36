import { useState } from "react";
import { toast } from "sonner";
import { Download, File, Trash2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/shared/inputs/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/inputs/Select";
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { DetailDialog } from "@/components/shared/dialogs/DetailDialog";
import { useGetDocuments, useUploadProjectDocument, useDeleteDocument, useGetDocumentTypes } from "../hooks/useProjectDocuments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TabDocumentProps {
  inputId?: string;
}

export function TabDocument({ inputId }: TabDocumentProps) {
  const [keyword, setKeyword] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<any | null>(null);

  // Form states for upload
  const [docName, setDocName] = useState("");
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: documentTypes = [] } = useGetDocumentTypes();
  const { data, isLoading, refetch } = useGetDocuments({
    inputId,
  });

  const uploadMutation = useUploadProjectDocument({
    onSuccess: () => {
      toast.success("Tải tài liệu lên thành công");
      refetch();
      setIsUploadOpen(false);
      // reset form
      setDocName("");
      setSelectedDocTypeId("");
      setSelectedFile(null);
    },
  });

  const deleteMutation = useDeleteDocument({
    onSuccess: () => {
      toast.success("Đã xóa tài liệu");
      refetch();
      setConfirmDeleteDoc(null);
    },
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Vui lòng chọn tệp tin cần tải lên");
      return;
    }
    if (!docName.trim()) {
      toast.error("Vui lòng nhập tên tài liệu");
      return;
    }
    if (!selectedDocTypeId) {
      toast.error("Vui lòng chọn loại tài liệu");
      return;
    }

    uploadMutation.mutate({
      params: {
        UniqueId: inputId || "",
        DocumentName: docName,
        DocumentTypeId: Number(selectedDocTypeId),
        UploadDate: new Date().toISOString(),
      },
      file: selectedFile,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!docName) {
        // Default document name to filename (without extension)
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setDocName(nameWithoutExt);
      }
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const items = data ? (data as any).items || [] : [];

  return (
    <div className="space-y-4 pt-2">
      {/* Action Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm tài liệu..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Tải lên Tài liệu
        </Button>
      </div>

      {/* Document Table */}
      <div className="rounded-md border border-border/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên tài liệu</TableHead>
              <TableHead>Loại tài liệu</TableHead>
              <TableHead className="text-right">Kích thước</TableHead>
              <TableHead>Ngày tải lên</TableHead>
              <TableHead className="w-[120px] text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Đang tải danh sách tài liệu...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Chưa có tài liệu nào được tải lên cho dự án này.
                </TableCell>
              </TableRow>
            ) : (
              items.map((doc: any) => (
                <TableRow key={doc.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <File className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate max-w-[250px]">{doc.documentName || doc.originalFileName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 bg-muted rounded">
                      {doc.documentType?.name || "Tài liệu chung"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground font-mono text-xs">
                    {formatFileSize(doc.size)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString("vi-VN") : "N/A"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {doc.fileUrl && (
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setConfirmDeleteDoc(doc)}
                        className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Upload Dialog */}
      <DetailDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        title="Tải lên tài liệu mới"
        description="Chọn tệp tin và nhập thông tin tài liệu liên kết với dự án này."
        formId="doc-upload-form"
        isPending={uploadMutation.isPending}
      >
        <form id="doc-upload-form" onSubmit={handleUploadSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Chọn file đính kèm *</label>
            <Input type="file" required onChange={handleFileChange} disabled={uploadMutation.isPending} />
            {selectedFile && (
              <p className="text-xs text-muted-foreground">
                Kích thước file: {formatFileSize(selectedFile.size)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Tên tài liệu *</label>
            <Input
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Nhập tên mô tả tài liệu..."
              required
              disabled={uploadMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Loại tài liệu *</label>
            <Select value={selectedDocTypeId} onValueChange={setSelectedDocTypeId} disabled={uploadMutation.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại tài liệu" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((t: any) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </DetailDialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!confirmDeleteDoc}
        onOpenChange={(open) => !open && setConfirmDeleteDoc(null)}
        title="Xóa tài liệu"
        description={`Bạn có chắc chắn muốn xóa tài liệu "${confirmDeleteDoc?.documentName || confirmDeleteDoc?.originalFileName}" không?`}
        variant="destructive"
        onConfirm={() => {
          if (confirmDeleteDoc) {
            deleteMutation.mutate({ params: { Id: confirmDeleteDoc.guid } });
          }
        }}
      />
    </div>
  );
}
