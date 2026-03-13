"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "./Label"; // Import your Label component

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

// Update the Interface to allow 'label'
interface RadioGroupItemProps 
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label?: string;
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, label, id, ...props }, ref) => {
  // Generate a unique ID if one isn't provided to link label and radio
  const generatedId = id || `radio-${props.value}`;

  const item = (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={generatedId}
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border border-[#e5e7eb] bg-white shadow-sm transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#4f46e5]/20 focus-visible:border-[#4f46e5]",
        "data-[state=checked]:border-[#4f46e5]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-[#ef4444] aria-invalid:ring-[#ef4444]/20",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-[#4f46e5] text-[#4f46e5] absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );

  // If a label is provided, wrap it in a div with the Label component
  if (label) {
    return (
      <div className="flex items-center gap-2">
        {item}
        <Label htmlFor={generatedId} className="cursor-pointer font-normal">
          {label}
        </Label>
      </div>
    );
  }

  return item;
});

RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };