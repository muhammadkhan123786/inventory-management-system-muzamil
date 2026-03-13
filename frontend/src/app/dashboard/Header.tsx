"use client";
// app/dashboard/components/Header.tsx

import Image from "next/image";
import logo from '../../assets/logo.png';
import profilepic from '../../assets/profilepic.png';
import { Bell, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import ThemeToggle from '@/components/theme/ThemeToggle';
import { Roles } from "@/data/TestData";
export default function Header() {
  const [messageCount] = useState<number>(1);
  const [notificationCount] = useState<number>(1);
  const [userRole, setUserRole] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const roleId = localStorage.getItem("roleId");
    if (roleId) {
      setTimeout(() => setUserRole(Number(roleId)), 0);
    }
  }, []);
  function logout() {
    localStorage.removeItem('email');
    localStorage.removeItem('roleId');
    router.push('/auth/signIn')

  }
  return (
    <header className="bg-white shadow-2xl flex px-6 justify-between items-center py-4">
      <div>
        <Image
          src={logo}
          alt="logo"
          className="mb-8 w-16 h-auto"
          loading="eager"
        />
      </div>
      <div className="w-1/2 hidden md:flex relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
          🔍
        </span>
        <input type="text" name="search" id="Search" placeholder="Search"
          className="w-full pl-10 p-3 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition" />
      </div>
      <div>
        <div className="flex gap-4">
          <div className="relative inline-flex">
            {/* Badge */}
            <Badge count={messageCount} />
            {/* Icon */}
            <Mail className="w-6 h-6 text-gray-700" />
          </div>
          <div className="relative inline-flex">
            <Badge count={notificationCount} />
            <Bell />
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <Image src={profilepic} alt="profile-pic" className="h-16 w-16 rounded-full" loading="eager" />
        <div className="flex flex-col gap-2">
          <h1 className="font-bold">Dani</h1>

          <p className="text-xs text-gray-400">{
            (userRole === null || userRole === undefined) ? 'Loading' : Roles[userRole] ?? 'Customer'
          }</p>
          <button className="cursor-pointer" onClick={logout}>Log out</button>
        </div>
        <div className="h-20">

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}



