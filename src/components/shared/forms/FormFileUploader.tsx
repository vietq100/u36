import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FileUploader } from "../inputs/FileUploader";

interface FormFileUploaderProps<T extends FieldValues> {
  control: Control<T, any, any>;
  name: Path<T>;
  label: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}

export function FormFileUploader<T extends FieldValues>({
  control,
  name,
  label,
  accept,
  maxSize,
  placeholder,
  description,
  disabled = false,
}: FormFileUploaderProps<T>) {
  return (
    <FormField
      control={control as any}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <FileUploader
              value={field.value}
              onChange={field.onChange}
              accept={accept}
              maxSize={maxSize}
              placeholder={placeholder}
              disabled={disabled}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
