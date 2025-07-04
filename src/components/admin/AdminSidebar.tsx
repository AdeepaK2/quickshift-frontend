"use client";

import { useState } from "react";
import { User as UserType } from "@/types/auth";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: UserType | null;
  onLogout: () => void;
  stats?: {
    totalUsers: number;
    totalEmployers: number;
    activeGigs: number;
    totalRevenue: number;
  };
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  stats = {
    totalUsers: 0,
    totalEmployers: 0,
    activeGigs: 0,
    totalRevenue: 0
  }
}: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleNavItemClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

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
      badge: stats.totalUsers.toString(),
    },
    {
      id: "employer",
      label: "Employers",
      icon: User,
      badge: stats.totalEmployers.toString(),
    },
    {
      id: "gigs",
      label: "Gig Requests",
      icon: Briefcase,
      badge: stats.activeGigs.toString(),
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-[80] md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-3 rounded-lg bg-[#023E8A] text-white hover:bg-[#0077B6] transition-colors shadow-md"
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
        className={`dashboard-sidebar fixed inset-y-0 left-0 z-[60] w-52 transform transition-transform duration-200 ease-in-out flex flex-col bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-800 ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo/Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/20">
          <div className="flex items-center pt-12 md:pt-0">
            <LayoutDashboard className="h-5 w-5 text-blue-300 mr-2" />
            <div>
              <h1 className="text-base font-bold text-white">QuickShift</h1>
              <p className="text-xs text-blue-200">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-3 border-b border-white/20">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-quickshift-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium truncate">
                  {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                </p>
                <p className="text-xs text-blue-200">
                  {user.role === 'super_admin' ? 'Super Admin' : 'Admin Account'}
                </p>
              </div>
            </div>
          </div>
        )}        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item.id)}
                className={`sidebar-nav-item w-full ${isActive ? 'active' : ''} focus:outline-none focus:ring-0 group px-2 py-1.5 text-left flex items-center justify-between rounded-lg mx-2 transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500/30 text-white border-l-4 border-blue-300' 
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2 flex items-center justify-center">
                    <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                  </span>
                  <span className="text-xs">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`
                    px-1.5 py-0.5 text-xs font-medium rounded-full transition-colors
                    ${isActive ? 'bg-blue-400 text-white' : 'bg-blue-600 text-white'}
                  `} style={{ fontSize: '0.6rem' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>        {/* Footer/Logout Section */}
        <div className="mt-auto p-3 border-t border-white/20">
          {/* Quick Stats */}
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-2 mb-2 border border-blue-400/20">
            <h3 className="text-xs font-semibold text-blue-200 mb-1 uppercase tracking-wide">
              Quick Stats
            </h3>
            <div className="space-y-0.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-300">Total Users</span>
                <span className="text-xs font-semibold text-white">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-300">Active Gigs</span>
                <span className="text-xs font-semibold text-green-300">{stats.activeGigs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-300">Employers</span>
                <span className="text-xs font-semibold text-white">{stats.totalEmployers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-300">Revenue (MTD)</span>
                <span className="text-xs font-semibold text-blue-200">LKR {(stats.totalRevenue / 1000).toFixed(1)}K</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center px-2 py-1.5 text-xs font-medium text-red-300 rounded-md hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 border border-red-400/20 hover:border-red-300/40"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[40] bg-black/40 backdrop-blur-sm md:hidden"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
}