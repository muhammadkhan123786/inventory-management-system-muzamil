"use client";

import { NavLinksInterface } from "@/types/NavLinksInterface";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavLinkProps = {
  navbar: NavLinksInterface;
  children: React.ReactNode;
};

export default function NavLink({ navbar, children }: NavLinkProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive =
    (!open && pathname === navbar.href) ||
    navbar.children?.some((child) => pathname.startsWith(child.href));

  /**
   * PARENT GAP REDUCED:
   * Changed mb-2 to mb-0.5 for a much tighter list of parent links.
   */
  const baseClasses =
    "text-[15px] font-[Outfit] font-semibold flex items-center justify-between transition-all duration-300 transform mb-0.5";

  /**
   * COMPACT PADDING:
   * Reduced p-3.5 to p-2.5 to make the parent capsules slimmer.
   */
  const activeClasses =
    "bg-[#FFFFFF] text-[#4F39F6] p-2.5 rounded-xl scale-[1.02] shadow-md";

  const inactiveClasses =
    "text-white/90 p-2.5 rounded-xl hover:bg-white/10 hover:scale-[1.03] active:scale-95";

  if (!navbar.children) {
    return (
      <Link
        href={navbar.href}
        className={`${baseClasses} ${
          isActive && !open ? activeClasses : inactiveClasses
        }`}
      >
        <div className="flex items-center gap-3 px-1">{children}</div>
      </Link>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Parent Link */}
      <div
        onClick={() => setOpen((pre) => !pre)}
        className={`${baseClasses} cursor-pointer ${
          open || isActive ? activeClasses : inactiveClasses
        }`}
      >
        <div className="flex items-center gap-3 px-1">{children}</div>
        <span className="text-[10px] opacity-70 pr-2">{open ? "▲" : "▼"}</span>
      </div>

      {/* Children: Gaps kept exactly as before */}
      {open && (
        <div className="ml-6 mt-1 flex flex-col gap-1.5 mb-2">
          {navbar.children?.map((child) => {
            const childActive = pathname === child.href;

            return (
              <Link
                key={child._id}
                href={child.href}
                className={`text-[13px] px-5 py-2 rounded-lg border-l-2 transition-all duration-200 transform ${
                  childActive
                    ? "text-[#FFFFFF] font-bold bg-white/10 border-white/40 scale-[1.02] shadow-[2px_2px_8px_rgba(0,0,0,0.1)]"
                    : "text-white/70 border-transparent hover:text-white hover:bg-white/5 hover:border-white/10 hover:scale-[1.04]"
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
