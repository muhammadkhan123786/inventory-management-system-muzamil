import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#4f46e5] text-primary-[#ffffff] hover:bg-[#4f46e5]/90 focus-visible:ring-[#4f46e5]/40",
        destructive:
          "bg-[#ef4444] text-white hover:bg-[#ef4444]/90 focus-visible:ring-[#ef4444]/20 ",
        outline:
          "border bg-[#f8f9ff] text-[#1a1d3f] hover:bg-[#10b981] hover:text-[#ffffff] focus-visible:ring-2 focus-visible:ring-[#10b981]/40",
        secondary: "bg-[#8b5cf6] text-[#ffffff] hover:bg-[#8b5cf6]/80",

        ghost:
          "hover:bg-[#10b981] hover:text-[#ffffff] focus-visible:ring-2 focus-visible:ring-[#10b981]/40",
        link: "text-[#4f46e5] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "size-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
