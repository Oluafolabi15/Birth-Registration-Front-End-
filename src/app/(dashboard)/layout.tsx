'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';
import { AuthProvider } from '@/context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[var(--color-snow)]">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-gray-100">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
          <span className="font-bold text-[var(--color-midnight)]">Decentralize Digital birth Registration</span>
          <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Main Content */}
        <main className="lg:ml-64 min-h-screen p-4 md:p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </AuthProvider>
  );
}
