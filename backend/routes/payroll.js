const express = require('express');
const router = express.Router();
const { authenticateToken, isAdminOrHR } = require('../middleware/auth');
const {
    getMySalary,
    getEmployeeSalary,
    updateSalaryStructure,
    generatePayroll,
    getPayslip,
    getAllPayrolls,
    getMyPayrolls
} = require('../controllers/payrollController');

// All routes require authentication
router.use(authenticateToken);

// Employee routes
router.get('/my-salary', getMySalary);
router.get('/my-payrolls', getMyPayrolls);
router.get('/slip/:id', getPayslip);

// Admin/HR routes
router.get('/all', isAdminOrHR, getAllPayrolls);
router.get('/employee/:id', isAdminOrHR, getEmployeeSalary);
router.put('/employee/:id', isAdminOrHR, updateSalaryStructure);
router.post('/generate', isAdminOrHR, generatePayroll);

module.exports = router;
