import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "../inputs/Textarea";
import type { TextareaHTMLAttributes } from "react";

interface FormTextareaProps<T extends FieldValues>
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name"> {
  control: Control<T, any, any>;
  name: Path<T>;
  label: string;
  description?: string;
}

export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  ...props
}: FormTextareaProps<T>) {
  return (
    <FormField
      control={control as any}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel required={required}>{label}</FormLabel>
          <FormControl>
            <Textarea {...props} required={required} {...field} value={field.value ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
