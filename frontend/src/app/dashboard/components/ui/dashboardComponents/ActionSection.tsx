import React from "react";
import { Users, Package, Activity } from "lucide-react";
import { ActionCard } from "./ActionCard";

export const ActionSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 w-full">
      <ActionCard
        title="Customer Management"
        description="Register new customers or search existing records"
        Icon={Users}
        iconBgColor="from-[#FF2056] to-[#E12AFB]"
        topBorderColor="bg-[#FF2056]"
        btnHoverColor="hover:bg-[#FF2056]"
      />

      <ActionCard
        title="Parts & Inventory"
        description="Check parts availability and order supplies"
        Icon={Package}
        iconBgColor="from-[#4F39F6] to-[#9810FA]"
        topBorderColor="bg-[#9810FA]"
        btnHoverColor="hover:bg-[#9810FA]"
      />

      <ActionCard
        title="System Setup"
        description="Configure menu items and system preferences"
        Icon={Activity}
        iconBgColor="from-[#2B7FFF] to-[#00B8DB]"
        topBorderColor="bg-[#00B8DB]"
        btnHoverColor="hover:bg-[#00B8DB]"
      />
    </div>
  );
};
