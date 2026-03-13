"use client"

import { useState } from "react"

export default function EarnStatisticGraphFilter({ EarnStatisticBtn }: { EarnStatisticBtn: (filteron: string) => void }) {
    const [activeBtn, setActiveBtn] = useState<string>('Sales');

    function checkButtonClick(btnName: string) {
        setActiveBtn(btnName);
        EarnStatisticBtn(btnName);
    }

    return (
        <>
            <button className={`px-4 h-8 rounded ${activeBtn === 'Sales' ? 'bg-orange-500' : ''}`} onClick={() => checkButtonClick('Sales')}>Sales</button>
            <button className={`px-4 rounded ${activeBtn === 'Income' ? 'bg-orange-500' : ''}`} onClick={() => checkButtonClick('Income')}>Income</button>
            <button className={`px-4 rounded ${activeBtn === 'Profit' ? 'bg-orange-500' : ''}`} onClick={() => checkButtonClick('Profit')}>Profit</button>
        </>
    )
}