"use client"

import Image, { StaticImageData } from "next/image"
import Graph from "./Graph"


export default function GraphCardData({ icon, text, data, iconBg, increaseByData, increaseClass, graphColor }: { icon: StaticImageData, text: string, data: string, iconBg: string, increaseByData: string, increaseClass: string, graphColor: string }) {
    return (
        <>
            <div className="absolute top-4 left-4">
                <div className="flex gap-4">
                    <div>
                        <div className={`w-9 h-9 ${iconBg} flex rounded-full justify-center items-center`}>
                            <Image src={icon} alt="icon" className="w-5 h-5" />
                        </div>

                    </div>
                    <div className="flex flex-col">
                        <div><p className="text-gray-400">{text}</p></div>
                        <div>
                            <div className="w-12 h-4 justify-center text-black text-base font-bold font-['Outfit'] leading-6 tracking-tight">{data}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 left-4">
                <div className="flex flex-col">
                    <p className="text-gray-400">Increase by</p>

                    <h1 className={`${increaseClass}`}><span className="font-bold">{increaseByData}</span> <span className="text-gray-400 text-xs">this week.</span></h1>

                </div>

            </div>

            <div className="absolute top-2/3 right-4 -translate-y-1/2">

                <div className="flex justify-center items-center w-[150px] h-[150px]">
                    <Graph graphColor={graphColor} />
                </div>


            </div>


        </>
    )

}