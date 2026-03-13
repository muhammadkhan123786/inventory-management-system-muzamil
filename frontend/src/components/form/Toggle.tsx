"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Base behavior with direct hover/active colors
        default: [
          "bg-transparent text-[#1a1d3f]",
          "hover:bg-[#f3f4f6] hover:text-[#4f46e5]",
          "data-[state=on]:bg-[#f0f0ff] data-[state=on]:text-[#4f46e5]"
        ].join(" "),
        
        // Outline matches your Input border: #e5e7eb
        outline: [
          "border border-[#e5e7eb] bg-transparent text-[#1a1d3f]",
          "hover:bg-[#f3f4f6] hover:text-[#4f46e5]",
          "data-[state=on]:bg-[#f0f0ff] data-[state=on]:text-[#4f46e5] data-[state=on]:border-[#4f46e5]"
        ].join(" "),
      },
      size: {
        // Updated to h-10 to align with your other form fields
        default: "h-10 px-3 min-w-10",
        sm: "h-8 px-2 min-w-8",
        lg: "h-12 px-4 min-w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(
        toggleVariants({ variant, size, className }),
        // Direct focus ring color: Indigo
        "focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40"
      )}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };