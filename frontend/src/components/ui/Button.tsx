"use client";
import React from "react";

export default function Button({ children, onClickBtn }: { children: React.ReactNode; onClickBtn?: () => void; }) {
    return (
        <button onClick={onClickBtn} className="w-full bg-orange-500 text-white font-semibold px-2 hover:bg-orange-600 transition cursor-pointer">
            {children}
        </button>
    )
}