'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  isFullscreen?: boolean;
  autoCollapseSidebar?: boolean;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  isFullscreen = false,
  autoCollapseSidebar = false,
  sidebarCollapsed: externalSidebarCollapsed,
  onToggleSidebar
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState(false);

  // Use external collapse state if provided, otherwise use internal state
  const sidebarCollapsed = externalSidebarCollapsed !== undefined ? externalSidebarCollapsed : internalSidebarCollapsed;

  // Load sidebar collapsed state from localStorage only if no external state is provided
  useEffect(() => {
    if (externalSidebarCollapsed === undefined) {
      const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
      if (savedCollapsedState) {
        setInternalSidebarCollapsed(JSON.parse(savedCollapsedState));
      }
    }
  }, [externalSidebarCollapsed]);

  // Save sidebar collapsed state to localStorage only if no external handler is provided
  const toggleSidebarCollapse = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else {
      const newState = !internalSidebarCollapsed;
      setInternalSidebarCollapsed(newState);
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    }
  };
  return (<div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
    <Sidebar
      isOpen={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      isCollapsed={sidebarCollapsed}
      onToggleCollapse={toggleSidebarCollapse}
    /><div className="flex-1 flex flex-col">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        title={title}
        isFullscreen={isFullscreen}
      />

      <main className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950 ${isFullscreen ? 'p-0' : ''}`}>
        {isFullscreen ? (
          children
        ) : (
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  </div>);
};

export default DashboardLayout;
