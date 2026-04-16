"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer"

// Detect touch/mobile — used to swap dropdown for bottom drawer
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
  const isMobile = useIsMobile();

  // On mobile: hide the floating dropdown (MobileSelect handles the drawer)
  if (isMobile) {
    return (
      <>
        {/* Hidden radix trigger to control open state */}
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            ref={ref}
            className="hidden"
            position={position}
            {...props}
          >
            <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </>
    );
  }

  // Desktop: original radix dropdown
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn("p-1", position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
})
SelectContent.displayName = SelectPrimitive.Content.displayName

// Mobile-friendly Select that uses a Drawer for the options list
// Wraps the standard Select but intercepts open state to show a Drawer on small screens
const MobileSelect = ({ value, onValueChange, children, placeholder }) => {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Extract SelectItem children for rendering in the drawer
  const items = React.Children.toArray(children).flatMap(child => {
    if (!child) return [];
    // Handle SelectContent wrapper
    if (child.props?.children) {
      return React.Children.toArray(child.props.children);
    }
    return [child];
  });

  if (!isMobile) {
    return (
      <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
        {children}
      </SelectPrimitive.Root>
    );
  }

  // Find the label of the currently selected item
  const selectedLabel = items.reduce((acc, item) => {
    if (item?.props?.value === value) return item.props.children;
    return acc;
  }, null);

  return (
    <>
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} open={false}>
        <SelectPrimitive.Trigger
          onClick={() => setDrawerOpen(true)}
          className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <span className={selectedLabel ? '' : 'text-muted-foreground'}>
            {selectedLabel || placeholder || 'Select…'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Trigger>
      </SelectPrimitive.Root>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="pb-[env(safe-area-inset-bottom)]">
          <div className="p-4 space-y-1 max-h-[60vh] overflow-y-auto">
            {items.map((item, i) => {
              if (!item?.props?.value) return null;
              const isSelected = item.props.value === value;
              return (
                <button
                  key={item.props.value ?? i}
                  onClick={() => { onValueChange(item.props.value); setDrawerOpen(false); }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-secondary text-foreground"
                  )}
                >
                  {item.props.children}
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
MobileSelect.displayName = "MobileSelect";

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props} />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  MobileSelect,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}