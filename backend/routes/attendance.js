const express = require('express');
const router = express.Router();
const { authenticateToken, isAdminOrHR } = require('../middleware/auth');
const {
    checkIn,
    checkOut,
    getMyAttendance,
    getEmployeeAttendance,
    getDailyAttendance,
    updateAttendance
} = require('../controllers/attendanceController');

// All routes require authentication
router.use(authenticateToken);

// Employee routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my-attendance', getMyAttendance);

// Admin/HR routes
router.get('/employee/:id', isAdminOrHR, getEmployeeAttendance);
router.get('/daily', isAdminOrHR, getDailyAttendance);
router.put('/:id', isAdminOrHR, updateAttendance);

module.exports = router;
