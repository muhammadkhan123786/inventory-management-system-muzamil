"use client";
import StatCard from "@/components/StatCard";
import OrderHistoryTable from "./components/OrderHistoryTable";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  ArrowUp,
  Download,
  Plus 
  
} from "lucide-react";
import Chart from "./components/Chart";
import StockAlerts from "./components/StockAlerts";
import Header from "../components/pageHeader"
import Button from "@/components/Button";

export default function Inventory() {

  
  const statsData = [
    {
      title: "Total Inventory Value",
      value: "£1.2M",
      subtitle: "Last month",
      icon: TrendingUp,
      color: "#4F46E5", // Indigo
      gradientClass: "to-indigo-100",
      trendIcon: <ArrowUp size={14} className="text-green-500" />,
    },
    {
      title: "Low Stock Items",
      value: "05",
      subtitle: "Action Needed !",
      icon: Package,
      color: "#10B981", // Green
      gradientClass: "to-green-100",
      trendIcon: (
        <span className="font-bold text-black dark:text-white">!</span>
      ),
    },
    {
      title: "Pending Orders",
      value: "34",
      subtitle: "12 Awaiting Shipment",
      icon: ShoppingCart,
      color: "#F59E0B", // Amber
      gradientClass: "to-amber-100",
    },
    {
      title: "Monthly Revenue",
      value: "£1.2k",
      subtitle: "Last month",
      icon: DollarSign,
      color: "#F97316", // Orange
      gradientClass: "to-red-100",
      trendIcon: <ArrowUp size={14} className="text-green-500" />,
    },
  ];

  return (
    <div className="bg-gray-50 p-8 min-h-screen dark:bg-slate-950">
      <Header title = "Hi,Dani"  subtitle="Let’s check your Garage today">
        {
          <div className="flex gap-2">
            <Button icon={Download}>
           
            <span className="font-bold">Export</span>
            </Button>
            <Button icon={Plus }>
              Create Order
            </Button>
          </div>
        }
      </Header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))} */}
      </div>
      <div className="grid grid-cols-12 gap-6 mt-6 h-full">
        <div className="col-span-8">
          <Chart />
        </div>

        <div className="col-span-4">
          <StockAlerts />
        </div>
      </div>

      <OrderHistoryTable />
    </div>
  );
}
