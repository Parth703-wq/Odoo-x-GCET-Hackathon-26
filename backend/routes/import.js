const express = require('express');
const router = express.Router();
const { authenticateToken, isAdminOrHR } = require('../middleware/auth');
const { importEmployees } = require('../controllers/importController');

// All routes require authentication and admin/HR role
router.use(authenticateToken);
router.use(isAdminOrHR);

// Import employees
router.post('/employees', importEmployees);

module.exports = router;
