"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  Tooltip,
} from "recharts";
const data = [
  { name: "Mon", value: 70 },
  { name: "Tue", value: 60 },
  { name: "Wed", value: 70 },
  { name: "Thu", value: 60 },
  { name: "Fri", value: 70 },
  { name: "Sat", value: 60 },
  { name: "Sun", value: 80 },
];

export default function Graph({ graphColor }: { graphColor: string }) {
  return (
    <ResponsiveContainer width={400} height={250} className="-mt-10 ml-16">
      <LineChart data={data}>
        {/* Gradient */}
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={graphColor} stopOpacity={0.6} />
            <stop offset="100%" stopColor={graphColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* X Axis with name */}
        <XAxis dataKey="name" hide />

        {/* Tooltip */}
        <Tooltip
          formatter={(value) => [`${value}`, "Value"]}
          labelFormatter={(label) => label}
        />

        {/* Gradient Area */}
        <Area
          type="monotone"
          dataKey="value"
          stroke="none"
          fill="url(#lineGradient)"
        />

        {/* Curved Line */}
        <Line
          type="monotone"
          dataKey="value"
          stroke={graphColor}
          strokeWidth={3}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
