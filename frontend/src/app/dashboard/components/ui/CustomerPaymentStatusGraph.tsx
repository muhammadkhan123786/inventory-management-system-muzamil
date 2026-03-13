"use client"
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,

} from "recharts";

const data = [
    { day: "Monday", pending: 35000, paid: 45000, overdue: 15000 },
    { day: "Tuesday", pending: 35000, paid: 45000, overdue: 15000 },
    { day: "Wednesday", pending: 35000, paid: 45000, overdue: 15000 },
    { day: "Thursday", pending: 35000, paid: 45000, overdue: 15000 },
    { day: "Friday", pending: 35000, paid: 45000, overdue: 15000 },
    { day: "Saturday", pending: 35000, paid: 45000, overdue: 15000 },
    { day: "Sunday", pending: 40000, paid: 50000, overdue: 20000 },

];


export default function CustomerPaymentStatusGraph() {
    return (
        <>
            <div className="flex justify-between items-center px-2 py-4">
                <div className="flex flex-col gap-2">
                    <h1 className="font-bold font-['Outfit']">Customer Payment Status</h1>
                    <p className="text-gray-400">Weekly Report</p>
                </div>
                <div className="flex gap-2 text-gray-400">


                    <div className="flex gap-2 justify-between items-center">
                        <div className="w-2.5 h-2.5 bg-zinc-400 rounded-md"></div>
                        <p>Overdue: 200</p>
                    </div>
                    <div className="flex gap-2 justify-between items-center">
                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-md" />
                        <p>Paid:500</p>
                    </div>

                    <div className="flex gap-2 justify-between items-center">
                        <div className="w-2.5 h-2.5 bg-slate-950 rounded-md"></div>
                        <p>Pending: 1000</p>
                    </div>

                </div>

            </div>
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                        {/* X Axis */}
                        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#4b5563" }} />

                        {/* Y Axis */}
                        <YAxis
                            tick={{ fontSize: 12, fill: "#4b5563" }}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />

                        {/* Tooltip */}
                        <Tooltip
                            formatter={(value?: number, name?: string) => [`$${value ?? 0 / 1000}k`, name]}
                        />



                        {/* Bars */}
                        <Bar dataKey="pending" fill="#04091E" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="paid" fill="#FE6B1D" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="overdue" fill="#B4B4B4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>


        </>
    );
}
