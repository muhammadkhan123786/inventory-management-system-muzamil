"use client"

import { ReactNode } from "react"

export default function Card({ children, gradientClass = "" }: { children: ReactNode, gradientClass?: string }) {
  return (
    <>
      <div className={`relative w-full p-4 border rounded-[10px] shadow-[0px_0px_8.399999618530273px_0px_rgba(0,0,0,0.04)] border-black/10 bg-linear-to-r from-white ${gradientClass}`}>
        {children}
      </div>
    </>
  )
}