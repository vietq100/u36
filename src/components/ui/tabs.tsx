import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
  activeValue?: string
}>({})

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ value, defaultValue, onValueChange, children, ...props }, ref) => {
  const [activeValue, setActiveValue] = React.useState(value || defaultValue)

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveValue(value)
    }
  }, [value])

  const handleValueChange = React.useCallback(
    (val: string) => {
      if (value === undefined) {
        setActiveValue(val)
      }
      onValueChange?.(val)
    },
    [value, onValueChange]
  )

  return (
    <TabsContext.Provider value={{ activeValue }}>
      <TabsPrimitive.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </TabsContext.Provider>
  )
})
Tabs.displayName = TabsPrimitive.Root.displayName

const TabsVariantContext = React.createContext<{
  variant: "default" | "underline" | "pills"
}>({
  variant: "default",
})

const tabsListVariants = cva(
  "inline-flex items-center justify-center text-muted-foreground",
  {
    variants: {
      variant: {
        default: "h-9 rounded-lg bg-muted p-1 gap-1",
        underline: "w-full justify-start border-b border-border/40 gap-6 bg-transparent p-0 h-auto rounded-none",
        pills: "inline-flex items-center gap-1.5 bg-muted/30 dark:bg-white/5 p-1 rounded-xl border border-border/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants>
>(({ className, variant = "default", ...props }, ref) => (
  <TabsVariantContext.Provider value={{ variant: variant || "default" }}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant, className }))}
      {...props}
    />
  </TabsVariantContext.Provider>
))
TabsList.displayName = TabsPrimitive.List.displayName

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "rounded-md px-3 py-1 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        underline: "pb-3 text-sm font-semibold relative rounded-none border-b-2 border-transparent bg-transparent px-0 py-0 data-[state=active]:text-primary data-[state=active]:font-bold text-muted-foreground hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
        pills: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/30 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/20 data-[state=active]:font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof tabsTriggerVariants> & {
      layoutId?: string
    }
>(({ className, variant, value, children, layoutId, ...props }, ref) => {
  const listContext = React.useContext(TabsVariantContext)
  const tabsContext = React.useContext(TabsContext)
  const activeVariant = variant || listContext.variant || "default"
  const isActive = tabsContext.activeValue === value

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      className={cn(tabsTriggerVariants({ variant: activeVariant, className }))}
      {...props}
    >
      {children}
      {isActive && activeVariant === "underline" && (
        <motion.span
          layoutId={layoutId || "activeTabIndicator"}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        />
      )}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:outline-none",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
