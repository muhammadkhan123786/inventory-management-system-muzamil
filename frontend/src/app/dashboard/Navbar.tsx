"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import NavLink from "@/components/ui/NavLink";
import { getRoleBaseNavBarLinks } from "@/lib/UtilsFns";

/**
 * Nav item interface
 * IDs are strings because backend / MongoDB usually sends string IDs
 */
interface NavItem {
  _id: string;
  label: string;
  href: string;
  icon?: any;
  roleId: number[];
  subItems?: NavItem[];
}

export default function Navbar() {
  const [navBarLinks, setNavBarLinks] = useState<NavItem[]>([]);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Hydration protection
    setIsMounted(true);

    try {
      const roleId = localStorage.getItem("roleId");
      if (!roleId) return;

      const navLinks = getRoleBaseNavBarLinks(
        Number(roleId),
      ) as unknown as NavItem[];

      setNavBarLinks(navLinks);
    } catch (error) {
      console.error("Error fetching navbar links:", error);
    }
  }, []);

  const toggleSubMenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id)
        ? prev.filter((menuId) => menuId !== id)
        : [...prev, id],
    );
  };

  // Prevent hydration mismatch
  if (!isMounted) return null;

  return (
    <nav className="h-full p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
      {navBarLinks.map((link) => {
        const Icon = link.icon;
        const hasSubItems = !!link.subItems?.length;
        const isOpen = openMenus.includes(link._id);

        return (
          <div key={link._id} className="flex flex-col gap-1">
            {/* Main link / dropdown trigger */}
            <div
              className="flex items-center justify-between group cursor-pointer"
              onClick={() => hasSubItems && toggleSubMenu(link._id)}
            >
              <NavLink navbar={link as any}>
                <div className="flex gap-3 items-center py-2 px-3 rounded-md hover:bg-gray-100 transition-colors">
                  {Icon && <Icon size={20} className="text-gray-600" />}
                  <span className="text-sm font-medium">{link.label}</span>
                </div>
              </NavLink>

              {hasSubItems && (
                <ChevronDown
                  size={16}
                  className={`mr-2 transition-transform text-gray-400 ${isOpen ? "rotate-180" : ""
                    }`}
                />
              )}
            </div>

            {/* Sub menu */}
            {hasSubItems && isOpen && (
              <div className="ml-8 flex flex-col gap-1 border-l border-gray-200 pl-2">
                {link.subItems?.map((sub) => {
                  const SubIcon = sub.icon;

                  return (
                    <NavLink key={sub._id} navbar={sub as any}>
                      <div className="flex gap-3 items-center py-2 px-3 rounded-md hover:bg-gray-50 text-gray-500 hover:text-indigo-600 transition-colors">
                        {SubIcon && <SubIcon size={16} />}
                        <span className="text-xs">{sub.label}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
