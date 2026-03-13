import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        // Direct colors applied here: bg-[#f3f4f6] and border-[#e5e7eb]
        "flex h-10 w-full rounded-md border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-1 text-base shadow-sm transition-all",
        "placeholder:text-gray-400",
        // Focus state using direct HEX for Indigo
        "outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/20 focus-visible:border-[#4f46e5]",
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Input };




