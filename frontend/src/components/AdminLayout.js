'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { href: '/admin/patients', label: 'Patients', icon: '👥' },
    { href: '/admin/appointments', label: 'Appointments', icon: '📅' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-md transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          {sidebarOpen && <span className="font-bold text-primary text-lg">CareConnection</span>}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === link.href
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              {sidebarOpen && <span className="font-medium">{link.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t">
          {sidebarOpen && (
            <p className="text-sm text-gray-500 mb-2 truncate">{user?.name}</p>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 text-red-500 hover:text-red-700 transition-colors w-full"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-primary text-2xl"
          >
            ☰
          </button>
          <h2 className="text-gray-700 font-semibold">Admin Panel</h2>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}