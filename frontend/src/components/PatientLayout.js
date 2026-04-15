'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import ICONS from '../constants/icons';

export default function PatientLayout({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home', icon: ICONS.WEB },
    { href: '/patient/dashboard', label: 'Dashboard', icon: ICONS.HOME },
    { href: '/patient/appointments', label: 'My Appointments', icon: ICONS.CALENDAR },
    { href: '/patient/chat', label: 'Messages', icon: ICONS.MESSAGE },
    { href: '/patient/profile', label: 'Profile', icon: ICONS.PATIENT },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar - Always Open */}
      <aside className="w-64 bg-white shadow-md transition-all duration-300 flex flex-col">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b">
          <img 
            src="/images/logo.png" 
            alt="Care Connection Logo" 
            className="w-10 h-10 object-contain"
          />
          <span className="text-xl font-semibold text-primary">CareConnection</span>
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
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t">
          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 text-red-500 hover:text-red-700 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <span className="text-xl">{ICONS.LOGOUT}</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4">
          <h2 className="text-gray-700 font-semibold text-xl">Patient Panel</h2>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}