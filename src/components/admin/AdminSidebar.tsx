"use client";

import { useState } from "react";
import { User as UserType } from "@/types/auth";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Copyright,
  Menu,
  X,
  User,
} from "lucide-react";

// Navigation items for the admin panel
const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "undergraduate",
    label: "Undergraduates",
    icon: Users,
  },
  {
    id: "employer",
    label: "Employers",
    icon: Users,
  },
  {
    id: "gigs",
    label: "Gigs",
    icon: Briefcase,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: UserType | null;
  onLogout: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
}: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleNavItemClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#023E8A] text-white transform transition-transform duration-200 ease-in-out flex flex-col ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-4">
          <div className="text-2xl font-semibold text-[#CAF0F8] mb-2 pt-16 md:pt-4 text-center md:text-left">
            Admin Panel
          </div>
          {user && (
            <div className="flex items-center space-x-3 p-3 bg-[#0077B6]/20 rounded-lg mt-4">
              <div className="w-10 h-10 bg-[#CAF0F8] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-[#023E8A]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                </p>
                <p className="text-xs text-[#90E0EF]">
                  {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-grow space-y-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item.id)}
              className={`flex items-center w-full text-left px-4 py-3 rounded-md transition-colors ${
                activeTab === item.id
                  ? "bg-[#0077B6] text-white"
                  : "text-[#90E0EF] hover:bg-[#0096C7] hover:text-white"
              }`}
            >
              <span className="w-6 h-6 mr-3 flex items-center justify-center">
                <item.icon size={20} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 space-y-2">
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center w-full text-left px-4 py-3 mx-2 rounded-md transition-colors text-[#90E0EF] hover:bg-[#0096C7] hover:text-white"
          >
            <span className="w-6 h-6 mr-3 flex items-center justify-center">
              <LogOut size={20} />
            </span>
            Logout
          </button>

          {/* Copyright */}
          <div className="flex items-center text-[#90E0EF] py-2 px-4">
            <span className="w-6 h-6 mr-3 flex items-center justify-center">
              <Copyright size={14} />
            </span>
            <p className="text-xs">2025 QuickShift</p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
}