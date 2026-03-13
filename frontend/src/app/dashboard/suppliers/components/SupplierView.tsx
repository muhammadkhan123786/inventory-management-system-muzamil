import React from "react";
import { motion } from "framer-motion";
import {
  X,
  Phone,
  Mail,
  Clock,
  CreditCard,
  ShieldCheck,
  Globe,
  Briefcase,
  Layers,
  Package,
} from "lucide-react";

interface SupplierViewProps {
  supplier: any;
  onClose: () => void;
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    <h3 className="text-indigo-600 font-bold text-[11px] uppercase tracking-[0.1em] mb-4 border-b border-indigo-50 pb-2">
      {title}
    </h3>
    <div className="grid grid-cols-2 gap-x-8 gap-y-5">{children}</div>
  </div>
);

const DataField = ({ label, value, icon: Icon }: any) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
      {label}
    </span>
    <div className="flex items-center gap-2.5">
      {Icon && <Icon size={15} className="text-slate-400/80" />}
      <span className="text-[14px] font-semibold text-slate-700 leading-tight">
        {value || "N/A"}
      </span>
    </div>
  </div>
);

const SupplierView = ({ supplier, onClose }: SupplierViewProps) => {
  if (!supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-4xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white"
      >
        <div className="p-8 bg-linear-to-r from-indigo-50/50 via-purple-50/30 to-white flex justify-between items-start border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Supplier Details
            </h2>
            <p className="text-[13px] text-slate-500 mt-1 font-medium">
              Complete information for{" "}
              <span className="text-indigo-600 font-semibold">
                {supplier.supplierIdentification?.legalBusinessName}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white hover:text-red-500 rounded-xl transition-all duration-200 shadow-sm border border-slate-100 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-10 bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
            <DataField
              label="Supplier ID"
              value={
                supplier._id
                  ? `SUP-${supplier._id.slice(-3).toUpperCase()}`
                  : "N/A"
              }
            />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                Status
              </span>
              <span
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  supplier.isActive
                    ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                    : "bg-rose-100 text-rose-600 border border-rose-200"
                }`}
              >
                {supplier.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <Section title="General Information">
            <DataField
              label="Legal Business Name"
              value={supplier.supplierIdentification?.legalBusinessName}
            />
            <DataField
              label="Trading Name"
              value={supplier.supplierIdentification?.tradingName}
            />
            <DataField
              label="Business Type"
              value={
                supplier.supplierIdentification?.businessTypeId
                  ?.businessTypeName
              }
            />
            <DataField
              label="VAT Number"
              value={supplier.supplierIdentification?.vat || "Not Registered"}
            />
          </Section>
          <Section title="Product & Service Details">
            <DataField
              label="Service Name"
              value={
                supplier.productServices?.typeOfServiceId?.productServicesName
              }
              icon={Package}
            />
            <DataField
              label="Categories"
              value={supplier.productServices?.productCategoryIds
                ?.map((cat: any) => cat.categoryName)
                .join(", ")}
              icon={Layers}
            />
            <DataField
              label="Lead Time"
              value={`${supplier.productServices?.leadTimes} Days`}
              icon={Clock}
            />
            <DataField
              label="Min. Order Quantity"
              value={supplier.productServices?.minimumOrderQuantity?.toLocaleString()}
            />
          </Section>

          <Section title="Contact Details">
            <DataField
              label="Contact Person"
              value={supplier.contactInformation?.primaryContactName}
              icon={Briefcase}
            />
            <DataField
              label="Phone"
              value={supplier.contactInformation?.phoneNumber}
              icon={Phone}
            />
            <DataField
              label="Email"
              value={supplier.contactInformation?.emailAddress}
              icon={Mail}
            />
            <DataField
              label="Website"
              value={supplier.contactInformation?.website}
              icon={Globe}
            />
          </Section>

          <Section title="Financial & Terms">
            <DataField
              label="Payment Terms"
              value={supplier.commercialTerms?.paymentTermsId?.paymentTerm}
              icon={CreditCard}
            />
            <DataField
              label="Pricing Agreement"
              value={
                supplier.commercialTerms?.pricingAgreementId
                  ?.pricingAgreementName
              }
            />
            <DataField
              label="Currency"
              value={
                supplier.financialInformation?.paymentCurrencyId
                  ? `${supplier.financialInformation.paymentCurrencyId.currencyName} (${supplier.financialInformation.paymentCurrencyId.currencySymbol})`
                  : "N/A"
              }
            />
            <DataField
              label="Compliance"
              value={
                supplier.complianceDocumentation?.healthAndSafetyCompliance
                  ? "H&S Compliant"
                  : "Pending Review"
              }
              icon={ShieldCheck}
            />
          </Section>
        </div>
      </motion.div>
    </div>
  );
};

export default SupplierView;
