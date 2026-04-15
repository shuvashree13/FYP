'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../../lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ICONS from '../../../constants/icons';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfToday } from 'date-fns';

export default function BookAppointmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctor');

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('09:41');
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'patient') {
        router.push('/');
      } else if (doctorId) {
        fetchDoctor();
      }
    }
  }, [user, loading, router, doctorId]);

  const fetchDoctor = async () => {
    try {
      const { data } = await api.get(`/doctors/${doctorId}`);
      setDoctor(data.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to load doctor details');
    } finally {
      setLoadingDoctor(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (!selectedTime) {
      toast.error('Please select a time');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please enter reason for visit');
      return;
    }

    setBooking(true);
    try {
      await api.post('/appointments', {
        doctor: doctorId,
        date: selectedDate,
        timeSlot: selectedTime,
        reason: reason.trim()
      });
      toast.success('Appointment booked successfully!');
      router.push('/patient/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = startOfToday();

  const previousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleDateClick = (date) => {
    if (!isBefore(date, today)) {
      setSelectedDate(format(date, 'yyyy-MM-dd'));
    }
  };

  if (loading || loadingDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBlue">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'patient' || !doctor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-lightBlue">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
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
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-primary font-medium">
                Home
              </Link>
              <Link href="/patient/doctors" className="text-gray-700 hover:text-primary font-medium">
                Find a Doctor
              </Link>
              <Link href="/#about" className="text-gray-700 hover:text-primary font-medium">
                About Us
              </Link>
              <Link href="/#contact" className="text-gray-700 hover:text-primary font-medium">
                Contact Us
              </Link>
              <Link href="/patient/dashboard" className="btn-primary">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          href="/patient/doctors" 
          className="inline-flex items-center gap-2 text-gray-700 hover:text-primary mb-8 text-lg"
        >
          <span>←</span>
          <span>Back to Doctors</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Side - Doctor Info */}
          <div>
            {/* Doctor Card */}
            <div className="bg-white rounded-lg p-8 mb-8">
              <div className="flex items-center gap-6 mb-6">
                {/* Doctor Avatar */}
                <div className="w-48 h-48 bg-gradient-to-br from-sky-200 to-sky-300 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
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

                {/* Doctor Details */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Dr. {doctor.name}
                  </h2>
                  <p className="text-xl text-primary font-semibold mb-1">
                    {doctor.specialization || 'General Physician'}
                  </p>
                  <p className="text-gray-600">{doctor.qualification || 'MD'}</p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Bio:</h3>
              <p className="text-gray-700 leading-relaxed">
                {doctor.bio || `A specialized ${doctor.specialization?.toLowerCase() || 'doctor'} graduated from Institute of Medicine. Focused mostly in ${doctor.specialization?.toLowerCase() || 'medical'} services.`}
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="font-semibold">Experience:</span>
                  <span>{doctor.experience ? `${doctor.experience} years` : 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="font-semibold">Consultation Fee:</span>
                  <span>{doctor.consultationFee || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="font-semibold">Phone:</span>
                  <span>{doctor.phone || 'Not available'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Booking Calendar */}
          <div>
            <div className="bg-white rounded-lg p-8 shadow-lg">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {format(currentMonth, 'MMMM yyyy')} →
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">←</span>
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">→</span>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="mb-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Add empty cells for days before month starts */}
                  {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square"></div>
                  ))}
                  
                  {/* Actual calendar days */}
                  {daysInMonth.map((date, index) => {
                    const isDisabled = isBefore(date, today);
                    const isSelected = selectedDate === format(date, 'yyyy-MM-dd');
                    const isTodayDate = isToday(date);

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        disabled={isDisabled}
                        className={`
                          aspect-square p-2 rounded-lg text-center font-medium transition-all
                          ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-sky-50 cursor-pointer'}
                          ${isSelected ? 'bg-primary text-white hover:bg-primary' : ''}
                          ${isTodayDate && !isSelected ? 'text-primary font-bold' : ''}
                        `}
                      >
                        {format(date, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Time</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                />
              </div>

              {/* Reason Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Reason for Visit</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  placeholder="Enter your reason for visit..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookAppointment}
                disabled={booking || !selectedDate}
                className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? 'Booking...' : 'Book Appointment Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}