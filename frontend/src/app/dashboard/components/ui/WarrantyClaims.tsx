"use client"
import Image from "next/image";
import PercentageBar from "./PercentageBar";
import email from '../../../../assets/Email.png';
import website from '../../../../assets/Website.png';
import facebook from '../../../../assets/Facebook.png';
import location from '../../../../assets/Location.png';

export default function WarrantyClaims() {
    return (
        <>
            <div className="bg-white px-2 py-4">
                <div className="flex justify-between">
                    <div>
                        <h1 className="font-bold text-2xl font-['Outfit']">Warranty Claims</h1>
                    </div>
                    <div className="bg-gray-400">
                        <select className="bg-white border-gray-400 rounded-xl p-2">
                            <option>Select Frequency</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Yearly</option>
                        </select></div>
                </div>
                <div className="flex flex-col justify-start items-center py-4 px-2 w-full gap-16">

                    <div className="flex items-center w-full gap-2">

                        {/* Icon */}
                        <Image src={email} alt="email" className="h-5 w-5" />

                        {/* Progress Bar */}
                        <div className="flex-1">
                            <PercentageBar percentage={70} />
                        </div>
                    </div>
                    <div className="flex items-center w-full gap-2">
                        {/* Icon */}
                        <Image src={website} alt="email" className="h-5 w-5" />

                        {/* Progress Bar */}
                        <div className="flex-1">
                            <PercentageBar percentage={40} />
                        </div>
                    </div>

                    <div className="flex items-center w-full gap-2">
                        {/* Icon */}
                        <Image src={facebook} alt="email" className="h-5 w-5" />

                        {/* Progress Bar */}
                        <div className="flex-1">
                            <PercentageBar percentage={60} />
                        </div>
                    </div>


                    <div className="flex items-center w-full gap-2">
                        {/* Icon */}
                        <Image src={location} alt="email" className="h-5 w-5" />

                        {/* Progress Bar */}
                        <div className="flex-1">
                            <PercentageBar percentage={30} />
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}