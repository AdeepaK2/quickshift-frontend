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
    badge: "10",
  },
  {
    id: "employer",
    label: "Employers",
    icon: User,
    badge: "5",
  },  {
    id: "gigs",
    label: "Gig Requests",
    icon: Briefcase,
    badge: "23",
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
          className="p-2 rounded-md bg-quickshift-primary text-white hover:bg-quickshift-secondary transition-colors"
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
        className={`dashboard-sidebar ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-3">
          <div className="text-base font-semibold text-white mb-2 pt-12 md:pt-2 text-center md:text-left" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
            Admin Panel
          </div>
          {user && (
            <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg mt-3">
              <div className="w-8 h-8 bg-quickshift-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-white" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
                  {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                </p>
                <p className="text-xs text-white/70" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
                  {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </p>
              </div>
            </div>
          )}
        </div>        {/* Navigation */}
        <nav className="flex-grow space-y-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item.id)}
              className={`sidebar-nav-item w-full ${activeTab === item.id ? 'active' : ''} focus:outline-none focus:ring-0`}
              style={{
                color: 'white !important',
                fontWeight: activeTab === item.id ? '700' : '600',
                outline: 'none',
                border: 'none',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="flex items-center" style={{ color: 'white !important' }}>
                <span className="w-5 h-5 mr-2 flex items-center justify-center" style={{ color: 'white !important' }}>
                  <item.icon size={16} />
                </span>
                <span style={{ color: 'white !important' }}>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${
                  activeTab === item.id
                    ? "bg-white/20 text-white"
                    : "bg-quickshift-primary text-white"
                }`} style={{ color: 'white !important', fontSize: '0.6rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>        {/* Footer */}
        <div className="p-2 space-y-2">
          {/* Quick Stats */}
          <div className="bg-[#0077B6]/30 rounded-lg p-3 mx-2 mb-3 border border-white/20">
            <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wide" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
              Quick Stats
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white font-medium" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Active Users</span>
                <span className="text-xs font-bold text-white" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>2,847</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white font-medium" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Pending Reviews</span>
                <span className="text-xs font-bold text-white" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white font-medium" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Active Gigs</span>
                <span className="text-xs font-bold text-white" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white font-medium" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Revenue (MTD)</span>
                <span className="text-xs font-bold text-white" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>$12.5K</span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center w-full text-left px-3 py-2 mx-2 rounded-md transition-colors text-red-300 hover:bg-red-500/20 hover:text-red-200"
            style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)', fontSize: '0.75rem' }}
          >
            <span className="w-4 h-4 mr-2 flex items-center justify-center" style={{ color: 'white !important' }}>
              <LogOut size={16} />
            </span>
            <span style={{ color: 'white !important' }}>Logout</span>
          </button>

          {/* Copyright */}
          <div className="flex items-center text-white/70 py-1 px-3">
            <span className="w-4 h-4 mr-2 flex items-center justify-center" style={{ color: 'white !important' }}>
              <Copyright size={12} />
            </span>
            <p className="text-xs" style={{ color: 'white !important', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>2025 QuickShift</p>
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