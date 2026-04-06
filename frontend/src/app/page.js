'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to their dashboard
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'doctor') {
        router.push('/doctor/dashboard');
      } else {
        router.push('/patient/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBlue">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightBlue">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center">
        {/* Background with stethoscope image on right */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30">
            {/* Stethoscope SVG or Image */}
            <div className="text-9xl">🩺</div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Book Doctor Now
            </h1>
            <p className="text-xl text-white mb-8">
              Schedule your appointment for<br />
              a hassle free check-up.
            </p>
            <Link href="/doctors" className="btn-primary inline-block">
              Book an Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Our Doctors Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">
            Our Doctors
          </h2>

          {/* Doctor Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="bg-lightBlue rounded-2xl p-8 mb-4">
                  {/* Doctor Avatar */}
                  <div className="w-40 h-40 mx-auto mb-4">
                    <div className="text-8xl">👩‍⚕️</div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Dr. Sarah Williams
                </h3>
                <p className="text-gray-600">Cardiologist</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/doctors" className="btn-primary">
              View All Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-lightBlue">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">
            Why Choose Us
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-5xl mb-4">👨‍⚕️</div>
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Expert Doctors
              </h3>
              <p className="text-gray-600">
                Qualified and experienced medical professionals
              </p>
            </div>

            <div className="card text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Easy Booking
              </h3>
              <p className="text-gray-600">
                Book appointments with just a few clicks
              </p>
            </div>

            <div className="card text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3 text-primary">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your health data is completely secure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-darkBlue text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2024 CareConnection. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}