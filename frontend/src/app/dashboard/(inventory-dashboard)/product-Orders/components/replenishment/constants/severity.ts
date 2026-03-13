import { ShieldAlert, AlertTriangle, TrendingDown } from "lucide-react";

export const SEVERITY = {
    critical: {
        label: "Critical",
        icon: ShieldAlert,
        row: "bg-gradient-to-r from-red-50/80 to-rose-50/80",
        badge: "bg-gradient-to-r from-red-500 to-rose-500 text-white border-0",
        dot: "bg-red-500",
        lightBadge: "bg-red-100 text-red-700 border-red-200",
        text: "text-red-600",
        bg: "bg-red-50",
        hover: "hover:bg-red-100"
    },
    warning: {
        label: "Warning",
        icon: AlertTriangle,
        row: "bg-gradient-to-r from-orange-50/80 to-amber-50/80",
        badge: "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0",
        dot: "bg-orange-500",
        lightBadge: "bg-orange-100 text-orange-700 border-orange-200",
        text: "text-orange-600",
        bg: "bg-orange-50",
        hover: "hover:bg-orange-100"
    },
    low: {
        label: "Low Stock",
        icon: TrendingDown,
        row: "bg-gradient-to-r from-amber-50/80 to-yellow-50/80",
        badge: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0",
        dot: "bg-amber-500",
        lightBadge: "bg-amber-100 text-amber-700 border-amber-200",
        text: "text-amber-600",
        bg: "bg-amber-50",
        hover: "hover:bg-amber-100"
    },
} as const;

export const SEVERITY_ORDER = { critical: 0, warning: 1, low: 2 } as const;