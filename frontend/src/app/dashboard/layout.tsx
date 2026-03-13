"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Menu, Zap, LogOut, X } from "lucide-react";
import { getRoleBaseNavBarLinks } from "@/lib/UtilsFns";
import { Button } from "@/components/form/CustomButton";

interface NavItem {
  _id: string;
  label: string;
  href: string;
  icon?: any;
  roleId?: number[];
  subItems?: NavItem[];
}

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // ALL STATE HOOKS MUST BE AT THE TOP
  const [roleId, setRoleId] = useState<number | null>(null);
  const [today, setToday] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        // No token found, redirect to sign-in
        router.push("/auth/signIn");
        return;
      }
      
      // Token exists, user is authenticated
      setIsAuthenticated(true);
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      const storedRoleId = localStorage.getItem("roleId");
      if (storedRoleId) {
        setRoleId(Number(storedRoleId));
      }
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    setToday(new Date().toDateString());
  }, []);

  const navBarLinks = useMemo<NavItem[]>(() => {
    if (!roleId) return [];
    return getRoleBaseNavBarLinks(roleId);
  }, [roleId]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      router.push("/auth/signIn");
    }
  };

  const toggleMenu = (id: string) => {
    setExpandedMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Show loading while checking authentication (AFTER all hooks)
  if (isCheckingAuth || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderNavItem = (
    item: NavItem,
    index?: string,
    isMobile: boolean = false,
  ) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus[item._id];
    const hasActiveSubItem = item.subItems?.some(
      (sub) => pathname === sub.href,
    );

    if (hasSubItems) {
      return (
        <div key={item._id} className="w-full">
          <motion.div
            initial={isMobile ? { opacity: 0, x: -20 } : undefined}
            animate={isMobile ? { opacity: 1, x: 0 } : undefined}
            transition={{ delay: 5 * 0.05 }}
          >
            <button
              onClick={() => toggleMenu(item._id)}
              className={`w-full group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive || hasActiveSubItem
                ? "bg-white text-indigo-600 shadow-lg shadow-white/20"
                : "text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-1"
                }`}
            >
              <div className="flex items-center gap-3">
                {Icon && <Icon className="h-5 w-5" />}
                <span className="font-medium">{item.label}</span>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </motion.div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden ml-4 mt-1 space-y-1"
              >
                {item.subItems?.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = pathname === subItem.href;
                  return (
                    <Link
                      key={subItem._id}
                      href={subItem.href}
                      onClick={() => isMobile && setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isSubActive
                        ? "bg-white/20 text-white font-medium border-l-2 border-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1 border-l-2 border-white/20"
                        }`}
                    >
                      {SubIcon && <SubIcon className="h-4 w-4" />}
                      <span>{subItem.label}</span>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <motion.div
        key={item._id}
        initial={isMobile ? { opacity: 0, x: -20 } : undefined}
        animate={isMobile ? { opacity: 1, x: 0 } : undefined}
        transition={{ delay: 5 * 0.05 }}
      >
        <Link
          href={item.href}
          onClick={() => isMobile && setSidebarOpen(false)}
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
            ? "bg-white text-indigo-600 shadow-lg shadow-white/20"
            : "text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-1"
            }`}
        >
          {Icon && <Icon className="h-5 w-5" />}
          <span className="font-medium">{item.label}</span>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 relative">
      {/* Sidebar Desktop */}
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 relative">
        {/* Background patterns... (Keep existing code) */}

        {/* Mobile sidebar */}
        {/* Mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <div className="fixed inset-0 z-100 lg:hidden">
              {" "}
              {/* High Z-Index is critical */}
              {/* 1. Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              {/* 2. Sidebar Container */}
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 w-72 bg-linear-to-br from-indigo-700 via-purple-700 to-purple-800 shadow-2xl flex flex-col"
              >
                {/* 3. Header inside Mobile Sidebar */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-white fill-white/20" />
                    <span className="text-xl font-bold text-white tracking-tight">
                      Humber Mobility
                    </span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 -mr-2 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* 4. Navigation Links Area */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {navBarLinks.map((item, index) =>
                    renderNavItem(item, String(index), true),
                  )}
                </nav>

                {/* 5. Mobile Footer (Sign Out) */}
                {onLogout && (
                  <div className="p-4 border-t border-white/10 bg-black/10">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-red-500/20 transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}

        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col h-full bg-linear-to-br from-indigo-600 via-purple-600 to-purple-700 shadow-2xl">
            <div className="flex h-16 items-center px-6 border-b border-white/10 text-white gap-2 shrink-0">
              <Zap className="h-5 w-5 fill-white/20" />
              <h1 className="text-xl font-semibold">Humber Mobility</h1>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-1 mb-6">
                {navBarLinks.map((item) =>
                  renderNavItem(item, undefined, false),
                )}
              </div>

              <div className="pt-4 border-t border-white/10 space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </button>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-semibold text-sm mb-1">
                    Need help?
                  </h3>
                  <p className="text-white/70 text-xs">
                    Contact support anytime
                  </p>
                </div>
              </div>
            </nav>
          </div>
        </div>

        <div className="lg:pl-64">
          {/* Header - Non-sticky */}
          <header className="relative z-10 flex h-16 items-center border-b bg-white/80 backdrop-blur-md px-8 justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </Button>
            <div className="text-sm text-gray-500">
              {today}
            </div>
          </header>
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
