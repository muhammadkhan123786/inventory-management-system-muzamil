import React from "react";
import { LucideIcon } from "lucide-react";

interface FormSectionProps {
  icon: LucideIcon;
  number?: number;
  title: string;
  children: React.ReactNode;
  theme:
    | "blue"
    | "purple"
    | "green"
    | "orange"
    | "red"
    | "indigo"
    | "sky"
    | "teal"
    | "rose";
  // Added new optional props
  headerClassName?: string;
  iconClassName?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  icon: Icon,
  number,
  title,
  children,
  theme,
  headerClassName, // Destructure new prop
  iconClassName, // Destructure new prop
}) => {
  const iconThemes = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
    orange: "text-orange-600",
    red: "text-red-600",
    indigo: "text-indigo-600",
    sky: "text-sky-600",
    teal: "text-teal-600",
    rose: "text-rose-600",
  };

  const selectedTheme = iconThemes[theme];

  const defaultIconColor = selectedTheme
    .split(" ")
    .find((c) => c.startsWith("icon-"))
    ?.replace("icon-", "");

  return (
    <div className="overflow-visible">
      <div className={`flex items-center gap-2 ! ${headerClassName || ""}`}>
        <Icon size={20} className={`${iconClassName || defaultIconColor}`} />
        <h4 className="text-xl font-semibold tracking-wide">
          {number} {title}
        </h4>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

export default FormSection;
