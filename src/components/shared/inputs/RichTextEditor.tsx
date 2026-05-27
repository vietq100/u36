import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Undo, Redo, Heading1, Heading2 } from "lucide-react";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung mô tả...",
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep editor content in sync with external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border rounded-input overflow-hidden bg-input focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-all duration-200">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-muted/40 border-b border-border p-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run() || disabled}
          className={`p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("bold") ? "bg-muted text-primary font-bold" : ""
          }`}
          title="In đậm"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run() || disabled}
          className={`p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("italic") ? "bg-muted text-primary" : ""
          }`}
          title="In nghiêng"
        >
          <Italic className="h-4 w-4" />
        </button>

        <span className="w-px h-4 bg-border/80 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={disabled}
          className={`p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("heading", { level: 1 }) ? "bg-muted text-primary font-bold" : ""
          }`}
          title="Tiêu đề lớn"
        >
          <Heading1 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          className={`p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("heading", { level: 2 }) ? "bg-muted text-primary font-bold" : ""
          }`}
          title="Tiêu đề nhỏ"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <span className="w-px h-4 bg-border/80 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={`p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("bulletList") ? "bg-muted text-primary" : ""
          }`}
          title="Danh sách dấu chấm"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          className={`p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("orderedList") ? "bg-muted text-primary" : ""
          }`}
          title="Danh sách số"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <span className="w-px h-4 bg-border/80 mx-1 flex-1 sm:block hidden" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run() || disabled}
          className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Hoàn tác"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run() || disabled}
          className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Làm lại"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent
        editor={editor}
        className="p-3 min-h-[120px] max-h-[300px] overflow-y-auto outline-none prose prose-sm dark:prose-invert max-w-none text-sm text-foreground focus-visible:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}
