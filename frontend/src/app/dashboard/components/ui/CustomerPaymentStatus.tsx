"use client"

import CustomerPaymentStatusGraph from "./CustomerPaymentStatusGraph";

export default function CustomerPaymentStatus() {
    return (
        <>
            <div className="w-full bg-white rounded">
                <CustomerPaymentStatusGraph />
            </div>
        </>
    );
}