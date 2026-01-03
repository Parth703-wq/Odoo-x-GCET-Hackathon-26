const express = require('express');
const router = express.Router();
const { authenticateToken, isAdminOrHR, isAdmin } = require('../middleware/auth');
const {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');

// All routes require authentication
router.use(authenticateToken);

// Create employee (Admin/HR only)
router.post('/', isAdminOrHR, createEmployee);

// Get all employees (role-based access)
router.get('/', getEmployees);

// Get employee by ID
router.get('/:id', getEmployeeById);

// Update employee
router.put('/:id', updateEmployee);

// Delete employee (Admin only)
router.delete('/:id', isAdmin, deleteEmployee);

module.exports = router;
