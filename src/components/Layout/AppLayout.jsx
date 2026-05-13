/*
========================
SECTION: MODULE OVERVIEW
========================
*/

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation } from "react-router-dom";

const AppLayoutContent = ({ children, title }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMobileMenuOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full bg-[#f9fafb] dark:bg-[#030712] text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar isCollapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 transition-all duration-300">
        <Header 
          title={title} 
          toggleMobileMenu={() => setMobileMenuOpen(!isMobileMenuOpen)} 
        />
        
        {/* Main scrollable content view */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in pb-12">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

const AppLayout = ({ children, title }) => {
  return (
    <AppLayoutContent title={title}>
      {children}
    </AppLayoutContent>
  );
};

export default AppLayout;

