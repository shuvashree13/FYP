'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data } = await api.get('/auth/me');
        setUser(data.data);
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      
      // Check if user is a doctor and not approved
      if (data.data.role === 'doctor' && !data.data.isApproved) {
        // EXPLICITLY clear everything for unapproved doctors
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null); // Clear user state
        
        toast.success('Registration successful! Your account is pending admin approval. You will be notified once approved.');
        
        // Redirect to landing page with login button visible
        setTimeout(() => {
          router.push('/');
        }, 100);
        
        return { success: true, needsApproval: true };
      }
      
      // For patients and admins, proceed with normal registration
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      setUser(data.data);
      toast.success(data.message);
      
      // Role-based redirect after registration
      if (data.data.role === 'patient') {
        router.push('/'); // Patients go to landing page
      } else if (data.data.role === 'admin') {
        window.location.href = '/admin/dashboard'; // Force full page reload
      } else if (data.data.role === 'doctor') {
        window.location.href = '/doctor/dashboard'; // Force full page reload
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      
      // ===== DEBUGGING START =====
      console.log('===== LOGIN DEBUG =====');
      console.log('Full response data:', data);
      console.log('User data:', data.data);
      console.log('User role:', data.data.role);
      console.log('isApproved value:', data.data.isApproved);
      console.log('isApproved type:', typeof data.data.isApproved);
      console.log('Is doctor?', data.data.role === 'doctor');
      console.log('Not approved?', !data.data.isApproved);
      console.log('Will block login?', data.data.role === 'doctor' && !data.data.isApproved);
      console.log('=====================');
      // ===== DEBUGGING END =====
      
      // Check if user is a doctor and not approved
      if (data.data.role === 'doctor' && !data.data.isApproved) {
        console.log('❌ BLOCKING LOGIN: Doctor not approved');
        
        // EXPLICITLY clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        
        toast.error('Your account is pending admin approval. Please wait for verification.');
        return { success: false, message: 'Account pending approval' };
      }
      
      console.log('✅ ALLOWING LOGIN: Proceeding with login');
      
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      setUser(data.data);
      toast.success(data.message);
      
      // Role-based redirect after login
      if (data.data.role === 'patient') {
        console.log('Redirecting to: /');
        router.push('/'); // Patients go to landing page
      } else if (data.data.role === 'admin') {
        console.log('Redirecting to: /admin/dashboard');
        window.location.href = '/admin/dashboard'; // Force full page reload
      } else if (data.data.role === 'doctor') {
        console.log('Redirecting to: /doctor/dashboard');
        window.location.href = '/doctor/dashboard'; // Force full page reload
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ LOGIN ERROR:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};