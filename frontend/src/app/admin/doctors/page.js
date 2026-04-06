'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import AdminLayout from '../../../components/AdminLayout';
import toast from 'react-hot-toast';

export default function AdminDoctorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [filter, setFilter] = useState('all'); // all, approved, pending

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      } else {
        fetchDoctors();
      }
    }
  }, [user, loading, router]);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/admin/doctors');
      setDoctors(data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleApprove = async (doctorId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/admin/doctors/${doctorId}/approve`, {
        isApproved: newStatus
      });
      
      toast.success(newStatus ? 'Doctor approved!' : 'Doctor approval revoked');
      fetchDoctors(); // Refresh list
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast.error('Failed to update doctor status');
    }
  };

  const handleToggleStatus = async (doctorId) => {
    try {
      await api.put(`/admin/users/${doctorId}/toggle-status`);
      toast.success('Doctor status updated');
      fetchDoctors(); // Refresh list
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (doctorId) => {
    if (!confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${doctorId}`);
      toast.success('Doctor deleted successfully');
      fetchDoctors(); // Refresh list
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Failed to delete doctor');
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    if (filter === 'approved') return doctor.isApproved;
    if (filter === 'pending') return !doctor.isApproved;
    return true; // all
  });

  if (loading || loadingDoctors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Doctors</h1>
            <p className="text-gray-600 mt-2">
              {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All ({doctors.length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Approved ({doctors.filter(d => d.isApproved).length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending ({doctors.filter(d => !d.isApproved).length})
            </button>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consultation Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No doctors found
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <tr key={doctor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{doctor.name}</div>
                          <div className="text-sm text-gray-500">{doctor.email}</div>
                          <div className="text-sm text-gray-500">{doctor.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">
                          {doctor.specialization || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">
                          {doctor.experience ? `${doctor.experience} years` : 'Not specified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">
                          {doctor.consultationFee ? `$${doctor.consultationFee}` : 'Not set'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {doctor.isApproved ? (
                            <span className="badge badge-success">✓ Approved</span>
                          ) : (
                            <span className="badge badge-warning">⏳ Pending</span>
                          )}
                          {doctor.isActive ? (
                            <span className="badge badge-info">Active</span>
                          ) : (
                            <span className="badge badge-danger">Inactive</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-2">
                          {/* Approve/Revoke Button */}
                          <button
                            onClick={() => handleApprove(doctor._id, doctor.isApproved)}
                            className={`px-3 py-1 rounded ${
                              doctor.isApproved
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {doctor.isApproved ? 'Revoke' : 'Approve'}
                          </button>

                          {/* Activate/Deactivate Button */}
                          <button
                            onClick={() => handleToggleStatus(doctor._id)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                          >
                            {doctor.isActive ? 'Deactivate' : 'Activate'}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(doctor._id)}
                            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}