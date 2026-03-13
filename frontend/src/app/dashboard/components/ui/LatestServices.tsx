"use client"

import OrdersTable from "./OrdersTable"

export default function LatestServices() {
    return (
        <>
            <div className="bg-white w-full rounded">
                <div className="flex justify-between  items-center px-2 py-4">
                    <h1 className="font-bold font-['Outfit']">Latest Services</h1>
                    <div className="">
                        <select className="bg-white  border border-gray-400 rounded-xl p-2">
                            <option>Select Frequency</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Yearly</option>
                        </select>
                    </div>
                </div>
                <OrdersTable orders={[
                    { id: '1', orderId: '5986124', date: '27 Mar 2025', status: 'Completed', amount: '£20,000.00' },
                    { id: '2', orderId: '5986124', date: '27 Mar 2025', status: 'Pending', amount: '£20,000.00' },
                    { id: '3', orderId: '5986124', date: '27 Mar 2025', status: 'Rejected', amount: '£20,000.00' },
                    { id: '4', orderId: '5986124', date: '27 Mar 2025', status: 'Completed', amount: '£20,000.00' },
                    { id: '5', orderId: '5986124', date: '27 Mar 2025', status: 'Pending', amount: '£20,000.00' },
                    { id: '6', orderId: '5986124', date: '27 Mar 2025', status: 'Pending', amount: '£20,000.00' },
                    { id: '7', orderId: '5986124', date: '27 Mar 2025', status: 'Pending', amount: '£20,000.00' },

                ]} />
            </div>
        </>
    )
}