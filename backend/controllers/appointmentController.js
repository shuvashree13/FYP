const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
exports.createAppointment = async (req, res) => {
  try {
    const { doctor, date, timeSlot, reason } = req.body;

    // Check if doctor exists and is approved
    const doctorUser = await User.findById(doctor);
    
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (!doctorUser.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is not approved yet'
      });
    }

    // Check if appointment slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctor,
      date,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date,
      timeSlot,
      reason
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name email specialization consultationFee avatar');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all appointments (filtered by role)
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }
    // Admin can see all appointments (no filter)

    // Additional filters from query params
    if (req.query.status) {
      query.status = req.query.status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone age gender bloodGroup avatar')
      .populate('doctor', 'name email specialization consultationFee avatar')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone age gender bloodGroup address avatar')
      .populate('doctor', 'name email specialization qualification experience consultationFee phone email avatar');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        appointment.patient._id.toString() !== req.user._id.toString() &&
        appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor/Admin)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, prescription, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Authorization check
    if (req.user.role === 'doctor' && 
        appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    appointment.status = status || appointment.status;
    appointment.prescription = prescription || appointment.prescription;
    appointment.notes = notes || appointment.notes;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name email specialization avatar');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization - patient or doctor can cancel
    if (appointment.patient.toString() !== req.user._id.toString() &&
        appointment.doctor.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed appointment'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelReason = cancelReason;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};