'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import DoctorLayout from '../../../components/DoctorLayout';
import { format, isToday, isFuture } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ICONS from '../../../constants/icons';

export default function DoctorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'doctor') {
        router.push('/');
      } else if (!user.isApproved) {
        toast.error('Your account is pending approval from admin');
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

  const handleApprove = async (appointmentId) => {
    setProcessingId(appointmentId);
    try {
      await api.put(`/appointments/${appointmentId}/status`, {
        status: 'confirmed'
      });
      toast.success('Appointment approved!');
      fetchAppointments();
    } catch (error) {
      console.error('Error approving appointment:', error);
      toast.error('Failed to approve appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (appointmentId) => {
    if (!confirm('Are you sure you want to reject this appointment?')) {
      return;
    }

    setProcessingId(appointmentId);
    try {
      await api.put(`/appointments/${appointmentId}/cancel`, {
        cancelReason: 'Rejected by doctor'
      });
      toast.success('Appointment rejected');
      fetchAppointments();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      toast.error('Failed to reject appointment');
    } finally {
      setProcessingId(null);
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

  const todayAppointments = appointments.filter(apt => 
    isToday(new Date(apt.date)) && apt.status !== 'cancelled'
  );

  const upcomingAppointments = appointments.filter(apt => 
    isFuture(new Date(apt.date)) && apt.status !== 'cancelled'
  );

  const pendingAppointments = appointments.filter(apt => 
    apt.status === 'pending'
  );

  const completedAppointments = appointments.filter(apt => 
    apt.status === 'completed'
  );

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
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, Dr. {user.name}! {ICONS.DOCTOR}
          </h1>
          <p className="text-gray-600 mt-2">
            {user.specialization || 'General Physician'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{ICONS.CALENDAR}</div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {todayAppointments.length}
            </h3>
            <p className="text-gray-600">Today's Appointments</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{ICONS.PENDING}</div>
            </div>
            <h3 className="text-3xl font-bold text-yellow-600 mb-2">
              {pendingAppointments.length}
            </h3>
            <p className="text-gray-600">Pending Approval</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{ICONS.CALENDAR}</div>
            </div>
            <h3 className="text-3xl font-bold text-blue-600 mb-2">
              {upcomingAppointments.length}
            </h3>
            <p className="text-gray-600">Upcoming</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{ICONS.CHECK}</div>
            </div>
            <h3 className="text-3xl font-bold text-green-600 mb-2">
              {completedAppointments.length}
            </h3>
            <p className="text-gray-600">Completed</p>
          </div>
        </div>

        {/* Pending Approvals Section */}
        {pendingAppointments.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Pending Approvals ({pendingAppointments.length})
              </h2>
            </div>

            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <div key={appointment._id} className="card bg-yellow-50 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Patient Avatar */}
                      <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl overflow-hidden flex-shrink-0">
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
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {appointment.patient?.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{ICONS.CALENDAR} {format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
                          <span>{ICONS.TIME} {appointment.timeSlot}</span>
                          {appointment.patient?.age && (
                            <span>{appointment.patient.age} years</span>
                          )}
                          {appointment.patient?.gender && (
                            <span>• {appointment.patient.gender}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(appointment._id)}
                        disabled={processingId === appointment._id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        {processingId === appointment._id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(appointment._id)}
                        disabled={processingId === appointment._id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Appointments */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
            <Link href="/doctor/appointments" className="text-primary hover:underline">
              View All Appointments
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Appointments Today
              </h3>
              <p className="text-gray-600">
                Enjoy your day off!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
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
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {appointment.patient?.name || 'Unknown Patient'}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1">
                          {appointment.patient?.age && `${appointment.patient.age} years`}
                          {appointment.patient?.gender && ` • ${appointment.patient.gender}`}
                          {appointment.patient?.bloodGroup && ` • ${appointment.patient.bloodGroup}`}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{ICONS.TIME} {appointment.timeSlot}</span>
                          <span>{ICONS.PHONE} {appointment.patient?.phone || 'No phone'}</span>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">Reason: </span>
                          <span className="text-gray-900">{appointment.reason}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(appointment.status)}
                      <div className="mt-3">
                        <Link
                          href={`/doctor/appointments/${appointment._id}`}
                          className="btn-primary text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Specialization</span>
                <span className="font-semibold">{user.specialization || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Experience</span>
                <span className="font-semibold">{user.experience ? `${user.experience} years` : 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Fee</span>
                <span className="font-semibold">{user.consultationFee || 'Not set'}</span>
              </div>
              <Link href="/doctor/profile" className="btn-outline w-full text-center mt-4 block">
                Update Profile
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Appointments</span>
                <span className="font-semibold">{appointments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">{completedAppointments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Upcoming</span>
                <span className="font-semibold text-blue-600">{upcomingAppointments.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}