import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "../inputs/DatePicker";
import type { InputHTMLAttributes } from "react";

interface FormDatePickerProps<T extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type"> {
  control: Control<T, any, any>;
  name: Path<T>;
  label: string;
  description?: string;
}

export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  ...props
}: FormDatePickerProps<T>) {
  return (
    <FormField
      control={control as any}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel required={required}>{label}</FormLabel>
          <FormControl>
            <DatePicker {...props} required={required} {...field} value={field.value ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
