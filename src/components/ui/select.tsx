import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextType {
  value?: string
  onValueChange?: (val: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  search: string
  setSearch: (search: string) => void
  options: Array<{ value: string; label: string; disabled?: boolean }>
  registerOption: (value: string, label: string, disabled?: boolean) => void
  deregisterOption: (value: string) => void
  disabled: boolean
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

function useSelect() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be wrapped in <Select />")
  }
  return context
}

function Select({
  value,
  onValueChange,
  children,
  open: openProp,
  onOpenChange,
  disabled = false,
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> & {
  value?: string
  onValueChange?: (val: string) => void
  disabled?: boolean
}) {
  const [openState, setOpenState] = React.useState(false)
  const open = openProp !== undefined ? openProp : openState
  const setOpen = onOpenChange !== undefined ? onOpenChange : setOpenState

  const [search, setSearch] = React.useState("")
  const [options, setOptions] = React.useState<Array<{ value: string; label: string; disabled?: boolean }>>([])

  const registerOption = React.useCallback((value: string, label: string, disabled?: boolean) => {
    setOptions((prev) => {
      const existing = prev.find((opt) => opt.value === value)
      if (existing) {
        if (existing.label === label && existing.disabled === disabled) {
          return prev
        }
        return prev.map((opt) => opt.value === value ? { value, label, disabled } : opt)
      }
      return [...prev, { value, label, disabled }]
    })
  }, [])

  const deregisterOption = React.useCallback((value: string) => {
    setOptions((prev) => {
      if (!prev.some((opt) => opt.value === value)) {
        return prev
      }
      return prev.filter((opt) => opt.value !== value)
    })
  }, [])

  React.useEffect(() => {
    if (!open) {
      setSearch("")
    }
  }, [open])

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange,
        open,
        setOpen,
        search,
        setSearch,
        options,
        registerOption,
        deregisterOption,
        disabled,
      }}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen} {...props}>
        {children}
      </PopoverPrimitive.Root>
    </SelectContext.Provider>
  )
}

function SelectGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="select-group" className={cn("p-1", className)} {...props} />
}

function SelectValue({
  placeholder,
  ...props
}: React.ComponentPropsWithoutRef<"span"> & {
  placeholder?: string
}) {
  const { value, options } = useSelect()
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <span data-slot="select-value" className="truncate flex-1" {...props}>
      {selectedOption ? selectedOption.label : placeholder}
    </span>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> & {
    size?: "sm" | "default"
  }
>(({ className, children, size = "default", disabled: disabledProp, ...props }, ref) => {
  const { disabled: contextDisabled } = useSelect()
  const disabled = disabledProp || contextDisabled

  return (
    <PopoverPrimitive.Trigger
      ref={ref}
      disabled={disabled}
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex h-8 w-full items-center justify-between gap-1.5 rounded-xl border border-border bg-input py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground transition-all duration-200 text-left",
        className
      )}
      {...props}
    >
      {children}
      <ChevronsUpDown className="pointer-events-none size-4 shrink-0 opacity-50 text-muted-foreground" />
    </PopoverPrimitive.Trigger>
  )
})
SelectTrigger.displayName = "SelectTrigger"

function getTextFromChildren(children: React.ReactNode): string {
  if (children === null || children === undefined) return ""
  if (typeof children === "string" || typeof children === "number") {
    return String(children)
  }
  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join("")
  }
  if (React.isValidElement(children)) {
    return getTextFromChildren((children as React.ReactElement<any>).props.children)
  }
  return ""
}

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    searchPlaceholder?: string
    emptyMessage?: string
    showSearch?: boolean
  }
>(({ className, children, searchPlaceholder = "Tìm kiếm...", emptyMessage = "Không tìm thấy kết quả.", showSearch = true, ...props }, ref) => {
  const { search, setSearch, options } = useSelect()

  // Mặc định luôn hiện ô search trừ khi showSearch={false} được truyền vào
  const showSearchInput = showSearch && options.length > 0

  // Đếm xem có bao nhiêu option đang khớp với từ khóa tìm kiếm
  const matchedCount = React.useMemo(() => {
    if (!search) return options.length
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    ).length
  }, [options, search])

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        data-slot="select-content"
        className={cn(
          "relative z-50 max-h-60 w-[var(--radix-popover-trigger-width)] min-w-36 overflow-x-hidden overflow-y-auto rounded-xl border border-border/60 bg-popover/80 dark:bg-black/60 backdrop-blur-xl p-1 text-popover-foreground shadow-2xl outline-none duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        align="start"
        sideOffset={4}
        {...props}
      >
        {showSearchInput && (
          <div className="flex items-center border-b border-border/50 px-2.5 pb-1 mb-1">
            <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50 text-muted-foreground" />
            <input
              autoFocus
              className="flex h-8 w-full rounded-md bg-transparent py-1 text-xs outline-none placeholder:text-muted-foreground text-foreground"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()} // Ngăn chặn radix bắt sự kiện Space/Enter đóng popover
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        <div className="space-y-0.5 max-h-48 overflow-y-auto">
          {matchedCount === 0 && options.length > 0 ? (
            <div className="py-2 text-center text-xs text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            children
          )}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
})
SelectContent.displayName = "SelectContent"

function SelectLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="select-label" className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)} {...props} />
}

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    value: string
    disabled?: boolean
  }
>(({ className, children, value, disabled = false, ...props }, ref) => {
  const { value: selectedValue, onValueChange, setOpen, search, registerOption, deregisterOption } = useSelect()

  // Lấy nhãn dạng text sạch để dùng cho search
  const labelText = React.useMemo(() => {
    return getTextFromChildren(children)
  }, [children])

  // Đăng ký option khi component mount
  React.useEffect(() => {
    registerOption(value, labelText, disabled)
    return () => {
      deregisterOption(value)
    }
  }, [value, labelText, disabled, registerOption, deregisterOption])

  // Kiểm tra khớp từ khóa tìm kiếm
  const isMatch = React.useMemo(() => {
    if (!search) return true
    return labelText.toLowerCase().includes(search.toLowerCase())
  }, [search, labelText])

  if (!isMatch) return null

  const isSelected = selectedValue === value

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      data-disabled={disabled}
      onClick={() => {
        if (disabled) return
        onValueChange?.(value)
        setOpen(false)
      }}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-lg px-2 py-1.5 text-xs outline-none transition-all hover:bg-primary/10 hover:text-primary data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 text-foreground text-left",
        isSelected && "bg-primary/10 text-primary font-semibold",
        className
      )}
      {...props}
    >
      <span className="flex-1 truncate">{children}</span>
      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

function SelectSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="select-separator" className={cn("-mx-1 my-1 h-px bg-border/50", className)} {...props} />
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
