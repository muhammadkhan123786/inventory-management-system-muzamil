import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface EditableQuantityCellProps {
    productId: string;
    value: number;
    min?: number;
    max?: number;
    onChange: (productId: string, newValue: number) => void;
    severity: string;
}

export const EditableQuantityCell = ({ 
    productId, 
    value, 
    min = 1, 
    max = 9999, 
    onChange,
    severity 
}: EditableQuantityCellProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = useCallback(() => {
        const numValue = parseInt(inputValue);
        if (isNaN(numValue) || numValue < min) {
            toast.error(`Quantity must be at least ${min}`);
            setInputValue(value.toString());
        } else if (numValue > max) {
            toast.error(`Maximum quantity is ${max}`);
            setInputValue(value.toString());
        } else {
            onChange(productId, numValue);
            setIsEditing(false);
        }
    }, [inputValue, min, max, onChange, productId, value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setInputValue(value.toString());
            setIsEditing(false);
        }
    };

    const increment = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const newValue = Math.min(value + 1, max);
        onChange(productId, newValue);
        setInputValue(newValue.toString());
    }, [value, max, onChange, productId]);

    const decrement = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const newValue = Math.max(value - 1, min);
        onChange(productId, newValue);
        setInputValue(newValue.toString());
    }, [value, min, onChange, productId]);

    const getSeverityStyles = () => {
        switch(severity) {
            case "critical":
                return {
                    bg: "bg-red-50",
                    border: "border-red-200",
                    text: "text-red-700",
                    focus: "focus:ring-red-500 focus:border-red-500",
                    button: "hover:bg-red-100 text-red-600"
                };
            case "warning":
                return {
                    bg: "bg-orange-50",
                    border: "border-orange-200",
                    text: "text-orange-700",
                    focus: "focus:ring-orange-500 focus:border-orange-500",
                    button: "hover:bg-orange-100 text-orange-600"
                };
            default:
                return {
                    bg: "bg-amber-50",
                    border: "border-amber-200",
                    text: "text-amber-700",
                    focus: "focus:ring-amber-500 focus:border-amber-500",
                    button: "hover:bg-amber-100 text-amber-600"
                };
        }
    };

    const styles = getSeverityStyles();

    if (isEditing) {
        return (
            <div className="flex items-center justify-center gap-1 min-w-[120px]">
                <button
                    onClick={decrement}
                    className={`p-1 rounded-md ${styles.button} transition-colors`}
                    title="Decrease quantity"
                >
                    <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                    ref={inputRef}
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    min={min}
                    max={max}
                    className={`w-16 px-2 py-1.5 text-sm border-2 rounded-md text-center ${styles.bg} ${styles.border} ${styles.text} ${styles.focus} focus:outline-none`}
                />
                <button
                    onClick={increment}
                    className={`p-1 rounded-md ${styles.button} transition-colors`}
                    title="Increase quantity"
                >
                    <Plus className="h-3.5 w-3.5" />
                </button>
            </div>
        );
    }

    return (
        <div 
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-1 cursor-pointer group min-w-[100px]"
        >
            <button
                onClick={decrement}
                className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${styles.button} hover:bg-opacity-80`}
                title="Decrease quantity"
            >
                <Minus className="h-3.5 w-3.5" />
            </button>
            <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md min-w-[50px] text-center ${styles.bg} ${styles.text} font-semibold text-sm border ${styles.border} group-hover:border-indigo-300 transition-colors`}>
                {value}
            </span>
            <button
                onClick={increment}
                className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${styles.button} hover:bg-opacity-80`}
                title="Increase quantity"
            >
                <Plus className="h-3.5 w-3.5" />
            </button>
        </div>
    );
};