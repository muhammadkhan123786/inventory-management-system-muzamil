"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
} from "recharts";
import EarnStatisticGraphFilter from "./EarnStatisticGraphFilter";

const data = [
    { month: "Jan", revenue: 35000 },
    { month: "Feb", revenue: 45000 },
    { month: "Mar", revenue: 40000 },
    { month: "Apr", revenue: 60000 },
    { month: "May", revenue: 55000 },
    { month: "Jun", revenue: 70000 },
];

// Optional: gradient for each bar
const gradientColors = [
    { start: "#6366f1", end: "#a5b4fc" },
    { start: "#f97316", end: "#fdba74" },
    { start: "#22c55e", end: "#86efac" },
    { start: "#ef4444", end: "#fca5a5" },
    { start: "#0ea5e9", end: "#7dd3fc" },
    { start: "#8b5cf6", end: "#c4b5fd" },
];

export default function EarnStatisticBarGraph() {
    function EarnStatisticBtn(reportOn: string) {
        console.log("Report generate on: ", reportOn);
    }
    return (
        <>
            <div className="w-full bg-white rounded">
                <div className="flex justify-between items-center px-2 py-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-bold text-2xl font-['Outfit']">Earning Statistic</h1>
                        <p className="text-gray-400">Yearly earning overview</p>
                    </div>
                    <div>
                        <EarnStatisticGraphFilter EarnStatisticBtn={EarnStatisticBtn} />
                    </div>
                    <div className="bg-gray-400">
                        <select className="bg-white border-gray-400 rounded-xl p-2">
                            <option>Select Frequency</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Yearly</option>
                        </select></div>
                </div>

                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            {/* Gradient Definitions */}
                            <defs>
                                {gradientColors.map((grad, index) => (
                                    <linearGradient
                                        key={index}
                                        id={`barGradient${index}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="0%" stopColor={grad.start} stopOpacity={0.8} />
                                        <stop offset="100%" stopColor={grad.end} stopOpacity={0.2} />
                                    </linearGradient>
                                ))}
                            </defs>

                            {/* X Axis */}
                            <XAxis
                                dataKey="month"
                                interval={0}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: "#9ca3af", fontSize: 12 }}
                            />

                            {/* Y Axis */}
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: "#9ca3af", fontSize: 12 }}
                                tickFormatter={(value) => `${value / 1000}k`}
                                domain={[30000, 70000]}
                            />

                            {/* Tooltip */}
                            <Tooltip
                                labelFormatter={(label) => label}
                                formatter={(value?: number) => [
                                    `$${(value ?? 0) / 1000}k`,
                                    "Revenue",
                                ]}
                            />

                            {/* Bars with multi-color gradients */}
                            <Bar
                                dataKey="revenue"
                                radius={[8, 8, 0, 0]}
                                animationDuration={800}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={`url(#barGradient${index % gradientColors.length})`}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}
