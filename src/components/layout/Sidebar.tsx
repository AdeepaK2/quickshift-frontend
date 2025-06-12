'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  BriefcaseIcon, 
  UserGroupIcon, 
  UserCircleIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Updated navigation with professional SVG icons
const navigation = [
  { name: 'Dashboard', href: '/employer/dashboard', icon: ChartBarIcon, category: 'main' },
  { name: 'Jobs', href: '/employer/jobs', icon: BriefcaseIcon, category: 'main' },
  { name: 'Candidates', href: '/employer/candidates', icon: UserGroupIcon, category: 'main' },
  { name: 'Profile', href: '/employer/profile', icon: UserCircleIcon, category: 'account' },
  { name: 'Settings', href: '/employer/settings', icon: Cog6ToothIcon, category: 'account' },
];

interface User {
  id: string;
  email: string;
  name?: string;
}

interface SidebarProps {
  user?: User | null;
  onLogout?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCollapsed(window.innerWidth < 1024);
    };
    
    // Set initial state
    handleResize();
    
    // Add listener for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile menu toggle button */}
      {isMobile && (
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg text-gray-700 hover:bg-gray-50 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isCollapsed ? (
            <Bars3Icon className="h-6 w-6" />
          ) : (
            <XMarkIcon className="h-6 w-6" />
          )}
        </motion.button>
      )}

      {/* Enhanced Sidebar */}
      <motion.div 
        animate={{ 
          width: isCollapsed && isMobile ? 0 : 270,
          opacity: isCollapsed && isMobile ? 0 : 1,
          x: isCollapsed && isMobile ? -270 : 0,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }}
        className={`h-screen bg-white shadow-xl flex-shrink-0 fixed md:sticky top-0 left-0 z-30
                    ${isCollapsed && isMobile ? 'invisible' : 'visible'}
                    backdrop-blur-sm bg-opacity-95`}
        style={{
          backgroundImage: "radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.04) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(79, 70, 229, 0.06) 2%, transparent 0%)",
          backgroundSize: "100px 100px"
        }}
      >
        <div className="flex flex-col h-screen overflow-hidden">
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Logo and brand area with enhanced styling */}
            <div className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-10 -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="flex items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-xl blur-sm opacity-20 animate-pulse"></div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg relative z-10 border border-white/20">
                    Q
                  </div>
                </div>
                <motion.h1 
                  animate={{ opacity: isCollapsed ? 0 : 1, x: isCollapsed ? -20 : 0 }}
                  className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700"
                >
                  QuickShift
                  <span className="block text-xs font-normal text-gray-500 mt-0.5">Employer Portal</span>
                </motion.h1>
              </div>
            </div>
            
            {/* Navigation menu with enhanced visual design */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto">
              {/* Improved Main Menu section header with normal font */}
              <div className="mb-3 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute left-0 bottom-0 h-px bg-gradient-to-r from-blue-200 via-indigo-300 to-transparent"
                />
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center">
                    <div className="relative mr-2">
                      <span className="absolute -inset-1 bg-blue-500 opacity-20 rounded-full blur-sm"></span>
                      <span className="relative block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                      Main Menu
                    </h3>
                  </div>
                </div>
              </div>
              
              {/* Navigation items for main menu with reduced spacing */}
              {navigation.filter(item => item.category === 'main').map((item) => {
                const isActive = pathname === item.href;
                const isHovered = hoveredItem === item.name;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                  >
                    <motion.div 
                      className={`relative flex items-center px-4 py-1 rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? 'text-blue-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      whileHover={{ x: 4, transition: { duration: 0.2 } }}
                      onHoverStart={() => setHoveredItem(item.name)}
                      onHoverEnd={() => setHoveredItem(null)}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeNavBackground"
                          className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl"
                          style={{ borderRadius: '12px' }}
                          transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                        />
                      )}
                      
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg ${
                        isActive 
                          ? 'bg-blue-100 text-blue-600' 
                          : isHovered 
                            ? 'bg-gray-100 text-blue-500' 
                            : 'text-gray-500'
                      } transition-colors duration-200 mr-3`}>
                        <Icon className="w-4 h-4" />
                        
                        <AnimatePresence>
                          {(isActive || isHovered) && (
                            <motion.div 
                              className="absolute inset-0 bg-blue-500 opacity-10 rounded-lg"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 0.15 }}
                              exit={{ scale: 1.2, opacity: 0 }}
                              transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatType: "reverse" }}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <span className="relative z-10 text-sm font-medium">{item.name}</span>
                      
                      {isActive && (
                        <motion.div 
                          layoutId="activeNavIndicator"
                          className="absolute right-2 h-full flex items-center"
                        >
                          <div className="h-5 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
                        </motion.div>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
              
              {/* Improved Account section header with normal font */}
              <div className="mb-3 mt-6 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                  className="absolute left-0 bottom-0 h-px bg-gradient-to-r from-blue-200 via-indigo-300 to-transparent"
                />
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center">
                    <div className="relative mr-2">
                      <span className="absolute -inset-1 bg-indigo-500 opacity-20 rounded-full blur-sm"></span>
                      <span className="relative block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                      Account
                    </h3>
                  </div>
                </div>
              </div>
              
              {/* Navigation items for account menu with reduced spacing */}
              {navigation.filter(item => item.category === 'account').map((item) => {
                const isActive = pathname === item.href;
                const isHovered = hoveredItem === item.name;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                  >
                    <motion.div 
                      className={`relative flex items-center px-4 py-1 rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? 'text-blue-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      whileHover={{ x: 4, transition: { duration: 0.2 } }}
                      onHoverStart={() => setHoveredItem(item.name)}
                      onHoverEnd={() => setHoveredItem(null)}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeNavBackground"
                          className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl"
                          style={{ borderRadius: '12px' }}
                          transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                        />
                      )}
                      
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg ${
                        isActive 
                          ? 'bg-blue-100 text-blue-600' 
                          : isHovered 
                            ? 'bg-gray-100 text-blue-500' 
                            : 'text-gray-500'
                      } transition-colors duration-200 mr-3`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <span className="relative z-10 text-sm font-medium">{item.name}</span>
                    </motion.div>
                  </Link>
                );
              })}

              {/* Sign out button with exact same alignment as navigation items */}
              <motion.button 
                className="relative flex items-center px-4 py-1 w-full rounded-xl cursor-pointer transition-all text-gray-600 hover:text-red-600 group"
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setHoveredItem("signout")}
                onHoverEnd={() => setHoveredItem(null)}
              >
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 group-hover:text-red-500 group-hover:bg-red-50 transition-colors duration-200 mr-3">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  
                  <AnimatePresence>
                    {hoveredItem === "signout" && (
                      <motion.div 
                        className="absolute inset-0 bg-red-500 opacity-10 rounded-lg"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.15 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <span className="relative z-10 text-sm font-medium">Sign Out</span>
              </motion.button>
            </nav>
          </div>

          

          {/* User profile area with premium styling */}
          <div className="mx-5 mb-4 mt-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200 rounded-full filter blur-xl opacity-30 -mr-10 -mt-10"></div>
              
              <div className="flex items-center space-x-3 relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium shadow-md">
                  <span>EM</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Emma Morgan</p>
                  <div className="flex items-center mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                    <p className="text-xs text-gray-500">HR Manager</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Simplified help section */}
          <div className="px-4 pb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center">
                <QuestionMarkCircleIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700 font-medium">Need help?</span>
              </div>
              
              <motion.button 
                className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Support
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Mobile overlay with improved animation */}
      <AnimatePresence>
        {!isCollapsed && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-20"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>
    </>
  );
}