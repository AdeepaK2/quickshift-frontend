'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon, 
  XMarkIcon,
  ChartBarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  user?: {
    companyName?: string;
    email?: string;
  } | null;
  onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/employer/dashboard', icon: ChartBarIcon, current: true },
    { name: 'Job Postings', href: '/employer/jobs', icon: BriefcaseIcon, current: false },
    { name: 'Applicants', href: '/employer/applicants', icon: UserGroupIcon, current: false },
    { name: 'Reports', href: '/employer/reports', icon: DocumentTextIcon, current: false },
    { name: 'Settings', href: '/employer/settings', icon: CogIcon, current: false },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-[#0077B6] text-white hover:bg-[#005F8A] transition-colors"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#03045E] text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo/Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#0077B6]/20">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-[#00B4D8] mr-3" />
            <div>
              <h1 className="text-xl font-bold text-white">QuickShift</h1>
              <p className="text-xs text-[#90E0EF]">Employer Portal</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-6 border-b border-[#0077B6]/20">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#0077B6] rounded-full flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user.companyName || user.email}
                </p>
                <p className="text-xs text-[#90E0EF]">Employer Account</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${item.current
                  ? 'bg-[#0077B6] text-white'
                  : 'text-[#90E0EF] hover:bg-[#0077B6]/50 hover:text-white'
                }
              `}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#0077B6]/20">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onLogout();
            }}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-[#90E0EF] rounded-md hover:bg-red-600/20 hover:text-red-300 transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}