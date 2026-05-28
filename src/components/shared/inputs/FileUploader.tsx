import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  value?: string | File | null;
  onChange: (file: File | null) => void;
  accept?: Record<string, string[]>;
  maxSize?: number; // bytes
  placeholder?: string;
  disabled?: boolean;
}

export function FileUploader({
  value,
  onChange,
  accept = { "image/*": [".jpeg", ".png", ".jpg"], "application/pdf": [".pdf"] },
  maxSize = 5242880, // 5MB
  placeholder = "Kéo thả tệp tin vào đây, hoặc click để chọn tệp",
  disabled = false,
}: FileUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof value === "string" ? value : null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(
    value instanceof File ? value : null
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize,
    disabled,
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0] || null;
      setSelectedFile(file);
      onChange(file);

      if (file) {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setPreviewUrl(null);
        }
      } else {
        setPreviewUrl(null);
      }
    },
  });

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    onChange(null);
  };

  const hasFile = selectedFile || previewUrl;
  const fileName = selectedFile ? selectedFile.name : typeof value === "string" ? value.split("/").pop() : "";
  const isImage = selectedFile?.type.startsWith("image/") || (typeof value === "string" && (value.match(/\.(jpeg|jpg|gif|png)$/i) !== null));

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-input border-2 border-dashed border-border bg-input px-6 py-6 text-center cursor-pointer transition-all hover:bg-muted/10 hover:border-ring focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
          isDragActive && "border-primary bg-primary/5",
          disabled && "bg-muted opacity-70 cursor-not-allowed pointer-events-none"
        )}
      >
        <input {...getInputProps()} />

        {hasFile ? (
          <div className="flex flex-col items-center gap-3 w-full relative group">
            {/* Image Preview */}
            {isImage && (previewUrl || selectedFile) ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-md border border-border shadow-sm">
                <img
                  src={previewUrl || ""}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-input bg-primary/10 text-primary">
                <FileIcon className="h-7 w-7" />
              </div>
            )}

            {/* File Info */}
            <div className="text-sm">
              <p className="font-semibold text-foreground truncate max-w-[280px]">
                {fileName}
              </p>
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-0 right-0 p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
              title="Xóa tệp"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2.5 text-primary group-hover:scale-105 transition-transform duration-200">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div className="text-sm">
              <span className="font-semibold text-primary hover:underline">
                Click để tải lên
              </span>{" "}
              hoặc kéo thả
            </div>
            <p className="text-xs text-muted-foreground">
              {placeholder}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
