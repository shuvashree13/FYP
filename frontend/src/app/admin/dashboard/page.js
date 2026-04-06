'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import AdminLayout from '../../../components/AdminLayout';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      } else {
        fetchStats();
      }
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Appointments Card */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📅</div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {stats?.appointments.total || 0}
            </h3>
            <p className="text-gray-600">No of Appointments</p>
            <div className="mt-3 text-sm text-gray-500">
              <span className="text-yellow-600">⏳ {stats?.appointments.pending || 0} Pending</span>
              {' • '}
              <span className="text-green-600">✓ {stats?.appointments.completed || 0} Completed</span>
            </div>
          </div>

          {/* Doctors Card */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">👨‍⚕️</div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {stats?.doctors.total || 0}
            </h3>
            <p className="text-gray-600">No of Doctors</p>
            <div className="mt-3 text-sm text-gray-500">
              <span className="text-green-600">✓ {stats?.doctors.approved || 0} Approved</span>
              {' • '}
              <span className="text-orange-600">⏳ {stats?.doctors.pending || 0} Pending</span>
            </div>
          </div>

          {/* Patients Card */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">👥</div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {stats?.patients.total || 0}
            </h3>
            <p className="text-gray-600">No of Patients</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pending Doctors Card */}
          {stats?.doctors.pending > 0 && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ⚠️ Action Required
              </h3>
              <p className="text-gray-600 mb-4">
                You have {stats.doctors.pending} doctor{stats.doctors.pending > 1 ? 's' : ''} waiting for approval
              </p>
              <button
                onClick={() => router.push('/admin/doctors')}
                className="btn-primary"
              >
                Review Doctors
              </button>
            </div>
          )}

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📊 System Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold">
                  {(stats?.doctors.total || 0) + (stats?.patients.total || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Appointments</span>
                <span className="font-semibold">
                  {(stats?.appointments.pending || 0) + (stats?.appointments.confirmed || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed Today</span>
                <span className="font-semibold text-green-600">
                  {stats?.appointments.completed || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}