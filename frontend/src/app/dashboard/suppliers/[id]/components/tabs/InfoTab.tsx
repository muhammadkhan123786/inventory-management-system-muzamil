// components/tabs/InfoTab.tsx
import {
  Mail, Building2, MapPin, Calendar,
  Phone, Globe, User, FileText,
  Shield, Truck, Hash, Tag, Award,
  Clock, CheckCircle, AlertCircle,
  DollarSign 
} from "lucide-react";

interface Props { supplier: any }

function StatCard({ icon: Icon, label, value, gradient, color }: {
  icon: any; label: string; value: string; gradient: string; color: string;
}) {
  return (
    <div className={`relative group`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity`}></div>
      <div className={`relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300`}>
        <div className="flex items-center gap-4">
          <div className={`relative`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl blur-md opacity-60`}></div>
            <div className={`relative w-14 h-14 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, gradient, children }: {
  title: string; icon: any; gradient: string; children: React.ReactNode;
}) {
  return (
    <div className="relative group h-full">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity`}></div>
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
        <div className={`px-6 py-4 border-b border-gray-100 bg-gradient-to-r ${gradient} bg-opacity-5 rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: any }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 group">
      {Icon && (
        <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
          <Icon className="h-3.5 w-3.5 text-gray-600" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-sm text-gray-800 font-medium mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export function InfoTab({ supplier }: Props) {
  const fmt = (d?: string) => d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : undefined;

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Calendar}
          label="Partner Since"
          value={fmt(supplier.createdAt) || "N/A"}
          gradient="from-blue-500 to-cyan-500"
          color="blue"
        />
        <StatCard
          icon={Truck}
          label="Lead Time"
          value={`${supplier.productServices?.leadTimes || "N/A"} days`}
          gradient="from-emerald-500 to-teal-500"
          color="emerald"
        />
        <StatCard
          icon={Hash}
          label="Min Order"
          value={`${supplier.productServices?.minimumOrderQuantity || "N/A"} units`}
          gradient="from-purple-500 to-pink-500"
          color="purple"
        />
        <StatCard
          icon={Award}
          label="VAT Number"
          value={supplier.supplierIdentification?.vat || "N/A"}
          gradient="from-amber-500 to-orange-500"
          color="amber"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Contact Information" icon={Mail} gradient="from-blue-500 to-cyan-500">
          <InfoRow label="Primary Contact" value={supplier.contactInformation?.primaryContactName} icon={User} />
          <InfoRow label="Phone" value={supplier.contactInformation?.phoneNumber} icon={Phone} />
          <InfoRow label="Email" value={supplier.contactInformation?.emailAddress} icon={Mail} />
          <InfoRow label="Website" value={supplier.contactInformation?.website} icon={Globe} />
        </Card>

        <Card title="Business Details" icon={Building2} gradient="from-purple-500 to-pink-500">
          <InfoRow label="Legal Name" value={supplier.supplierIdentification?.legalBusinessName} />
          <InfoRow label="Trading Name" value={supplier.supplierIdentification?.tradingName} />
          <InfoRow label="Reg Number" value={supplier.supplierIdentification?.businessRegNumber} icon={Hash} />
          <InfoRow label="VAT Number" value={supplier.supplierIdentification?.vat} icon={Tag} />
        </Card>

        <Card title="Business Address" icon={MapPin} gradient="from-emerald-500 to-teal-500">
          <InfoRow label="Street" value={supplier.businessAddress?.businessAddress} />
          {/* <InfoRow label="City" value={supplier.businessAddress?.city} /> */}
          <InfoRow label="State / Province" value={supplier.businessAddress?.state} />
          <InfoRow label="Postal Code" value={supplier.businessAddress?.zipCode} />
          {/* <InfoRow label="Country" value={supplier.businessAddress?.country} /> */}
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Contract Terms" icon={Calendar} gradient="from-amber-500 to-orange-500">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-xs font-medium text-blue-600 mb-1">Start Date</p>
              <p className="text-sm font-bold text-gray-800">{fmt(supplier.commercialTerms?.contractStartDate) || "—"}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <p className="text-xs font-medium text-purple-600 mb-1">End Date</p>
              <p className="text-sm font-bold text-gray-800">{fmt(supplier.commercialTerms?.contractEndDate) || "—"}</p>
            </div>
          </div>
          <InfoRow label="Payment Terms" value={supplier.commercialTerms?.paymentTerms} icon={FileText} />
          <InfoRow label="Discount Terms" value={supplier.commercialTerms?.discountTerms} icon={Tag} />
          <InfoRow label="Credit Limit" value={supplier.commercialTerms?.creditLimit ? `£${supplier.commercialTerms.creditLimit}` : undefined} icon={DollarSign} />
        </Card>

        <Card title="Operational Information" icon={Truck} gradient="from-cyan-500 to-blue-500">
          <InfoRow label="Order Contact" value={supplier.operationalInformation?.orderContactName} icon={User} />
          <InfoRow label="Order Email" value={supplier.operationalInformation?.orderContactEmail} icon={Mail} />
          <InfoRow label="Shipping Method" value={supplier.operationalInformation?.shippingMethod} icon={Truck} />
          <InfoRow label="Fulfillment Center" value={supplier.operationalInformation?.fulfillmentCenter} icon={Building2} />
        </Card>
      </div>

      {/* Policies Section */}
      {(supplier.operationalInformation?.returnPolicy || supplier.operationalInformation?.warrantyTerms) && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl blur-xl opacity-20"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-800 to-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white">Policies & Terms</h3>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {supplier.operationalInformation?.returnPolicy && (
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <p className="font-semibold text-blue-800">Return Policy</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{supplier.operationalInformation.returnPolicy}</p>
                </div>
              )}
              {supplier.operationalInformation?.warrantyTerms && (
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-emerald-600" />
                    <p className="font-semibold text-emerald-800">Warranty Terms</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{supplier.operationalInformation.warrantyTerms}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}