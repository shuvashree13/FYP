'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import PatientLayout from '../../../components/PatientLayout';
import { format } from 'date-fns';
import Link from 'next/link';
import ICONS from '../../../constants/icons';

export default function MyAppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return appointment.status === 'pending' || appointment.status === 'confirmed';
    if (filter === 'past') return appointment.status === 'completed' || appointment.status === 'cancelled';
    return appointment.status === filter;
  });

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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600 mt-2">
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All ({appointments.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Upcoming ({appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Past ({appointments.filter(a => a.status === 'completed' || a.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">{ICONS.CALENDAR}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Appointments Found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'You have no appointments yet' 
                : `No ${filter} appointments`}
            </p>
            <Link href="/#doctors" className="btn-primary inline-block">
              Browse Doctors
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {/* Doctor Avatar */}
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0 overflow-hidden">
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

                    {/* Appointment Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            Dr. {appointment.doctor?.name || 'Unknown Doctor'}
                          </h3>
                          <p className="text-gray-600">
                            {appointment.doctor?.specialization || 'General Physician'}
                          </p>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-sm text-gray-500">{ICONS.CALENDAR} Date & Time</p>
                          <p className="font-medium text-gray-900">
                            {format(new Date(appointment.date), 'MMM dd, yyyy')} • {appointment.timeSlot}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{ICONS.PHONE} Contact</p>
                          <p className="font-medium text-gray-900">
                            {appointment.doctor?.phone || 'Not available'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm text-gray-500">{ICONS.MESSAGE} Reason for Visit</p>
                        <p className="text-gray-900">{appointment.reason}</p>
                      </div>

                      {appointment.prescription && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">{ICONS.PRESCRIPTION} Prescription Available</p>
                          <p className="text-sm text-gray-700 line-clamp-2">{appointment.prescription}</p>
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">{ICONS.NOTES} Doctor's Notes</p>
                          <p className="text-sm text-gray-700 line-clamp-2">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="ml-4">
                    <Link
                      href={`/patient/appointments/${appointment._id}`}
                      className="btn-primary text-sm whitespace-nowrap"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}