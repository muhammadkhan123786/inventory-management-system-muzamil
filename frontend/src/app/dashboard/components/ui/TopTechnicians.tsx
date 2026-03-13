"use client"

import TasksTable from "./TaskTable"

export default function TopTechnicians() {
    return (
        <>
            <div className="w-full bg-white rounded">
                <div className="flex  justify-between items-center px-2 py-4">
                    <h1 className="font-bold font-['Outfit']">Top Technicians</h1>
                    <div className="">
                        <select className="bg-white border border-gray-400 rounded-xl p-2">
                            <option>Select Frequency</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Yearly</option>
                        </select>
                    </div>
                </div>
                <TasksTable tasks={[
                    { id: '1', taskId: '#5632', taskName: 'Hotel Booking', assignedTo: 'John Doe', dueDate: '2024-09-15', status: 'Active' },
                    { id: '2', taskId: '#5632', taskName: 'Brake Inspection', assignedTo: 'Jane Smith', dueDate: '2024-09-16', status: 'Completed' },
                    { id: '3', taskId: '#5632', taskName: 'Oil Change', assignedTo: 'Mike Johnson', dueDate: '2024-09-17', status: 'Pending' },
                    { id: '4', taskId: '#5632', taskName: 'Tire Rotation', assignedTo: 'Emily Davis', dueDate: '2024-09-18', status: 'Completed' },
                    { id: '5', taskId: '#5632', taskName: 'Battery Replacement', assignedTo: 'David Wilson', dueDate: '2024-09-19', status: 'Completed' },
                ]} />
            </div>
        </>
    )
}