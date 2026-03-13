"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Base: matches your Input background #f3f4f6 and border #e5e7eb
        "peer size-4 shrink-0 rounded-[4px] border border-[#e5e7eb] bg-[#f3f4f6] shadow-sm transition-all outline-none",
        // Checked State: Indigo background #4f46e5 and Indigo border
        "data-[state=checked]:bg-[#4f46e5] data-[state=checked]:border-[#4f46e5] data-[state=checked]:text-white",
        // Focus State: Indigo ring
        "focus-visible:ring-2 focus-visible:ring-[#4f46e5]/20 focus-visible:border-[#4f46e5]",
        // Error State: Red border #ef4444
        "aria-invalid:border-[#ef4444] aria-invalid:ring-[#ef4444]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <CheckIcon className="size-3.5 stroke-[3px]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };