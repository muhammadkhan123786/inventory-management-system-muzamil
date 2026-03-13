import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-md border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-2 text-base shadow-sm transition-all outline-none resize-none",
        "placeholder:text-gray-400",
        "focus-visible:ring-2 focus-visible:ring-[#4f46e5]/20 focus-visible:border-[#4f46e5]",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
