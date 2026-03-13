import { ShoppingCart, Store, UserCheck, Globe, Zap } from "lucide-react";
import { RevenueCard } from "./RevenueCard";

export const MarketplaceStatistics = () => {
  return (
    <div className="w-full mt-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#4F39F6] to-[#9810FA] flex items-center justify-center shadow-md">
          <Zap className="text-white w-5 h-5 fill-white/20" />
        </div>
        <h2 className="text-2xl font-black text-[#4F39F6] tracking-tight">
          Marketplace Order Statistics
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <RevenueCard
          title="eBay"
          amount="£23,450.00"
          percentage="+18%"
          Icon={ShoppingCart}
          iconBgColor="from-[#FDC700] via-[#F0B100] to-[#FF6900]"
          cardBgColor="bg-[#FFFEE5]"
          shadowColor="hover:shadow-[0_20px_40px_-10px_rgba(253,199,0,0.3)]"
        />
        <RevenueCard
          title="Amazon"
          amount="£45,780.00"
          percentage="+25%"
          Icon={Store}
          iconBgColor="from-[#FF8904] via-[#FF6900] to-[#E17100]"
          cardBgColor="bg-[#FFF7ED]"
          shadowColor="hover:shadow-[0_20px_45px_-10px_rgba(255,105,0,0.35)]"
        />
        <RevenueCard
          title="Walk-in Customer"
          amount="£18,920.00"
          percentage="+12%"
          Icon={UserCheck}
          iconBgColor="from-[#3B82F6] to-[#2563EB]"
          cardBgColor="bg-[#EFF6FF]"
          shadowColor="hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)]"
        />
        <RevenueCard
          title="Website"
          amount="£32,150.00"
          percentage="+22%"
          Icon={Globe}
          iconBgColor="from-[#C27AFF] via-[#AD46FF] to-[#7F22FE]"
          cardBgColor="bg-[#F5F3FF]"
          shadowColor="hover:shadow-[0_20px_45px_-10px_rgba(127,34,254,0.35)]"
        />
      </div>
    </div>
  );
};
