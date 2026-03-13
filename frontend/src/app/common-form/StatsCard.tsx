"use client";
import React, { useState, ReactNode } from "react";
import { Users, CheckCircle, XCircle } from "lucide-react";

interface StatsCardsProps {
    totalCount: number;
    activeCount: number;
    inactiveCount: number;
    labels?: {
        total?: string;
        active?: string;
        inactive?: string;
    };
    icons?: {
        total?: ReactNode;
        active?: ReactNode;
        inactive?: ReactNode;
    };
    onFilterChange?: (filter: 'all' | 'active' | 'inactive') => void;
}

const StatsCards: React.FC<StatsCardsProps> = ({
    totalCount,
    activeCount,
    inactiveCount,
    labels = {
        total: "Total Types",
        active: "Active Types",
        inactive: "Inactive Types",
    },
    icons,
    onFilterChange,
}) => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const handleFilterClick = (filter: 'all' | 'active' | 'inactive') => {
        setActiveFilter(filter);
        onFilterChange?.(filter);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Total Card */}
            <div
                onClick={() => handleFilterClick('all')}
                className={`rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1 cursor-pointer transform ${activeFilter === 'all'
                    ? 'bg-linear-to-br from-blue-500 to-cyan-500 '
                    : 'bg-linear-to-br from-blue-400 to-blue-600'
                    }`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-2">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            {/* Agar icons pass kiya hai toh wo dikhao, warna default Users icon */}
                            {icons?.total || <Users size={24} className="text-white" />}
                        </div>
                        <div className="text-4xl font-bold">{totalCount}</div>
                        <p className="text-blue-50 text-sm">{labels.total}</p>
                    </div>
                    <div>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur">
                            Total
                        </span>
                    </div>
                </div>
                {activeFilter === 'all' && (
                    <div className=" text-xs text-blue-100">✓ Filtered</div>
                )}
            </div>

            {/* Active Card */}
            <div
                onClick={() => handleFilterClick('active')}
                className={`rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1 cursor-pointer transform ${activeFilter === 'active'
                    ? 'bg-linear-to-br from-green-500 to-emerald-500 ring-4 ring-green-300'
                    : 'bg-linear-to-br from-green-400 to-emerald-600'
                    }`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-2">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            {icons?.active || <CheckCircle size={24} className="text-white" />}
                        </div>
                        <div className="text-4xl font-bold">{activeCount}</div>
                        <p className="text-green-50 text-sm">{labels.active}</p>
                    </div>
                    <div>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur">
                            Active
                        </span>
                    </div>
                </div>
                {activeFilter === 'active' && (
                    <div className="mt-3 text-xs text-green-100">✓ Filtered</div>
                )}
            </div>

            {/* Inactive Card */}
            <div
                onClick={() => handleFilterClick('inactive')}
                className={`rounded-2xl p-5 text-white shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1 cursor-pointer transform ${activeFilter === 'inactive'
                    ? 'bg-linear-to-br from-purple-500 to-pink-500 ring-4 ring-pink-300'
                    : 'bg-linear-to-br from-purple-500 to-pink-600'
                    }`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-2">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            {icons?.inactive || <XCircle size={24} className="text-white" />}
                        </div>
                        <div className="text-4xl font-bold">{inactiveCount}</div>
                        <p className="text-pink-50 text-sm">{labels.inactive}</p>
                    </div>
                    <div>
                        <span className="bg-white/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur">
                            Inactive
                        </span>
                    </div>
                </div>
                {activeFilter === 'inactive' && (
                    <div className="mt-3 text-xs text-pink-100">✓ Filtered</div>
                )}
            </div>
        </div>
    );
};

export default StatsCards;