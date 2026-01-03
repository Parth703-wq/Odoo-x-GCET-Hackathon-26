const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { generateEmployeeId } = require('../utils/employeeIdGenerator');
const { generatePassword } = require('../utils/passwordGenerator');

/**
 * Create new employee (Admin/HR only)
 */
const createEmployee = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            maritalStatus,
            address,
            city,
            state,
            pinCode,
            emergencyContact,
            dateOfJoining,
            department,
            designation,
            employmentType,
            role
        } = req.body;

        const companyId = req.user.companyId;

        // Validate required fields
        if (!firstName || !lastName || !email || !dateOfJoining) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, email, and date of joining are required'
            });
        }

        // Check if email already exists
        const [existingUser] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Get company name for employee ID generation
        const [company] = await connection.query(
            'SELECT company_name FROM companies WHERE id = ?',
            [companyId]
        );

        const companyName = company[0].company_name;

        // Generate employee ID
        const joiningYear = new Date(dateOfJoining).getFullYear();
        const employeeId = await generateEmployeeId(companyName, firstName, lastName, joiningYear);

        // Generate random password
        const generatedPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        // Create user
        const [userResult] = await connection.query(
            `INSERT INTO users (employee_id, email, password_hash, role, company_id, is_verified) 
             VALUES (?, ?, ?, ?, ?, false)`,
            [employeeId, email, hashedPassword, role || 'EMPLOYEE', companyId]
        );

        const userId = userResult.insertId;

        // Create employee profile
        const [employeeResult] = await connection.query(
            `INSERT INTO employees (
                user_id, first_name, last_name, phone, date_of_birth, gender, 
                marital_status, address, city, state, pin_code, emergency_contact,
                date_of_joining, department, designation, employment_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, firstName, lastName, phone, dateOfBirth, gender,
                maritalStatus, address, city, state, pinCode, emergencyContact,
                dateOfJoining, department, designation, employmentType || 'Full-Time'
            ]
        );

        const employeeDbId = employeeResult.insertId;

        // Initialize leave balance for the employee
        const [leaveTypes] = await connection.query(
            'SELECT id, total_days FROM leave_types WHERE company_id = ?',
            [companyId]
        );

        const currentYear = new Date().getFullYear();
        for (const leaveType of leaveTypes) {
            await connection.query(
                `INSERT INTO leave_balance (employee_id, leave_type_id, total_allocated, used_days, available_days, year)
                 VALUES (?, ?, ?, 0, ?, ?)`,
                [employeeDbId, leaveType.id, leaveType.total_days, leaveType.total_days, currentYear]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: {
                employeeId,
                email,
                temporaryPassword: generatedPassword,
                firstName,
                lastName
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Create employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating employee',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

/**
 * Get all employees (Admin/HR) or self (Employee)
 */
const getEmployees = async (req, res) => {
    try {
        const { role, companyId, userId } = req.user;

        let query;
        let params;

        if (role === 'ADMIN' || role === 'HR') {
            // Admin/HR can see all employees in their company
            query = `
                SELECT u.id as user_id, u.employee_id, u.email, u.role, u.is_active,
                       e.id, e.first_name, e.last_name, e.phone, e.date_of_birth, 
                       e.gender, e.marital_status, e.address, e.city, e.state, e.pin_code,
                       e.emergency_contact, e.profile_picture, e.date_of_joining,
                       e.department, e.designation, e.employment_type
                FROM users u
                INNER JOIN employees e ON u.id = e.user_id
                WHERE u.company_id = ?
                ORDER BY e.first_name, e.last_name
            `;
            params = [companyId];
        } else {
            // Employee can only see their own data
            query = `
                SELECT u.id as user_id, u.employee_id, u.email, u.role, u.is_active,
                       e.id, e.first_name, e.last_name, e.phone, e.date_of_birth, 
                       e.gender, e.marital_status, e.address, e.city, e.state, e.pin_code,
                       e.emergency_contact, e.profile_picture, e.date_of_joining,
                       e.department, e.designation, e.employment_type
                FROM users u
                INNER JOIN employees e ON u.id = e.user_id
                WHERE u.id = ?
            `;
            params = [userId];
        }

        const [employees] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: employees
        });

    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
};

/**
 * Get employee by ID
 */
const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId, companyId } = req.user;

        const [employees] = await pool.query(
            `SELECT u.id as user_id, u.employee_id, u.email, u.role, u.is_active,
                    e.id, e.first_name, e.last_name, e.phone, e.date_of_birth, 
                    e.gender, e.marital_status, e.address, e.city, e.state, e.pin_code,
                    e.emergency_contact, e.profile_picture, e.date_of_joining,
                    e.department, e.designation, e.employment_type, e.created_at, e.updated_at
             FROM users u
             INNER JOIN employees e ON u.id = e.user_id
             WHERE e.id = ? AND u.company_id = ?`,
            [id, companyId]
        );

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const employee = employees[0];

        // Check if user has permission to view this employee
        if (role === 'EMPLOYEE' && employee.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: employee
        });

    } catch (error) {
        console.error('Get employee by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employee',
            error: error.message
        });
    }
};

/**
 * Update employee
 */
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId, companyId } = req.user;

        // Check if employee exists and belongs to the same company
        const [employees] = await pool.query(
            `SELECT e.*, u.id as user_id FROM employees e
             INNER JOIN users u ON e.user_id = u.id
             WHERE e.id = ? AND u.company_id = ?`,
            [id, companyId]
        );

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const employee = employees[0];

        // Check permissions
        if (role === 'EMPLOYEE' && employee.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const {
            firstName,
            lastName,
            phone,
            dateOfBirth,
            gender,
            maritalStatus,
            address,
            city,
            state,
            pinCode,
            emergencyContact,
            department,
            designation,
            employmentType
        } = req.body;

        // Employees can only update limited fields
        let updateFields = [];
        let updateValues = [];

        if (role === 'ADMIN' || role === 'HR') {
            // Admin/HR can update all fields
            if (firstName) { updateFields.push('first_name = ?'); updateValues.push(firstName); }
            if (lastName) { updateFields.push('last_name = ?'); updateValues.push(lastName); }
            if (phone) { updateFields.push('phone = ?'); updateValues.push(phone); }
            if (dateOfBirth) { updateFields.push('date_of_birth = ?'); updateValues.push(dateOfBirth); }
            if (gender) { updateFields.push('gender = ?'); updateValues.push(gender); }
            if (maritalStatus) { updateFields.push('marital_status = ?'); updateValues.push(maritalStatus); }
            if (address) { updateFields.push('address = ?'); updateValues.push(address); }
            if (city) { updateFields.push('city = ?'); updateValues.push(city); }
            if (state) { updateFields.push('state = ?'); updateValues.push(state); }
            if (pinCode) { updateFields.push('pin_code = ?'); updateValues.push(pinCode); }
            if (emergencyContact) { updateFields.push('emergency_contact = ?'); updateValues.push(emergencyContact); }
            if (department) { updateFields.push('department = ?'); updateValues.push(department); }
            if (designation) { updateFields.push('designation = ?'); updateValues.push(designation); }
            if (employmentType) { updateFields.push('employment_type = ?'); updateValues.push(employmentType); }
        } else {
            // Employees can only update limited fields
            if (phone) { updateFields.push('phone = ?'); updateValues.push(phone); }
            if (address) { updateFields.push('address = ?'); updateValues.push(address); }
            if (city) { updateFields.push('city = ?'); updateValues.push(city); }
            if (state) { updateFields.push('state = ?'); updateValues.push(state); }
            if (pinCode) { updateFields.push('pin_code = ?'); updateValues.push(pinCode); }
            if (emergencyContact) { updateFields.push('emergency_contact = ?'); updateValues.push(emergencyContact); }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(id);

        await pool.query(
            `UPDATE employees SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully'
        });

    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating employee',
            error: error.message
        });
    }
};

/**
 * Delete employee (Admin only)
 */
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { companyId } = req.user;

        // Check if employee exists
        const [employees] = await pool.query(
            `SELECT e.user_id FROM employees e
             INNER JOIN users u ON e.user_id = u.id
             WHERE e.id = ? AND u.company_id = ?`,
            [id, companyId]
        );

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Delete user (will cascade to employee and related records)
        await pool.query('DELETE FROM users WHERE id = ?', [employees[0].user_id]);

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully'
        });

    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
    }
};

module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};
