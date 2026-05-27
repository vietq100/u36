import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Combobox } from "../inputs/Combobox";

interface ComboboxOption {
  value: number | string;
  label: string;
}

interface FormComboboxProps<T extends FieldValues> {
  control: Control<T, any, any>;
  name: Path<T>;
  label: string;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  description?: string;
  disabled?: boolean;
  onChange?: (value: number | string) => void;
}

export function FormCombobox<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  description,
  disabled = false,
  onChange,
}: FormComboboxProps<T>) {
  return (
    <FormField
      control={control as any}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Combobox
              options={options}
              value={field.value}
              onChange={(val) => {
                field.onChange(val);
                onChange?.(val);
              }}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              emptyMessage={emptyMessage}
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
