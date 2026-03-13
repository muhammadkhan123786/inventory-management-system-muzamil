"use client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
const data = [
    { name: "Paid", value: 400 },
    { name: "Pending", value: 300 },
    { name: "Failed", value: 100 },
];
const COLORS = ["#FE6B1D", "#B5B5B5", "#000000"]; // custom colors
export default function CountriesStatus() {
    return (
        <>
            <div className="bg-white px-2 py-4">
                <div className="flex justify-between">
                    <div>
                        <h1 className="font-bold font-['Outfit']">Countries Status</h1>
                    </div>
                    <div><div className="bg-gray-400">
                        <select className="bg-white border-gray-400 rounded-xl p-2">
                            <option>Select Frequency</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Yearly</option>
                        </select></div></div>
                </div>
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={40}
                                paddingAngle={5}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value?: number) => [`${value}`, "Customers"]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-between px-12">
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 bg-[#FE6B1D] rounded-md"></div>
                        <div className="justify-start text-slate-800 text-xs font-normal font-['Outfit'] leading-4">Total: 500</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 bg-[#B5B5B5] rounded-md"></div>
                        <div className="justify-start text-slate-800 text-xs font-normal font-['Outfit'] leading-4">Total: 1500</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 bg-[#000000] rounded-md" />
                        <div className="justify-start text-slate-800 text-xs font-normal font-['Outfit'] leading-4">Total: 500</div>
                    </div>
                </div>
            </div>
        </>
    )
}
