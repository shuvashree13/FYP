'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import ICONS from '../constants/icons';

export default function Home() {
  const { user, loading } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/doctors');
      setDoctors(data.data.slice(0, 3)); // Get first 3 doctors
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo.png" 
                alt="Care Connection Logo" 
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-primary">Care Connection</h1>
                <p className="text-xs text-gray-600">Your Health Partner</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-primary font-medium">
                Home
              </Link>
              <Link href="/doctors" className="text-gray-700 hover:text-primary font-medium">
                Find a Doctor
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-primary font-medium">
                About Us
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-primary font-medium">
                Contact Us
              </Link>
              
              {user ? (
                <Link 
                  href={
                    user.role === 'admin' 
                      ? '/admin/dashboard' 
                      : user.role === 'doctor' 
                      ? '/doctor/dashboard' 
                      : '/patient/dashboard'
                  }
                  className="btn-primary"
                >
                  Dashboard
                </Link>
              ) : (
                <Link href="/login" className="btn-primary">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean Background Only */}
      <section 
        className="relative py-32 min-h-[600px] flex items-center"
        style={{
          backgroundImage: 'url(/images/home.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-white max-w-2xl">
            <h2 className="text-6xl font-bold mb-6 drop-shadow-lg">
              Book Doctor Now
            </h2>
            <p className="text-2xl mb-8 opacity-90 drop-shadow-lg">
              Schedule your appointment for<br />
              a hassle free check-up.
            </p>
            <Link 
              href={user ? "/patient/book-appointment" : "/register"} 
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-lg"
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Our Doctors Section */}
      <section id="doctors" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-primary mb-12">
            Our Doctors
          </h2>

          {loadingDoctors ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No doctors available at the moment</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Doctor Avatar */}
                    <div className="bg-gradient-to-br from-sky-200 to-sky-300 h-48 flex items-center justify-center overflow-hidden">
                      {doctor.avatar ? (
                        <img 
                          src={doctor.avatar} 
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-8xl">{ICONS.DOCTOR}</div>
                      )}
                    </div>
                    
                    {/* Doctor Info */}
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Dr. {doctor.name}
                      </h3>
                      <p className="text-primary font-medium mb-4">
                        {doctor.specialization || 'General Physician'}
                      </p>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p>{ICONS.EDUCATION} {doctor.qualification || 'Certified'}</p>
                        <p>{ICONS.WORK} {doctor.experience ? `${doctor.experience} years` : 'Experienced'}</p>
                        <p>{ICONS.MONEY} Fee: {doctor.consultationFee || 'Available'}</p>
                      </div>
                      <Link 
                        href={user ? `/patient/book-appointment?doctor=${doctor._id}` : "/login"}
                        className="btn-primary w-full text-center"
                      >
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Doctors Button */}
              <div className="text-center mt-12">
                <Link 
                  href="/doctors" 
                  className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg"
                >
                  View All Doctors
                  <span>→</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-primary mb-12">
            About Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">{ICONS.DOCTOR}</div>
              <h3 className="text-xl font-semibold mb-3">Qualified Doctors</h3>
              <p className="text-gray-600">
                Access to experienced and certified medical professionals
              </p>
            </div>

            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">{ICONS.CALENDAR}</div>
              <h3 className="text-xl font-semibold mb-3">Easy Booking</h3>
              <p className="text-gray-600">
                Book appointments with just a few clicks, anytime, anywhere
              </p>
            </div>

            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">{ICONS.LOCK}</div>
              <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
              <p className="text-gray-600">
                Your health information is protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-sky-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left - Contact Info */}
            <div>
              <h2 className="text-4xl font-bold text-primary mb-8">Contact Us</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Now:</h3>
                  <p className="text-gray-700 text-lg">+977 98********</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Address:</h3>
                  <p className="text-gray-700">Kamalpokhari, Kathmandu</p>
                  <p className="text-gray-700">New Baneshwor, Kathmandu</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Operating Hours:</h3>
                  <p className="text-gray-700">09:00 AM - 11:00 AM</p>
                  <p className="text-gray-700">03:00 PM - 08:00 PM</p>
                </div>
              </div>
            </div>

            {/* Right - Contact Form */}
            <div className="bg-darkBlue rounded-lg p-8 shadow-xl">
              <form className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Address</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-primary"
                    placeholder="Your address"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-primary"
                    placeholder="Your email"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Message</label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-primary"
                    placeholder="Please leave your message here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-darkBlue text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 CareConnection. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">Your Health, Our Priority</p>
        </div>
      </footer>
    </div>
  );
}