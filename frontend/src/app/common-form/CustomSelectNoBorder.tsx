"use client";
import React from "react";
import { CustomSelect } from "./CustomSelect";

export const CustomSelectNoBorder = (props: any) => {
  return (
    <div
      className="[&>div>div:first-child]:border-0
                    [&>div>div:first-child]:shadow-none
                    [&>div>div:first-child]:bg-gray-100"
    >
      <CustomSelect {...props} />
    </div>
  );
};
