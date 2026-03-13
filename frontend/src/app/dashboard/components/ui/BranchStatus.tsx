"use client"
type GeoItem = {
    rsmKey: string;
};
import Image from "next/image";
import flag from '../../../../assets/countryFlag.png';
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
} from "react-simple-maps";
import PercentageBar from "./PercentageBar";

const getColorByValue = (value: number) => {
    if (value < 50) return "#EF4444";   // red
    if (value < 100) return "#F97316";  // orange
    return "#22C55E";                   // green
};

const geoUrl =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const customers = [
    { _id: 1, city: "New York", coordinates: [-74.006, 40.7128], value: 120 },
    { _id: 2, city: "London", coordinates: [-0.1276, 51.5072], value: 90 },
    { _id: 3, city: "Karachi", coordinates: [67.0011, 24.8607], value: 60 },
    { _id: 4, city: "Tokyo", coordinates: [139.6917, 35.6895], value: 150 },
];

const maxCustomers = Math.max(...customers.map(c => c.value));


export default function BranchStatus() {
    return (
        <>
            <div className="bg-white px-2 py-4">
                <div className="flex justify-between">
                    <div>
                        <h1 className="font-bold font-['Outfit']">Branch Status</h1>

                    </div>
                    <div><div className="bg-gray-400">
                        <select className="bg-white border-gray-400 rounded-xl p-2">
                            <option>Select Frequency</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Yearly</option>
                        </select></div></div>
                </div>
                <div className="w-full h-[400px] bg-white rounded-xl p-4">
                    <ComposableMap projectionConfig={{ scale: 160 }}>
                        <Geographies geography={geoUrl}>
                            {({ geographies }: { geographies: GeoItem[] }) =>
                                geographies.map((geo) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#E5E7EB"
                                        stroke="#9CA3AF"
                                    />
                                ))
                            }
                        </Geographies>

                        {customers.map(({ city, coordinates, value }) => (
                            <Marker key={city} coordinates={coordinates}>
                                {/* Tooltip */}
                                <title>{`${city}: ${value} customers`}</title>

                                {/* Circle */}
                                <circle
                                    r={Math.max(6, value / 15)}   // BIGGER circle
                                    fill={getColorByValue(value)}
                                    stroke="#fff"
                                    strokeWidth={1.5}
                                />

                                {/* Value label */}
                                <text
                                    y={-12}
                                    textAnchor="middle"
                                    style={{
                                        fontSize: "10px",
                                        fill: "#374151",
                                        fontWeight: 600,
                                    }}
                                >
                                    {value}
                                </text>
                            </Marker>
                        ))}
                    </ComposableMap>
                </div>


                <div className="flex flex-col gap-4 w-full">
                    {customers.map((c) => {
                        return <div key={c._id} className="flex gap-4 items-center">
                            <div className="flex gap-2">
                                <Image src={flag} alt="flag" className="h-5 w-5" />
                                <div>{c.city}</div>
                            </div>

                            <div className="flex-1">
                                <PercentageBar percentage={(c.value / maxCustomers) * 100} />
                            </div>
                        </div>
                    })}

                </div>



            </div>
        </>

    )
}