"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Copyright,
  Menu,
  X,
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
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
}: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    // TODO: Implement proper logout logic
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("authToken");
      router.push("/login");
    }
  };

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
          <div className="text-2xl font-semibold text-[#CAF0F8] mb-8 pt-16 md:pt-4 text-center md:text-left">
            Admin Panel
          </div>
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
            onClick={handleLogout}
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
