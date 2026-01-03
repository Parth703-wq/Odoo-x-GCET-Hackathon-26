const express = require('express');
const router = express.Router();
const { authenticateToken, isAdminOrHR } = require('../middleware/auth');
const {
    applyLeave,
    getMyLeaveRequests,
    getAllLeaveRequests,
    approveLeave,
    rejectLeave,
    getLeaveBalance
} = require('../controllers/leaveController');

// All routes require authentication
router.use(authenticateToken);

// Employee routes
router.post('/apply', applyLeave);
router.get('/my-requests', getMyLeaveRequests);
router.get('/balance', getLeaveBalance);

// Admin/HR routes
router.get('/all-requests', isAdminOrHR, getAllLeaveRequests);
router.put('/:id/approve', isAdminOrHR, approveLeave);
router.put('/:id/reject', isAdminOrHR, rejectLeave);

module.exports = router;
