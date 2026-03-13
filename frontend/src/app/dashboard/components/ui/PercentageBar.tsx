interface PercentageBarProps {
    percentage: number;
}

export default function PercentageBar({ percentage }: PercentageBarProps) {
    let fillColor = "";
    if (percentage <= 50) fillColor = "bg-red-500";
    else if (percentage <= 70) fillColor = "bg-green-500";
    else if (percentage <= 80) fillColor = "bg-yellow-400";
    else fillColor = "bg-amber-400"


    return (
        <div className="w-full h-4 bg-gray-300 rounded-full relative">
            <div
                className={`${fillColor} h-full rounded-full`}
                style={{ width: `${percentage}%`, transition: "width 0.5s ease" }}
            />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-black">
                {percentage}%
            </span>
        </div>
    );
}
