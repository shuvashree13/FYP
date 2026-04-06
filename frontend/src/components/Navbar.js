'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">🩺</span>
            </div>
            <span className="text-xl font-semibold text-primary">
              care connection
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              className={`nav-link ${pathname === '/' ? 'font-semibold' : ''}`}
            >
              Home
            </Link>
            <Link 
              href="/doctors" 
              className={`nav-link ${pathname === '/doctors' ? 'font-semibold' : ''}`}
            >
              Find a Doctor
            </Link>
            <Link 
              href="/about" 
              className={`nav-link ${pathname === '/about' ? 'font-semibold' : ''}`}
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className={`nav-link ${pathname === '/contact' ? 'font-semibold' : ''}`}
            >
              Contact Us
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  href={
                    user.role === 'admin' 
                      ? '/admin/dashboard' 
                      : user.role === 'doctor' 
                      ? '/doctor/dashboard' 
                      : '/patient/dashboard'
                  }
                  className="nav-link"
                >
                  Dashboard
                </Link>
                <button onClick={logout} className="btn-login">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-login">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}