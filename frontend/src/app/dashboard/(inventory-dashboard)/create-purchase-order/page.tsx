// src/app/orders/create/page.tsx
"use client";

import { useState } from "react";
import { FormInput } from "@/components/form/FormInput";
import { FileUpload } from "@/components/form/FileUpload";
import Dropdown from "@/components/form/Dropdown";
import IconButton from "@/components/Button";
import { Plus, Trash2, Save, X, Package, Calendar, MapPin } from "lucide-react";

interface OrderItem {
  id: string;
  product: string;
  sku: string;
  quantity: number;
  unitCost: string;
  taxRate: string;
  total: string;
}

export default function CreateOrderPage() {
  const [supplier, setSupplier] = useState("");
  const [poNumber, setPONumber] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [destination, setDestination] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: "1",
      product: "Wheel Assembly - Standard Mix",
      sku: "Variant: A",
      quantity: 5,
      unitCost: "£3567",
      taxRate: "5%",
      total: "£19786",
    },
    {
      id: "2",
      product: "Wheel Assembly - Standard Mix",
      sku: "Variant: A",
      quantity: 5,
      unitCost: "£3567",
      taxRate: "5%",
      total: "£19786",
    },
    {
      id: "3",
      product: "Wheel Assembly - Standard Mix",
      sku: "Variant: A",
      quantity: 5,
      unitCost: "£3567",
      taxRate: "5%",
      total: "£19786",
    },
  ]);

  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      product: "",
      sku: "",
      quantity: 0,
      unitCost: "£0",
      taxRate: "0%",
      total: "£0",
    };
    setOrderItems([...orderItems, newItem]);
  };

  const removeOrderItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const handleSubmit = () => {
    console.log("Order Data:", {
      supplier,
      poNumber,
      expectedDate,
      destination,
      orderItems,
      files,
    });
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Order
          </h1>
          <div className="flex items-center gap-3">
            <IconButton icon={X} variant="outline">
              Cancel
            </IconButton>
            <IconButton icon={Save} variant="primary" onClick={handleSubmit}>
              Create Order
            </IconButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-white/10 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Order Items
              </h2>

              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Product / SKU
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        QTY
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Unit Cost (£)
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Tax (£)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {orderItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.product || "Select Product"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.sku}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const updatedItems = orderItems.map((orderItem) =>
                                orderItem.id === item.id
                                  ? {
                                      ...orderItem,
                                      quantity: Number(e.target.value),
                                    }
                                  : orderItem
                              );
                              setOrderItems(updatedItems);
                            }}
                            className="w-16 px-2 py-1 text-center text-sm bg-transparent border border-gray-200 dark:border-slate-700 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-gray-900 dark:text-white">
                          {item.unitCost}
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-gray-900 dark:text-white">
                          {item.taxRate}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                          {item.total}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => removeOrderItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Product Button */}
              <button
                onClick={addOrderItem}
                className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* General Information */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-white/10 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                General Information
              </h2>

              <div className="space-y-4">
                <Dropdown
                  label="Select Supplier"
                  options={[
                    { value: "", label: "Select supplier" },
                    { value: "supplier1", label: "ABC Suppliers Ltd" },
                    { value: "supplier2", label: "XYZ Distribution" },
                    { value: "supplier3", label: "Global Parts Inc" },
                  ]}
                  value={supplier}
                  onChange={setSupplier}
                  placeholder="Select a supplier"
                />

                <FormInput
                  label="PO Number"
                  icon={Package}
                  value={poNumber}
                  onChange={(e) => setPONumber(e.target.value)}
                  placeholder="PO-8862-Dec"
                />

                <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-lg flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-400">
                      Status
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logistics */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-white/10 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Logistics
              </h2>

              <div className="space-y-4">
                <FormInput
                  label="Expected Delivery Date"
                  icon={Calendar}
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  placeholder="DD/MM/YY"
                />

                <FormInput
                  label="Main Hub - Destination"
                  icon={MapPin}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Main hub - Destination"
                />
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-white/10 p-6">
              <FileUpload
                label="Attachments"
                accept=".pdf,.doc,.docx,.xlsx"
                maxSize={10}
                onFilesChange={setFiles}
                helperText="Upload purchase orders, invoices (max 10MB)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
