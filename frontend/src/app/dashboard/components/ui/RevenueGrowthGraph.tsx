"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    Area,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

const data = [
    { name: "Jan", value: 70 },
    { name: "Feb", value: 60 },
    { name: "Mar", value: 70 },
    { name: "Apr", value: 60 },
    { name: "May", value: 70 },
    { name: "Jun", value: 60 },
    { name: "Jul", value: 80 },
];

export default function RevenueGrowthGraph() {
    return (
        <>
            <div className="bg-white px-2 py-4">
                <div className="flex flex-col gap-16">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-black text-lg font-bold font-['Outfit']">
                                Revenue Growth
                            </h1>
                            <p className="text-gray-400">Weekly Report</p>
                        </div>

                        <div className="flex flex-col gap-2 text-right">
                            <h1 className="text-black text-lg font-bold font-['Outfit']">
                                $50,000.00
                            </h1>
                            <p className="text-orange-500 font-semibold">+10k</p>
                        </div>
                    </div>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ bottom: 0 }}>

                                {/* Gradient */}
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FE6B1D" stopOpacity={0.6} />
                                        <stop offset="100%" stopColor="#FE6B1D" stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                {/* X Axis */}
                                <XAxis
                                    dataKey="name"
                                    interval={0}
                                    padding={{ left: 10, right: 10, }}
                                    tickLine={false}
                                    axisLine={false}
                                />

                                {/* Y Axis (IMPORTANT for gradient) */}
                                <YAxis hide domain={[0, "dataMax"]} />

                                {/* Tooltip */}
                                <Tooltip />

                                {/* Gradient Area */}
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    fill="url(#lineGradient)"
                                    stroke="none"
                                />

                                {/* Line */}
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#FE6B1D"
                                    strokeWidth={3}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    );
}
