import { motion } from "framer-motion";

interface StockBarProps {
    current: number;
    max: number;
    reorder: number;
    severity: string;
}

export const StockBar = ({ current, max, reorder, severity }: StockBarProps) => {
    if (max <= 0) return null;
    
    const currentPct = Math.min((current / max) * 100, 100);
    const reorderPct = Math.min((reorder / max) * 100, 100);
    
    const gradientColor = 
        severity === "critical" ? "from-red-500 to-rose-500" :
        severity === "warning" ? "from-orange-500 to-amber-500" :
        "from-amber-500 to-yellow-500";

    return (
        <div className="relative h-1.5 w-20 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${currentPct}%` }}
                className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${gradientColor}`}
            />
            <div 
                className="absolute top-0 h-full w-0.5 bg-gray-700 opacity-50" 
                style={{ left: `${reorderPct}%` }} 
            />
        </div>
    );
};