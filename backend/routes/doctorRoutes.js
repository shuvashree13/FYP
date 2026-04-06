const express = require('express');
const router = express.Router();
const {
  getAllApprovedDoctors,
  getDoctorById,
  getSpecializations
} = require('../controllers/doctorController');

// Public routes
router.get('/specializations', getSpecializations);
router.get('/', getAllApprovedDoctors);
router.get('/:id', getDoctorById);

module.exports = router;