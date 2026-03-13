"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Building2,
  Search,
  Edit2,
  Trash2,
  Mail,
  AlertCircle,
  MapPin,
  Clock,
  Loader2,
  CircleCheckBig,
  Phone,
  Eye,
} from "lucide-react";
import SupplierForm from "./SupplierForm";
import axios from "axios";
import SupplierView from "./SupplierView";
import { useRouter } from "next/navigation";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const SuppliersPage = () => {
  const [view, setView] = useState<"list" | "form">("list");
  const [editData, setEditData] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null); // New state
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const router = useRouter();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/suppliers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.data) {
        setSuppliers(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching suppliers:", error);
      if (error.response?.status === 401) {
        console.error("Unauthorized - Redirecting to login...");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const total = suppliers.length;
    const active = suppliers.filter((sup) => sup.isActive).length;
    const inactive = total - active;
    setStats({ total, active, inactive });
  }, [suppliers]);

  useEffect(() => {
    if (view === "list") fetchSuppliers();
  }, [view]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((sup) => {
      const name =
        sup.supplierIdentification?.legalBusinessName?.toLowerCase() || "";
      const email = sup.contactInformation?.emailAddress?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [suppliers, searchQuery]);

  const handleEdit = (supplier: any) => {
    const flatData = {
      _id: supplier._id,
      userId:
        typeof supplier.userId === "object"
          ? supplier.userId._id
          : supplier.userId,

      legalBusinessName: supplier.supplierIdentification?.legalBusinessName,
      tradingName: supplier.supplierIdentification?.tradingName,
      businessRegNumber: supplier.supplierIdentification?.businessRegNumber,
      taxRegNumber: supplier.supplierIdentification?.vat,
      businessTypeId: supplier.supplierIdentification?.businessTypeId?._id,

      primaryContactName: supplier.contactInformation?.primaryContactName,
      jobTitleId: supplier.contactInformation?.jobTitleId?._id,
      phoneNumber: supplier.contactInformation?.phoneNumber,
      emailAddress: supplier.contactInformation?.emailAddress,
      website: supplier.contactInformation?.website,

      registeredAddress: supplier.businessAddress?.businessAddress,
      tradingAddress: supplier.businessAddress?.tradingAddress,
      cityId: supplier.businessAddress?.city?.cityName,
      stateCounty: supplier.businessAddress?.state,
      countryId: supplier.businessAddress?.country?.countryName,
      postalCode: supplier.businessAddress?.zipCode,

      vatRegistered: supplier.financialInformation?.vatRegistered,
      taxIdNumber: supplier.financialInformation?.taxIdentificationNumber,
      currencyId: supplier.financialInformation?.paymentCurrencyId?._id,
      paymentMethodId: supplier.financialInformation?.paymentMethodId?._id,

      bankName: supplier.bankPaymentDetails?.bankName,
      accountHolderName: supplier.bankPaymentDetails?.accountHolderName,
      accountNumber: supplier.bankPaymentDetails?.accountNumber,
      sortCode: supplier.bankPaymentDetails?.sortCode,
      iban: supplier.bankPaymentDetails?.ibanNumber,
      swiftCode: supplier.bankPaymentDetails?.swiftCode,

      productServiceId: supplier.productServices?.typeOfServiceId?._id,
      categoryId:
        supplier.productServices?.productCategoryIds?.map((cat: any) =>
          typeof cat === "object" ? cat._id : cat,
        ) || [],
      leadTime: supplier.productServices?.leadTimes,
      moq: supplier.productServices?.minimumOrderQuantity,

      paymentTermId: supplier.commercialTerms?.paymentTermsId?._id,
      pricingAgreementId: supplier.commercialTerms?.pricingAgreementId?._id,
      discountTerms: supplier.commercialTerms?.discountTerms,
      contractStartDate: supplier.commercialTerms?.contractStartDate
        ? new Date(supplier.commercialTerms.contractStartDate)
            .toISOString()
            .split("T")[0]
        : "",
      contractEndDate: supplier.commercialTerms?.contractEndDate
        ? new Date(supplier.commercialTerms.contractEndDate)
            .toISOString()
            .split("T")[0]
        : "",

      insuranceDetails: supplier.complianceDocumentation?.insuranceDetails,
      insuranceExpiryDate: supplier.complianceDocumentation?.insuranceExpiryDate
        ? new Date(supplier.complianceDocumentation.insuranceExpiryDate)
            .toISOString()
            .split("T")[0]
        : "",
      hsCompliance: supplier.complianceDocumentation?.healthAndSafetyCompliance
        ? "Yes"
        : "No",
      qualityCertifications:
        supplier.complianceDocumentation?.qualityCertificate,

      orderContactName: supplier.operationalInformation?.orderContactName,
      orderContactEmail: supplier.operationalInformation?.orderContactEmail,
      returnsPolicy: supplier.operationalInformation?.returnPolicy,
      warrantyTerms: supplier.operationalInformation?.warrantyTerms,

      complianceDocumentation: {
        businessRegistrationCertificates:
          supplier.complianceDocumentation?.businessRegistrationCertificates ||
          [],
        insuranceDetails: supplier.complianceDocumentation?.insuranceDetails,
        insuranceExpiryDate:
          supplier.complianceDocumentation?.insuranceExpiryDate,
        healthAndSafetyCompliance:
          supplier.complianceDocumentation?.healthAndSafetyCompliance,
        qualityCertificate:
          supplier.complianceDocumentation?.qualityCertificate,
      },
    };

    console.log("Edit data prepared:", flatData);
    setEditData(flatData);
    setView("form");
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this supplier?",
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSuppliers();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="relative w-full h-32 pl-8 pr-12 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl flex items-center justify-between overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="relative flex justify-center items-center h-20 w-20">
                  <div className="flex justify-center items-center animate-[spin_13s_linear_infinite]">
                    <div className="absolute w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10 rotate-[59.56deg]" />

                    <div className="relative z-10">
                      <Building2 size={36} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <h1 className="text-white text-4xl font-bold font-sans leading-tight drop-shadow-md">
                    Suppliers
                  </h1>
                  <p className="text-white/90 text-lg font-normal font-sans">
                    Manage your supplier database
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditData(null);
                  setView("form");
                }}
                className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-[10px] text-purple-600 font-semibold shadow-lg hover:bg-gray-50 transition-colors active:scale-95"
              >
                <Plus size={18} strokeWidth={3} />
                <span className="text-sm">Add Supplier</span>
              </button>

              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Suppliers"
                value={stats.total}
                gradient="from-blue-500 to-cyan-500"
                icon={Building2}
              />
              <StatCard
                title="Active"
                value={stats.active}
                gradient="from-emerald-500 to-green-500"
                icon={CircleCheckBig}
              />
              <StatCard
                title="Inactive"
                value={stats.inactive}
                gradient="from-orange-500 to-amber-500"
                icon={AlertCircle}
              />
            </div>

            <div className="self-stretch h-20 px-6 flex items-center bg-white rounded-2xl shadow-lg mb-6">
              <div className="relative w-full">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID, or email..."
                  className="w-full h-9 pl-10 pr-3 bg-gray-100 rounded-[10px] border border-transparent focus:border-gray-200 focus:bg-white outline-none text-sm text-gray-700 transition-all"
                />
              </div>
            </div>

            <div className="bg-white  shadow-sm">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="animate-spin mb-2" size={40} />
                  <p>Loading suppliers...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left ">
                    <thead className="bg-linear-to-r from-indigo-50 to-purple-50">
                      <tr className="text-[11px] font-bold uppercase tracking-wide">
                        <th className="px-6 py-4">Supplier ID</th>
                        <th className="px-6 py-4">Business Name</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Products</th>
                        <th className="px-6 py-4">Payment Terms</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSuppliers.map((sup) => (
                        <tr
                          key={sup._id}
                          className="bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group "
                        >
                          <td className="py-5 pl-6 rounded-l-3xl font-medium text-slate-500">
                            <div className="leading-tight">
                              <div className="font-semibold text-slate-700">
                                SUP-{sup._id.slice(-4).toUpperCase()}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {
                                  new Date(sup.createdAt)
                                    .toISOString()
                                    .split("T")[0]
                                }
                              </div>
                            </div>
                          </td>

                          <td className="py-5">
                            <div className="font-bold text-slate-800">
                              {sup.supplierIdentification?.legalBusinessName}
                            </div>
                            <p className="text-xs text-gray-500">
                              {sup.supplierIdentification?.tradingName || "N/A"}
                            </p>

                            <span className="text-xs bg-indigo-600 text-white px-3 py-1 font-medium rounded-full ">
                              {sup.supplierIdentification?.businessTypeId
                                ?.businessTypeName || "N/A"}
                            </span>
                          </td>

                          <td className="py-5">
                            <div className="text-sm font-medium text-slate-700">
                              {sup.contactInformation?.primaryContactName}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <Mail size={12} />{" "}
                              {sup.contactInformation?.emailAddress}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <Phone size={12} />{" "}
                              {sup.contactInformation?.phoneNumber}
                            </div>
                          </td>

                          <td className="py-5">
                            <div className="text-xs text-slate-600 flex items-center gap-1">
                              <MapPin size={14} className="text-slate-400" />
                              {sup.businessAddress?.state || "N/A"}
                            </div>
                            <div className="text-[10px] text-slate-400 ml-5">
                              {sup.businessAddress?.country?.countryName ||
                                "UK"}
                            </div>
                          </td>

                          <td className="py-5">
                            <div className="text-xs font-medium text-slate-700">
                              {sup.productServices?.typeOfServiceId
                                ?.productServicesName || "Service"}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock size={10} />{" "}
                              {sup.productServices?.leadTimes} days lead
                            </div>
                          </td>

                          <td className="py-5">
                            <div className="text-sm font-bold text-slate-800">
                              {sup.commercialTerms?.paymentTermsId
                                ?.paymentTerm || "N/A"}
                            </div>
                            <div className="text-xs text-slate-400 capitalize">
                              {sup.financialInformation?.paymentMethodId
                                ?.paymentMethodName || "N/A"}
                            </div>
                          </td>

                          <td className="py-5 text-center">
                            <span
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                sup.isActive
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {sup.isActive ? "active" : "inactive"}
                            </span>
                          </td>
                          <td className="py-5 pr-6 rounded-r-3xl text-right">
                            <button
                              onClick={() => setSelectedSupplier(sup)}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(sup)}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(sup._id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                           <button
  onClick={() => router.push(`/dashboard/suppliers/${sup._id}`)}
  className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
>
  Details
</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {selectedSupplier && (
                <SupplierView
                  supplier={selectedSupplier}
                  onClose={() => setSelectedSupplier(null)}
                />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <SupplierForm editData={editData} onBack={() => setView("list")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ title, value, gradient, icon: Icon }: any) => (
  <div
    className={`relative p-6 rounded-2xl text-white shadow-lg overflow-hidden group
    transition-all duration-300 ease-out
    hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02]
    bg-linear-to-br ${gradient}`}
  >
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />

    <div className="flex justify-between items-end relative z-10">
      <div>
        <p className="text-white text-sm font-medium tracking-wide">{title}</p>
        <h2 className="text-4xl font-bold mt-1 tracking-tight">{value}</h2>
      </div>

      <div className="text-white/80 group-hover:scale-110 group-hover:text-white transition-all duration-300 ease-out">
        <Icon size={44} strokeWidth={1.5} />
      </div>
    </div>
  </div>
);

export default SuppliersPage;
