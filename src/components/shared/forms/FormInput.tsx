import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { InputHTMLAttributes } from "react";

interface FormInputProps<T extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  ...props
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...props} {...field} value={field.value ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
