const User = require('../models/User');

// @desc    Get all approved doctors (public)
// @route   GET /api/doctors
// @access  Public
exports.getAllApprovedDoctors = async (req, res) => {
  try {
    let query = { role: 'doctor', isApproved: true, isActive: true };

    // Filter by specialization if provided
    if (req.query.specialization) {
      query.specialization = { $regex: req.query.specialization, $options: 'i' };
    }

    const doctors = await User.find(query)
      .select('-password')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
      isApproved: true
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get unique specializations
// @route   GET /api/doctors/specializations
// @access  Public
exports.getSpecializations = async (req, res) => {
  try {
    const specializations = await User.distinct('specialization', {
      role: 'doctor',
      isApproved: true,
      specialization: { $ne: null, $ne: '' }
    });

    res.status(200).json({
      success: true,
      data: specializations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};