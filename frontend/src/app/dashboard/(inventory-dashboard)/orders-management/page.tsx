// src/app/orders-management/page.tsx
"use client";

import React, { useState} from "react";
import StatCard from "@/components/StatCard";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  
} from "lucide-react";
import CustomTable from "@/components/CustomTable";
import Dropdown from "@/components/form/Dropdown";
// import type { StatCardProps } from "@/components/StatCard";

// Type definitions for Order data
export interface OrderItem {
  id: string;
  source: string;
  date: string;
  customer: {
    name: string;
    avatar?: string;
  };
  status: OrderStatus;
  items: number;
  total: number;
}

// Define all possible order statuses
export type OrderStatus =
  | "Shipped"
  | "Overdue"
  | "Unfulfilled"
  | "Processing"
  | "Delivered"
  | "Cancelled";

// Type for table column configuration
export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

export default function OrdersManagement() {
   const [status, setStatus] = useState('all');
   const [channel, setChannel] = useState('all')

  //  const statsData: StatCardProps[] = [
  //   {
  //     title: "Orders to fulfill",
  //     value: "10",
  //     icon: TrendingUp,
  //     color: "#4F46E5", // Indigo
  //     gradientClass: "from-indigo-50 to-indigo-100",
  //     description: "Out of 50 total",
  //     progress: {
  //       value: 20, // 10/50 = 20%
  //       max: 100,
  //       trackColor: "var(--muted)",
  //       progressColor: "#4F46E5", // Same as icon color
  //       height: 4,
  //       borderRadius: 3,
  //       showLabel: false,
  //       labelPosition: "top-center"
  //     }
  //   },
  //   {
  //     title: "Awaiting Payment",
  //     value: "05",
  //     icon: Package,
  //     color: "#10B981", // Emerald
  //     gradientClass: "from-emerald-50 to-emerald-100",
  //     description: "£2,450 pending",
  //     progress: {
  //       value: 35,
  //       trackColor: "var(--muted)",
  //       progressColor: "#10B981",
  //       height: 4,
  //       borderRadius: 3,
  //       showLabel: false,
  //       labelPosition: "top-center"
  //     }
      
  //   },
  //   {
  //     title: "Shipped Today",
  //     value: "34",
  //     icon: ShoppingCart,
  //     color: "#F59E0B", // Amber
  //     gradientClass: "from-amber-50 to-amber-100",
  //     progress: {
  //       value: 68, // Representing 68% of daily target
  //       trackColor: "var(--muted)",
  //       progressColor: "#F59E0B",
  //       height: 4,
  //       borderRadius: 3,
  //       showLabel: true,
  //       labelPosition: 'top-center',
  //       labelText: "68% of target",
       
  //     }
  //   },
  //   {
  //     title: "Total Revenue",
  //     value: "£4,280",
  //     icon: DollarSign,
  //     color: "#F97316", // Orange
  //     gradientClass: "from-orange-50 to-orange-100",
  //     description: "Monthly target: £15,000",
  //     progress: {
  //       value: 28.5, // £4,280/£15,000 ≈ 28.5%
  //       max: 100,
  //       trackColor: "var(--muted)",
  //       progressColor: "#F97316",
  //       height: 4,
  //       borderRadius: 3,
  //       showLabel: true,
  //       labelPosition: 'top-center',
  //       labelText: "29%",
  //     }
  //   },
  // ];
  const columns: TableColumn<OrderItem>[] = [
    {
      header: "Order ID",
      accessor: (item: OrderItem) => (
        <span className="font-semibold text-fg">#{item.id}</span>
      ),
      className: "font-medium",
    },
    {
      header: "Source",
      accessor: "source" as keyof OrderItem,
      className: "text-muted",
    },
    {
      header: "Date",
      accessor: "date" as keyof OrderItem,
      className: "text-muted",
      sortable: true,
    },
    {
      header: "Customer",
      accessor: (item: OrderItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex-shrink-0">
            <img
              src={item.customer.avatar || "/default-avatar.png"}
              alt={`${item.customer.name}'s avatar`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML = `<div class="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    ${item.customer.name.charAt(0).toUpperCase()}
                   </div>`;
              }}
            />
          </div>
          <span className="font-medium text-fg">{item.customer.name}</span>
        </div>
      ),
      className: "min-w-[200px]",
    },
    {
      header: "Status",
      accessor: (item: OrderItem) => {
        // Status styling configuration
        const statusConfig: Record<
          OrderStatus,
          { bg: string; text: string; label: string }
        > = {
          Shipped: {
            bg: "bg-chart-2/10",
            text: "text-chart-2",
            label: "Shipped",
          },
          Overdue: {
            bg: "bg-destructive/10",
            text: "text-destructive",
            label: "Overdue",
          },
          Unfulfilled: {
            bg: "bg-chart-3/10",
            text: "text-chart-3",
            label: "Unfulfilled",
          },
          Processing: {
            bg: "bg-primary/10",
            text: "text-primary",
            label: "Processing",
          },
          Delivered: {
            bg: "bg-chart-5/10",
            text: "text-chart-5",
            label: "Delivered",
          },
          Cancelled: {
            bg: "bg-muted",
            text: "text-muted-foreground",
            label: "Cancelled",
          },
        };

        const config = statusConfig[item.status];
        return (
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
          >
            {config.label}
          </span>
        );
      },
      className: "text-center",
    },
    {
      header: "Items",
      accessor: (item: OrderItem) => (
        <span className="text-muted">
          {item.items} {item.items === 1 ? "Item" : "Items"}
        </span>
      ),
      className: "text-center",
    },
    {
      header: "Total",
      accessor: (item: OrderItem) => (
        <span className="font-bold text-fg">
          £{item.total.toLocaleString()}
        </span>
      ),
      className: "font-semibold text-right",
    },
    {
      header: "Action",
      accessor: (item: OrderItem) => (
        <div className="bg-[#D6E3FF] rounded-[10px] px-4 py-2">
          <span className="text-[14px] flex items-center justify-center text-[#487FFF] ">
            {" "}
            {item.status === "Shipped" ? "Shipped" : "Fulfill"}
          </span>
        </div>
      ),
      className: "text-center",
    },
  ];

  // Sample data with realistic structure
  const data: OrderItem[] = [
    {
      id: "657946",
      source: "eBay",
      date: "27 Mar 2025",
      customer: { name: "Sara Johnson", avatar: "/avatar.png" },
      status: "Unfulfilled",
      items: 2,
      total: 873,
    },
    {
      id: "657947",
      source: "Shopify",
      date: "26 Mar 2025",
      customer: { name: "Michael Chen" },
      status: "Shipped",
      items: 1,
      total: 249,
    },
    {
      id: "657948",
      source: "Amazon",
      date: "25 Mar 2025",
      customer: { name: "Emma Wilson", avatar: "/avatar-2.png" },
      status: "Overdue",
      items: 3,
      total: 1249,
    },
    {
      id: "657949",
      source: "Direct",
      date: "24 Mar 2025",
      customer: { name: "Robert Davis" },
      status: "Processing",
      items: 5,
      total: 2899,
    },
    {
      id: "657950",
      source: "Retail",
      date: "23 Mar 2025",
      customer: { name: "Lisa Thompson", avatar: "/avatar-3.png" },
      status: "Delivered",
      items: 1,
      total: 129,
    },
    {
      id: "657951",
      source: "eBay",
      date: "22 Mar 2025",
      customer: { name: "James Miller" },
      status: "Cancelled",
      items: 2,
      total: 456,
    },
  ];

  
  
  const handlePageChange = (page: number) => {
    console.log(`Navigating to page: ${page}`);
    
  };


  return (
    <div className="p-6 bg-bg min-h-screen ">
      <div>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div> */}
{/* Filter */}
 <div className="flex justify-end mt-6  items-end  gap-3 mb-6">
          <Dropdown
            options={[
              { value: 'all', label: 'Channel : All' },
              { value: 'a', label: 'Channel A' },
              { value: 'b', label: 'Channel B' },
              { value: 'c', label: 'Channel C' },
            ]}
            value={channel}
            onChange={setChannel}
          />

          <Dropdown
            options={[
              { value: 'all', label: 'Status : Active' },
              { value: 'inactive', label: 'Status : Inactive' },
              { value: 'low', label: 'Status : Low Stock' },
            ]}
            value={status}
            onChange={setStatus}
          />

          

          
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mt-6">
          <CustomTable<OrderItem>
            data={data}
            columns={columns}
            showPagination={true}
            currentPage={1}
            totalPages={5}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
