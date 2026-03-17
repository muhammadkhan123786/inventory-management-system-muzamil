import { RefreshCw, Package, Building2, DollarSign, Search } from "lucide-react";
import { Button } from "@/components/form/CustomButton";

interface HeaderProps {
    productsCount: number;
    suppliersCount: number;
    estimatedTotal: number;
    criticalCount: number;
    filterText: string;
    onFilterChange: (value: string) => void;
    onResetQuantities: () => void;
    currencySymbol: string;
}

export const Header = ({
    productsCount,
    suppliersCount,
    estimatedTotal,
    criticalCount,
    filterText,
    onFilterChange,
    onResetQuantities,
    currencySymbol
}: HeaderProps) => {
    return (
        <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 px-8 py-6 shrink-0">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
            
            <div className="relative">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <RefreshCw className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                Replenishment Proposals
                                {criticalCount > 0 && (
                                    <span className="px-2.5 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full">
                                        {criticalCount} Critical
                                    </span>
                                )}
                            </h2>
                            <p className="text-indigo-200 text-sm mt-1">
                                {productsCount} product{productsCount !== 1 ? "s" : ""} need restocking • Editable quantities
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <Package className="h-4 w-4 text-indigo-200" />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-200">Total Products</p>
                                <p className="text-lg font-bold text-white">{productsCount}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-indigo-200" />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-200">Suppliers</p>
                                <p className="text-lg font-bold text-white">{suppliersCount}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-indigo-200" />
                            </div>
                            <div>
                                <p className="text-xs text-indigo-200">Est. Total</p>
                                <p className="text-lg font-bold text-white">{currencySymbol}{estimatedTotal.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Actions Bar */}
            <div className="relative mt-6 flex gap-3">
                <div className="flex-1">
                    <input
                        type="text"
                        value={filterText}
                        onChange={(e) => onFilterChange(e.target.value)}
                        placeholder="Search by product, SKU or supplier..."
                        className="w-full h-12 pl-4 pr-10 rounded-xl border-0 bg-white/10 backdrop-blur-sm text-white placeholder-indigo-200/70 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-200/70" />
                </div>
                <Button
                    onClick={onResetQuantities}
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Quantities
                </Button>
            </div>
        </div>
    );
};