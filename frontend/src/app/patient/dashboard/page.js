'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import PatientLayout from '../../../components/PatientLayout';
import { format } from 'date-fns';
import Link from 'next/link';
import ICONS from '../../../constants/icons';

export default function PatientDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'patient') {
        router.push('/');
      } else {
        fetchAppointments();
      }
    }
  }, [user, loading, router]);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">{ICONS.PENDING} Pending</span>;
      case 'confirmed':
        return <span className="badge badge-info">{ICONS.CHECK} Confirmed</span>;
      case 'completed':
        return <span className="badge badge-success">{ICONS.CHECK} Completed</span>;
      case 'cancelled':
        return <span className="badge badge-danger">{ICONS.CROSS} Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const upcomingAppointments = appointments.filter(
    apt => apt.status === 'pending' || apt.status === 'confirmed'
  );

  const completedAppointments = appointments.filter(
    apt => apt.status === 'completed'
  );

  const appointmentsWithPrescriptions = completedAppointments.filter(
    apt => apt.prescription
  );

  if (loading || loadingAppointments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBlue">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'patient') {
    return null;
  }

  return (
    <PatientLayout>
      <div>
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here's your health overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{ICONS.CALENDAR}</div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {upcomingAppointments.length}
            </h3>
            <p className="text-gray-600">Upcoming Appointments</p>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{ICONS.CHECK}</div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {completedAppointments.length}
            </h3>
            <p className="text-gray-600">Completed Visits</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{ICONS.PRESCRIPTION}</div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {appointmentsWithPrescriptions.length}
            </h3>
            <p className="text-gray-600">Prescriptions Available</p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
            <Link href="/patient/appointments" className="text-primary hover:underline">
              View All
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">{ICONS.CALENDAR}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Upcoming Appointments
              </h3>
              <p className="text-gray-600 mb-6">
                Browse our doctors to schedule your appointment
              </p>
              <Link href="/#doctors" className="btn-primary inline-block">
                Browse Doctors
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl overflow-hidden">
                        {appointment.doctor?.avatar ? (
                          <img 
                            src={appointment.doctor.avatar} 
                            alt={appointment.doctor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{ICONS.DOCTOR}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {appointment.doctor?.name || 'Unknown Doctor'}
                        </h3>
                        <p className="text-gray-600">
                          {appointment.doctor?.specialization || 'General Physician'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{ICONS.CALENDAR} {format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
                          <span>{ICONS.TIME} {appointment.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(appointment.status)}
                      <div className="mt-3">
                        <Link
                          href={`/patient/appointments/${appointment._id}`}
                          className="text-primary hover:underline text-sm"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Prescriptions */}
        {appointmentsWithPrescriptions.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recent Prescriptions</h2>
              <Link href="/patient/appointments" className="text-primary hover:underline">
                View All
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {appointmentsWithPrescriptions
                .slice(0, 2)
                .map((appointment) => (
                  <div key={appointment._id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Dr. {appointment.doctor?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(appointment.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <span className="badge badge-success">{ICONS.PRESCRIPTION} Available</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {appointment.prescription}
                    </p>
                    <Link
                      href={`/patient/appointments/${appointment._id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View Full Prescription →
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}