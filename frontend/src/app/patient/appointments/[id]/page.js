'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../lib/api';
import PatientLayout from '../../../../components/PatientLayout';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ICONS from '../../../../constants/icons';

export default function AppointmentDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id;

  const [appointment, setAppointment] = useState(null);
  const [loadingAppointment, setLoadingAppointment] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'patient') {
        router.push('/');
      } else {
        fetchAppointment();
      }
    }
  }, [user, loading, router, appointmentId]);

  const fetchAppointment = async () => {
    try {
      const { data } = await api.get(`/appointments/${appointmentId}`);
      console.log('Appointment data:', data.data); // Debug log
      setAppointment(data.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment');
      router.push('/patient/appointments');
    } finally {
      setLoadingAppointment(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    setCancelling(true);
    try {
      await api.put(`/appointments/${appointmentId}/cancel`, {
        cancelReason: 'Cancelled by patient'
      });
      toast.success('Appointment cancelled successfully');
      fetchAppointment();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  if (loading || loadingAppointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBlue">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'patient' || !appointment) {
    return null;
  }

  return (
    <PatientLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/patient/appointments"
            className="text-primary hover:underline mb-4 inline-flex items-center gap-2"
          >
            ← Back to Appointments
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Appointment Details</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Doctor Information */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Doctor Information</h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-4xl overflow-hidden">
                  {appointment.doctor?.avatar ? (
                    <img 
                      src={appointment.doctor.avatar} 
                      alt={appointment.doctor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">{ICONS.DOCTOR}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Dr. {appointment.doctor?.name}
                  </h3>
                  <p className="text-sm text-gray-600">{appointment.doctor?.specialization}</p>
                </div>
              </div>

              <div className="space-y-3">
                {appointment.doctor?.qualification && (
                  <div>
                    <p className="text-sm text-gray-500">Qualification</p>
                    <p className="font-medium text-gray-900">
                      {appointment.doctor.qualification}
                    </p>
                  </div>
                )}
                {appointment.doctor?.experience && (
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium text-gray-900">
                      {appointment.doctor.experience} years
                    </p>
                  </div>
                )}
                {appointment.doctor?.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">
                      {appointment.doctor.phone}
                    </p>
                  </div>
                )}
                {appointment.doctor?.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">
                      {appointment.doctor.email}
                    </p>
                  </div>
                )}
                {appointment.doctor?.consultationFee && (
                  <div>
                    <p className="text-sm text-gray-500">Consultation Fee</p>
                    <p className="font-medium text-gray-900">
                      {appointment.doctor.consultationFee}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Button */}
            <Link
              href={`/patient/chat?doctor=${appointment.doctor?._id}`}
              className="card bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl transition-shadow mt-4 block"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{ICONS.CHAT}</div>
                <div>
                  <h3 className="font-semibold">Chat with Doctor</h3>
                  <p className="text-sm opacity-90">Send a message</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Appointment Details */}
          <div className="lg:col-span-2">
            {/* Appointment Info Card */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
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
                    {appointment.status === 'pending' && <span className="badge badge-warning">{ICONS.PENDING} Pending</span>}
                    {appointment.status === 'confirmed' && <span className="badge badge-info">{ICONS.CHECK} Confirmed</span>}
                    {appointment.status === 'completed' && <span className="badge badge-success">{ICONS.CHECK} Completed</span>}
                    {appointment.status === 'cancelled' && <span className="badge badge-danger">{ICONS.CROSS} Cancelled</span>}
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

            {/* Prescription */}
            {appointment.prescription && (
              <div className="card mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{ICONS.PRESCRIPTION} Prescription</h2>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{appointment.prescription}</p>
                </div>
              </div>
            )}

            {/* Doctor's Notes */}
            {appointment.notes && (
              <div className="card mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{ICONS.NOTES} Doctor's Notes</h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{appointment.notes}</p>
                </div>
              </div>
            )}

            {/* Cancel Button */}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <div className="card bg-red-50">
                <h3 className="font-semibold text-gray-900 mb-2">Cancel Appointment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you need to cancel this appointment, please do so at least 24 hours in advance.
                </p>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}