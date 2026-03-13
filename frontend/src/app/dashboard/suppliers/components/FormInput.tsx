import React from "react";
import { ChevronDown, LucideIcon } from "lucide-react";

interface OptionObject {
  label: string;
  value: string | number;
}

interface FormFieldProps {
  label: string;
  labelIcon?: LucideIcon;
  labelClassName?: boolean; // ✅ boolean to apply custom style
  name?: string;
  value?: any;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  type?: "text" | "email" | "number" | "date" | "select" | "textarea";
  placeholder?: string;
  options?: (string | OptionObject)[];
  defaultValue?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  min?: string;
  max?: string;
  hoverColor?:
    | "purple"
    | "blue"
    | "orange"
    | "indigo"
    | "green"
    | "red"
    | "pink";
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  labelIcon: Icon,
  labelClassName,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  options,
  defaultValue,
  className = "",
  required = false,
  disabled = false,
  multiple = false,
  min,
  max,
  hoverColor = "purple",
}) => {
  const hoverClassMap: Record<string, string> = {
    purple: "hover:border-purple-400 hover:bg-purple-50",
    blue: "hover:border-blue-400 hover:bg-blue-50",
    orange: "hover:border-orange-400 hover:bg-orange-50",
    indigo: "hover:border-indigo-400 hover:bg-indigo-50",
    green: "hover:border-green-400 hover:bg-green-50",
    red: "hover:border-red-400 hover:bg-red-50",
    pink: "hover:border-pink-400 hover:bg-pink-50",
  };

  const commonProps = {
    name,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    min,
    max,
    className: [
      "w-full h-9 bg-gray-100",
      "border border-[#d0d5dd]",
      "rounded-xl px-4",
      "outline-none transition-all",
      !disabled && hoverClassMap[hoverColor],
      "focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white",
      disabled && "opacity-60 cursor-not-allowed",
    ]
      .filter(Boolean)
      .join(" "),
  };

  // ✅ Determine label classes
  const labelClasses = labelClassName
    ? "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
    : "text-[14px] font-medium text-[#475467]";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label and Icon */}
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            size={16}
            className={type === "email" ? "text-blue-500" : "text-purple-500"}
          />
        )}
        <label className={labelClasses}>{label}</label>
      </div>

      <div className="relative">
        {type === "select" ? (
          <>
            <select
              {...commonProps}
              multiple={multiple}
              className={`${commonProps.className} ${
                !multiple ? "appearance-none pr-10" : "min-h-[120px]"
              }`}
            >
              {!multiple && (
                <option value="" disabled>
                  Select an option
                </option>
              )}
              {options?.map((opt) => {
                const value = typeof opt === "string" ? opt : opt.value;
                const label = typeof opt === "string" ? opt : opt.label;
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
            {!multiple && (
              <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none"
              />
            )}
          </>
        ) : type === "textarea" ? (
          <textarea
            {...(commonProps as any)}
            className={`${commonProps.className} min-h-16 py-2 px-3 resize-none`}
          />
        ) : (
          <input {...commonProps} type={type} defaultValue={defaultValue} />
        )}
      </div>
    </div>
  );
};

export default FormField;
