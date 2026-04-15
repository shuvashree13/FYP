'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import DoctorLayout from '../../../components/DoctorLayout';
import { format } from 'date-fns';
import Link from 'next/link';
import ICONS from '../../../constants/icons';

export default function DoctorAppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'doctor') {
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
    return appointment.status === filter;
  });

  if (loading || loadingAppointments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBlue">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'doctor') {
    return null;
  }

  return (
    <DoctorLayout>
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
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending ({appointments.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'confirmed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Confirmed ({appointments.filter(a => a.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Completed ({appointments.filter(a => a.status === 'completed').length})
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
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'You have no appointments yet' 
                : `No ${filter} appointments`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {/* Patient Avatar */}
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl overflow-hidden flex-shrink-0">
                      {appointment.patient?.avatar ? (
                        <img 
                          src={appointment.patient.avatar} 
                          alt={appointment.patient.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{ICONS.PATIENT}</span>
                      )}
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {appointment.patient?.name || 'Unknown Patient'}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            {appointment.patient?.age && `${appointment.patient.age} years`}
                            {appointment.patient?.gender && ` • ${appointment.patient.gender}`}
                            {appointment.patient?.bloodGroup && ` • Blood: ${appointment.patient.bloodGroup}`}
                          </div>
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
                            {appointment.patient?.phone || 'No phone'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm text-gray-500">{ICONS.MESSAGE} Reason for Visit</p>
                        <p className="text-gray-900">{appointment.reason}</p>
                      </div>

                      {appointment.prescription && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">{ICONS.PRESCRIPTION} Prescription Added</p>
                          <p className="text-sm text-gray-700 line-clamp-2">{appointment.prescription}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="ml-4">
                    <Link
                      href={`/doctor/appointments/${appointment._id}`}
                      className="btn-primary text-sm whitespace-nowrap"
                    >
                      {appointment.status === 'pending' ? 'Review' : 
                       appointment.status === 'confirmed' ? 'Start Consultation' :
                       'View Details'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}