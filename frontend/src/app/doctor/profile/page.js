'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import DoctorLayout from '../../../components/DoctorLayout';
import toast from 'react-hot-toast';
import ICONS from '../../../constants/icons';

export default function DoctorProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    availability: [],
    avatar: null
  });

  const [newAvailability, setNewAvailability] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00'
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'doctor') {
        router.push('/');
      } else {
        // Load user data into form
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          specialization: user.specialization || '',
          qualification: user.qualification || '',
          experience: user.experience || '',
          consultationFee: user.consultationFee || '',
          availability: user.availability || [],
          avatar: null
        });
        // Set avatar preview if user has one
        if (user.avatar) {
          setAvatarPreview(user.avatar);
        }
      }
    }
  }, [user, loading, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData({
          ...formData,
          avatar: reader.result // Store base64 string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAvailability = () => {
    // Check if day already exists
    const dayExists = formData.availability.some(
      slot => slot.day === newAvailability.day
    );

    if (dayExists) {
      toast.error('This day is already added!');
      return;
    }

    setFormData({
      ...formData,
      availability: [...formData.availability, { ...newAvailability }]
    });

    // Reset form
    setNewAvailability({
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00'
    });

    toast.success('Availability added!');
  };

  const handleRemoveAvailability = (index) => {
    const newAvailabilityList = formData.availability.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      availability: newAvailabilityList
    });
    toast.success('Availability removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { data } = await api.put('/auth/profile', formData);
      updateUser(data.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBlue">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'doctor') {
    return null;
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <DoctorLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
          <p className="text-gray-600 mt-2">Manage your professional information</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <div className="text-center mb-6">
                {/* Avatar Display */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Doctor Avatar" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-4xl">
                      {ICONS.DOCTOR}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">Dr. {user.name}</h2>
                <p className="text-gray-600">{user.specialization || 'Specialist'}</p>
                <div className="mt-4">
                  {user.isApproved ? (
                    <span className="badge badge-success">{ICONS.CHECK} Approved</span>
                  ) : (
                    <span className="badge badge-warning">{ICONS.PENDING} Pending Approval</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium">
                    {user.experience ? `${user.experience} years` : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-medium">
                    {user.consultationFee || 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Picture</h2>
                
                <div className="flex items-center gap-6">
                  {/* Current Avatar */}
                  <div className="flex-shrink-0">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar Preview" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-4xl">
                        {ICONS.DOCTOR}
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary file:text-white
                        hover:file:bg-primary-dark
                        file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG or GIF (max. 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      className="input-field bg-gray-100"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="e.g., Cardiologist, Pediatrician"
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Details</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualification
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="e.g., MBBS, MD"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g., 5"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultation Fee
                    </label>
                    <input
                      type="number"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      min="0"
                      placeholder="e.g., 1000"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Availability Schedule */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability Schedule</h2>
                
                {/* Current Availability */}
                {formData.availability.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Schedule:</p>
                    <div className="space-y-2">
                      {formData.availability.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{slot.day}</span>
                            <span className="text-gray-600 ml-3">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAvailability(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Availability */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Add Availability:</p>
                  <div className="grid md:grid-cols-4 gap-3">
                    <select
                      value={newAvailability.day}
                      onChange={(e) => setNewAvailability({...newAvailability, day: e.target.value})}
                      className="input-field"
                    >
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>

                    <input
                      type="time"
                      value={newAvailability.startTime}
                      onChange={(e) => setNewAvailability({...newAvailability, startTime: e.target.value})}
                      className="input-field"
                    />

                    <input
                      type="time"
                      value={newAvailability.endTime}
                      onChange={(e) => setNewAvailability({...newAvailability, endTime: e.target.value})}
                      className="input-field"
                    />

                    <button
                      type="button"
                      onClick={handleAddAvailability}
                      className="btn-primary"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/doctor/dashboard')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}