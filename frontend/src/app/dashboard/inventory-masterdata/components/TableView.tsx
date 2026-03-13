// components/TableView.tsx
import React from 'react';
import Card from './Card';
import { CategoryData } from './types';

interface TableViewProps {
  headers: string[];
  totalData: CategoryData[];
}

const TableView: React.FC<TableViewProps> = ({ headers, totalData }) => {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Table View</h2>
      
      {/* Table Header */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-4 py-3">
          {headers.map((header, index) => (
            <div key={index} className="text-gray-700 font-medium">
              {header}
            </div>
          ))}
        </div>
        
        {/* Total Section */}
        <div className="px-4 py-3 bg-white border-t border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Total</h3>
          <div className="grid grid-cols-3 gap-4">
            {totalData.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-gray-900 font-semibold">{item.value}</div>
                <div className="text-sm text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TableView;