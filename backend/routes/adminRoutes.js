const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getAllPatients,
  approveDoctor,
  toggleUserStatus,
  getDashboardStats,
  deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authorization
router.use(protect, authorize('admin'));

router.get('/doctors', getAllDoctors);
router.get('/patients', getAllPatients);
router.put('/doctors/:id/approve', approveDoctor);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/stats', getDashboardStats);
router.delete('/users/:id', deleteUser);

module.exports = router;