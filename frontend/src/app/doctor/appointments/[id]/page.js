'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../lib/api';
import DoctorLayout from '../../../../components/DoctorLayout';
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
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    status: '',
    prescription: '',
    notes: ''
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'doctor') {
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
      setFormData({
        status: data.data.status,
        prescription: data.data.prescription || '',
        notes: data.data.notes || ''
      });
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment');
      router.push('/doctor/appointments');
    } finally {
      setLoadingAppointment(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await api.put(`/appointments/${appointmentId}/status`, formData);
      toast.success('Appointment updated successfully!');
      fetchAppointment(); // Refresh data
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await api.put(`/appointments/${appointmentId}/cancel`, {
        cancelReason: 'Cancelled by doctor'
      });
      toast.success('Appointment cancelled');
      fetchAppointment();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  if (loading || loadingAppointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBlue">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'doctor' || !appointment) {
    return null;
  }

  return (
    <DoctorLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/doctor/appointments')}
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
                {/* Patient Avatar */}
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

            {/* Chat Button */}
            <Link
              href={`/doctor/chat?patient=${appointment.patient?._id}`}
              className="card bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl transition-shadow mt-4 block"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{ICONS.CHAT}</div>
                <div>
                  <h3 className="font-semibold">Chat with Patient</h3>
                  <p className="text-sm opacity-90">Send a message</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Appointment Details & Update Form */}
          <div className="lg:col-span-2">
            {/* Appointment Info Card */}
            <div className="card mb-6">
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

            {/* Update Form */}
            {appointment.status !== 'cancelled' && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Appointment</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Prescription */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {ICONS.PRESCRIPTION} Prescription / Medicines
                    </label>
                    <textarea
                      value={formData.prescription}
                      onChange={(e) => setFormData({...formData, prescription: e.target.value})}
                      rows="6"
                      className="input-field"
                      placeholder="Enter prescription details, medicines, dosage instructions..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This will be visible to the patient
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {ICONS.NOTES} Doctor's Notes / Diagnosis
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows="4"
                      className="input-field"
                      placeholder="Enter diagnosis, observations, recommendations..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={updating}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      {updating ? 'Updating...' : 'Update Appointment'}
                    </button>
                    
                    {appointment.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}