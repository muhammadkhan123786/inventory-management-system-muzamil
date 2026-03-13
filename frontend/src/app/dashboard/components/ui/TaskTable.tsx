// components/TasksTable.tsx
import React from 'react';
import TaskItem from './TaskItem';

// ... (Interfaces same rahengi)
export interface Task {
  id: string;
  taskId: string;
  taskName: string;
  assignedTo: string;
  dueDate: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Overdue';
}

interface TasksTableProps {
  tasks: Task[];
  title?: string;
}
export interface Task {
  id: string;
  taskId: string;
  taskName: string;
  assignedTo: string;
  dueDate: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Overdue';
}

const TasksTable: React.FC<TasksTableProps> = ({ 
  tasks, 
  title = 'Hotel Management Tasks' 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Table Header - Now visible on mobile with small text */}
      <div className="grid grid-cols-4 mx-2 md:mx-4 border-b-[3px] border-[#D9D9D994] text-[#718096] font-semibold text-[10px] md:text-sm uppercase tracking-wider px-3 py-3 md:px-6">
        <div className="text-left">Task Name</div>
        <div className="text-center">Assigned To</div>
        <div className="text-center">Due Date</div>
        <div className="text-center">Status</div>
      </div>

      {/* Table Body */}
      <div className="">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            taskId={task.taskId}
            taskName={task.taskName}
            assignedTo={task.assignedTo}
            dueDate={task.dueDate}
            status={task.status}
            variant="compact"
          />
        ))}
      </div>
        {/* Optional: Summary */}
      {/* <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Tasks: {tasks.length}</span>
          <div className="flex gap-4">
            <span className="text-blue-600 font-medium">
              Active: {tasks.filter(t => t.status === 'Active').length}
            </span>
            <span className="text-green-600 font-medium">
              Completed: {tasks.filter(t => t.status === 'Completed').length}
            </span>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default TasksTable;