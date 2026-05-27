import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  value: string | number;
  label: React.ReactNode;
}

interface FormSelectProps<T extends FieldValues> {
  control: Control<T, any, any>;
  name: Path<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  valueType?: "string" | "number";
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Chọn một mục...",
  description,
  disabled = false,
  valueType,
}: FormSelectProps<T>) {
  return (
    <FormField
      control={control as any}
      name={name as any}
      render={({ field }) => {
        const isNumeric = valueType === "number" || typeof options[0]?.value === "number";
        const valStr = field.value !== undefined && field.value !== null ? String(field.value) : "";

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <Select
              disabled={disabled}
              onValueChange={(val) => {
                field.onChange(isNumeric ? Number(val) : val);
              }}
              value={valStr}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
