'use client'
import { useState } from "react";
import StatCard from "@/components/StatCard";
import Dropdown from "@/components/form/Dropdown";
import ProgressBar from '@/components/form/ProgressBar';
import DropdownMenu from '@/components/form/DropdownMenu';
import CustomTable from "@/components/CustomTable";
import Header from "../components/pageHeader";
import Button from "@/components/Button";
import { 
  Download, Plus, TrendingUp, Package, 
  ShoppingCart, DollarSign, ArrowUp 
} from "lucide-react";

// --- Types ---
interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  image: string;
  status: 'Active' | 'Inactive' | 'Low Stock';
  location: string;
  locationDetail: string;
  onHand: number;
  reserved: number;
  damaged: number;
  inTransit: number;
  inTransitDetail: string;
  atp: number;
  atpMax: number;
}

export default function Inventory() {
  const [warehouse, setWarehouse] = useState('all');
  const [region, setRegion] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  // Dummy Data
  const inventoryData: InventoryItem[] = Array(5).fill({
    id: '1',
    name: 'Micro Scooter Schweiz',
    sku: 'SKU: ECU-8R4-X2',
    image: '/scooter.png',
    status: 'Active',
    location: 'Warehouse A',
    locationDetail: 'London, UK',
    onHand: 500,
    reserved: 50,
    damaged: 2,
    inTransit: 100,
    inTransitDetail: 'Arriving Today',
    atp: 548,
    atpMax: 1000,
  });

  const statsData = [
    { title: "Total Inventory Value", value: "£1.2M", subtitle: "Last month", icon: TrendingUp, color: "#4F46E5", gradientClass: "to-indigo-100", trendIcon: <ArrowUp size={14} className="text-green-500" /> },
    { title: "Low Stock Items", value: "05", subtitle: "Action Needed !", icon: Package, color: "#10B981", gradientClass: "to-green-100", trendIcon: <span className="font-bold text-black dark:text-white">!</span> },
    { title: "Pending Orders", value: "34", subtitle: "12 Awaiting Shipment", icon: ShoppingCart, color: "#F59E0B", gradientClass: "to-amber-100" },
    { title: "Monthly Revenue", value: "£1.2k", subtitle: "Last month", icon: DollarSign, color: "#F97316", gradientClass: "to-red-100", trendIcon: <ArrowUp size={14} className="text-green-500" /> },
  ];

  const handleEdit = (item: InventoryItem) => console.log('Edit:', item);
  const handleDelete = (item: InventoryItem) => console.log('Delete:', item);

  const columns = [
    {
      header: 'Product / SKU',
      accessor: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
             <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-slate-700" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
            <p className="text-[11px] text-gray-400 font-medium tracking-tight uppercase">{item.sku}</p>
            <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${
              item.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
            }`}>
              {item.status}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: (item: InventoryItem) => (
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.location}</p>
          <p className="text-xs text-gray-400 font-medium">{item.locationDetail}</p>
        </div>
      ),
    },
    { header: 'On-Hand', accessor: (item: InventoryItem) => <span className="text-sm font-bold">{item.onHand}</span> },
    { header: 'Reserved', accessor: (item: InventoryItem) => <span className="text-sm font-bold">{item.reserved}</span> },
    { header: 'Damaged', accessor: (item: InventoryItem) => <span className="text-sm font-bold text-red-500">{item.damaged}</span> },
    {
      header: 'In-Transit',
      accessor: (item: InventoryItem) => (
        <div>
          <p className="text-sm font-bold">{item.inTransit}</p>
          <p className="text-[10px] text-orange-500 font-bold uppercase italic">{item.inTransitDetail}</p>
        </div>
      ),
    },
    {
      header: 'ATP (CALC)',
      accessor: (item: InventoryItem) => (
        <div className="min-w-[140px]">
          <p className="text-[11px] text-right mb-1 font-bold text-blue-600">
            {item.atp} <span className="text-gray-300 font-normal">/ {item.atpMax}</span>
          </p>
          <ProgressBar
            value={item.atp}
            max={item.atpMax}            
            progressColor="#487FFF"
            height={6}
            borderRadius={6}
          />
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: (item: InventoryItem) => (
        <DropdownMenu onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item)} />
      ),
    },
  ];

  return (
    <div className="bg-[#f8fafc] p-8 min-h-screen dark:bg-slate-950 space-y-8">
      {/* 1. Header Section */}
      <Header 
        title="Inventory Overview" 
        subtitle="Real-time visibility into stock levels, ATP, and movement across all channels."
      >
        <div className="flex gap-3">
          <Button icon={Download} variant="white">
            <span className="font-bold">Export</span>
          </Button>
          <Button icon={Plus} variant="primary">
            <span className="font-bold">Create Order</span>
          </Button>
        </div>
      </Header>

      {/* 2. Stats Section */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div> */}

      {/* 3. Filters & Table Section */}
      <div className="space-y-4">
        <div className="flex justify-end items-center gap-3">
          <Dropdown
            options={[{ value: 'all', label: 'Warehouse : All' }, { value: 'a', label: 'Warehouse A' }]}
            value={warehouse}
            onChange={setWarehouse}
          />
          <Dropdown
            options={[{ value: 'all', label: 'Region : All' }, { value: 'uk', label: 'UK' }]}
            value={region}
            onChange={setRegion}
          />
          <Dropdown
            options={[{ value: 'all', label: 'Category : E-Scooters' }]}
            value={category}
            onChange={setCategory}
          />
          <Dropdown
            options={[{ value: 'all', label: 'Status : Active' }]}
            value={status}
            onChange={setStatus}
          />
        </div>

        {/* Professional Table Wrapper */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
          <CustomTable data={inventoryData} columns={columns} />
        </div>
      </div>
    </div>
  );
}