"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, User, LogOut } from "lucide-react";

interface NavigationProps {
  transparent?: boolean;
  fixed?: boolean;
}

export default function Navigation({ transparent = false, fixed = false }: NavigationProps) {
  const { isAuthenticated, userType, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await logout();
        // Logout function in context now handles redirect
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const getDashboardPath = () => {
    switch (userType) {
      case 'admin':
        return '/admin';
      case 'employer':
        return '/employer';
      default:
        return '/undergraduate';
    }
  };

  const getUserDisplayName = () => {
    if (user?.firstName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Job Categories", href: "#job-categories" },
    { label: "Contact Us", href: "#contact" },
  ];

  return (
    <nav className={`w-full z-50 ${fixed ? 'fixed top-0' : ''} ${transparent ? 'bg-transparent' : 'bg-white shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/bird_2.jpg"
              alt="QuickShift Logo"
              width={120}
              height={70}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-600 hover:text-[#0077B6] transition-colors duration-200 text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={getDashboardPath()}
                  className="flex items-center space-x-2 px-3 py-2 text-[#0077B6] hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{getUserDisplayName()}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-600 hover:text-[#0077B6] text-sm font-medium transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#005F8A] text-sm font-medium transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-[#0077B6] hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2 text-gray-600 hover:text-[#0077B6] hover:bg-gray-50 rounded-md text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              {/* Auth Section */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      href={getDashboardPath()}
                      className="flex items-center space-x-2 px-3 py-2 text-[#0077B6] hover:bg-blue-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{getUserDisplayName()}</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/login"
                      className="block px-3 py-2 text-gray-600 hover:text-[#0077B6] hover:bg-gray-50 rounded-md text-sm font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-3 py-2 bg-[#0077B6] text-white rounded-md hover:bg-[#005F8A] text-sm font-medium text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}