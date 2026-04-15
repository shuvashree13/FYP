const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,  
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Let frontend handle this check
    // if (user.role === 'doctor' && !user.isApproved) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Your account is pending approval from admin'
    //   });
    // }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,  
        avatar: user.avatar,           
        phone: user.phone,             
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone
    };

    // Only update avatar if it's provided and not null
    if (req.body.avatar && req.body.avatar !== null && req.body.avatar !== 'null') {
      fieldsToUpdate.avatar = req.body.avatar;
      console.log('[AVATAR] Avatar being saved - Length:', req.body.avatar.length);
    } else {
      console.log('[AVATAR] No avatar in request');
    }

    if (req.user.role === 'patient') {
      fieldsToUpdate.age = req.body.age;
      fieldsToUpdate.gender = req.body.gender;
      fieldsToUpdate.bloodGroup = req.body.bloodGroup;
      fieldsToUpdate.address = req.body.address;
    }

    if (req.user.role === 'doctor') {
      fieldsToUpdate.specialization = req.body.specialization;
      fieldsToUpdate.qualification = req.body.qualification;
      fieldsToUpdate.experience = req.body.experience;
      fieldsToUpdate.consultationFee = req.body.consultationFee;
      fieldsToUpdate.availability = req.body.availability;
    }

    console.log('[PROFILE] Updating user with fields:', Object.keys(fieldsToUpdate));

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        returnDocument: 'after',
        runValidators: true
      }
    );

    console.log('[PROFILE] User updated. Has avatar:', !!user.avatar);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};