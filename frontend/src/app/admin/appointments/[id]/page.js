'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../lib/api';
import AdminLayout from '../../../../components/AdminLayout';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ICONS from '../../../../constants/icons';

export default function AdminAppointmentDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id;

  const [appointment, setAppointment] = useState(null);
  const [loadingAppointment, setLoadingAppointment] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      } else {
        fetchAppointment();
      }
    }
  }, [user, loading, router, appointmentId]);

  const fetchAppointment = async () => {
    try {
      const { data } = await api.get(`/appointments/${appointmentId}`);
      setAppointment(data.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment');
      router.push('/admin/appointments');
    } finally {
      setLoadingAppointment(false);
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

  if (loading || loadingAppointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin' || !appointment) {
    return null;
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/appointments')}
            className="text-primary hover:underline mb-4 flex items-center gap-2"
          >
            ← Back to Appointments
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-4xl overflow-hidden flex-shrink-0">
                  {appointment.patient?.avatar ? (
                    <img 
                      src={appointment.patient.avatar} 
                      alt={appointment.patient.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">{ICONS.PATIENT}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {appointment.patient?.name}
                  </h3>
                  <p className="text-sm text-gray-500">{appointment.patient?.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium text-gray-900">
                    {appointment.patient?.age || 'Not provided'} years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {appointment.patient?.gender || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="font-medium text-gray-900">
                    {appointment.patient?.bloodGroup || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">
                    {appointment.patient?.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">
                    {appointment.patient?.address || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment & Doctor Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor Info Card */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Doctor Information</h2>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl overflow-hidden flex-shrink-0">
                  {appointment.doctor?.avatar ? (
                    <img 
                      src={appointment.doctor.avatar} 
                      alt={appointment.doctor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{ICONS.DOCTOR}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Dr. {appointment.doctor?.name}
                  </h3>
                  <p className="text-primary">
                    {appointment.doctor?.specialization || 'General Physician'}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{appointment.doctor?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{appointment.doctor?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium text-gray-900">
                    {appointment.doctor?.experience ? `${appointment.doctor.experience} years` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="font-medium text-gray-900">
                    {appointment.doctor?.consultationFee || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Info Card */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(appointment.date), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">{appointment.timeSlot}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    {getStatusBadge(appointment.status)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booked On</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(appointment.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">Reason for Visit</p>
                <p className="font-medium text-gray-900 mt-1">{appointment.reason}</p>
              </div>

              {appointment.cancelReason && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-500">Cancellation Reason</p>
                  <p className="text-red-700 mt-1">{appointment.cancelReason}</p>
                </div>
              )}
            </div>

            {/* Prescription & Notes */}
            {(appointment.prescription || appointment.notes) && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Details</h2>
                
                {appointment.prescription && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">{ICONS.PRESCRIPTION} Prescription</p>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {appointment.prescription}
                    </p>
                  </div>
                )}

                {appointment.notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">{ICONS.NOTES} Doctor's Notes</p>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {appointment.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}