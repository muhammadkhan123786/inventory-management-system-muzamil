import { ChevronUp, ChevronDown, ArrowUpDown, CheckSquare, Square } from "lucide-react";
import { SortKey, SortDir } from "../types";

interface TableHeaderProps {
    sortKey: SortKey;
    sortDir: SortDir;
    onToggle: (key: SortKey) => void;
    allSelected: boolean;
    someSelected: boolean;
    onToggleAll: () => void;
}

interface ThProps {
    label: string;
    sortable?: SortKey;
    sortKey: SortKey;
    sortDir: SortDir;
    onToggle: (key: SortKey) => void;
}

const Th = ({ label, sortable, sortKey, sortDir, onToggle }: ThProps) => {
    const active = sortable && sortKey === sortable;
    
    return (
        <th
            className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                sortable ? "cursor-pointer select-none hover:text-indigo-600 group" : "text-gray-500"
            }`}
            onClick={() => sortable && onToggle(sortable)}
        >
            <div className="flex items-center gap-1.5">
                <span className={active ? "text-indigo-600" : "text-gray-500 group-hover:text-gray-700"}>
                    {label}
                </span>
                {sortable && (
                    <div className={`transition-colors ${active ? "text-indigo-600" : "text-gray-300 group-hover:text-gray-500"}`}>
                        {active ? (
                            sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        ) : (
                            <ArrowUpDown className="h-3 w-3" />
                        )}
                    </div>
                )}
            </div>
        </th>
    );
};

export const TableHeader = ({
    sortKey,
    sortDir,
    onToggle,
    allSelected,
    someSelected,
    onToggleAll
}: TableHeaderProps) => {

    return (
        <thead className="sticky top-0 bg-white border-b-2 border-gray-200 z-10 shadow-sm">
            <tr>
                <th className="px-4 py-4 w-10">
                    <button onClick={onToggleAll} className="text-gray-400 hover:text-indigo-600">
                        {allSelected ? (
                            <CheckSquare className="h-5 w-5 text-indigo-600" />
                        ) : someSelected ? (
                            <div className="h-5 w-5 rounded border-2 border-indigo-400 bg-indigo-100 flex items-center justify-center">
                                <div className="h-2 w-2 bg-indigo-600 rounded-sm" />
                            </div>
                        ) : (
                            <Square className="h-5 w-5" />
                        )}
                    </button>
                </th>
                <Th label="Status" sortable="severity" sortKey={sortKey} sortDir={sortDir} onToggle={onToggle} />
                <Th label="Product" sortable="productName" sortKey={sortKey} sortDir={sortDir} onToggle={onToggle} />
                <Th label="Stock" sortable="currentStock" sortKey={sortKey} sortDir={sortDir} onToggle={onToggle} />
                <Th label="Order Qty" sortable="suggestedQty" sortKey={sortKey} sortDir={sortDir} onToggle={onToggle} />
                <Th label="Unit Cost" sortKey={sortKey} sortDir={sortDir} onToggle={onToggle} />
                <Th label="Line Total" sortKey={sortKey} sortDir={sortDir} onToggle={onToggle} />
                <Th label="Supplier" sortable="supplierName" sortKey={sortKey} sortDir={sortDir} onToggle={onToggle} />
                <Th label="Days Left" sortKey={sortKey} sortDir={sortDir} onToggle={onToggle} />
            </tr>
        </thead>
    );
};