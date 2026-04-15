'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import api from '../../lib/api';
import ICONS from '../../constants/icons';

export default function DoctorsPage() {
  const { user, loading } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/doctors');
      setDoctors(data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Get unique specializations
  const specializations = ['all', ...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = specializationFilter === 'all' || 
                                  doctor.specialization === specializationFilter;
    return matchesSearch && matchesSpecialization;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="/images/logo.png" 
                alt="Care Connection Logo" 
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-primary">Care Connection</h1>
                <p className="text-xs text-gray-600">Your Health Partner</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-primary font-medium">
                Home
              </Link>
              <Link href="/doctors" className="text-primary font-medium border-b-2 border-primary">
                Find a Doctor
              </Link>
              <Link href="/#about" className="text-gray-700 hover:text-primary font-medium">
                About Us
              </Link>
              <Link href="/#contact" className="text-gray-700 hover:text-primary font-medium">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Find a Doctor</h1>
          <p className="text-gray-600">Browse our qualified medical professionals</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              {ICONS.SEARCH}
            </span>
          </div>

          {/* Specialization Filter */}
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Specializations</option>
            {specializations.filter(s => s !== 'all').map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Doctors Grid */}
        {loadingDoctors ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{ICONS.DOCTOR}</div>
            <p className="text-gray-600 text-lg">No doctors found matching your criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor) => (
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
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-gray-600">
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-darkBlue text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 CareConnection. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">Your Health, Our Priority</p>
        </div>
      </footer>
    </div>
  );
}