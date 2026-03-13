import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // Base classes
//  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  "inline-flex items-center justify-center rounded-lg border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-all",
  {
    variants: {
      variant: {
        default: "border-transparent  text-primary-foreground",
        secondary: "border-transparent bg-[#8b5cf6] text-[#ffffff]",
        destructive: "border-transparent bg-[#ef4444] text-white",
        outline: "#ffffff",
        // ADD YOUR CUSTOM CSS CLASSES HERE:
        shimmer: "border-transparent animate-shimmer text-white bg-[#4f46e5]",
        rainbow: "border-transparent bg-rainbow text-white",
        gradient: "border-transparent btn-gradient bg-gradient-primary text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      // The 'cn' utility will merge your CVA variant and any extra className
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };