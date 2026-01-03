const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { generateEmployeeId } = require('../utils/employeeIdGenerator');
require('dotenv').config();

/**
 * Sign Up - Register new company with admin user
 */
const signUp = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            companyName,
            companyLogo,
            firstName,
            lastName,
            email,
            phone,
            password,
            dateOfJoining
        } = req.body;

        // Validate required fields
        if (!companyName || !firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
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

        // Create company
        const [companyResult] = await connection.query(
            'INSERT INTO companies (company_name, company_logo) VALUES (?, ?)',
            [companyName, companyLogo || null]
        );

        const companyId = companyResult.insertId;

        // Generate employee ID
        const joiningYear = dateOfJoining ? new Date(dateOfJoining).getFullYear() : new Date().getFullYear();
        const employeeId = await generateEmployeeId(companyName, firstName, lastName, joiningYear);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (Admin role for first user)
        const [userResult] = await connection.query(
            `INSERT INTO users (employee_id, email, password_hash, role, company_id, is_verified) 
             VALUES (?, ?, ?, 'ADMIN', ?, true)`,
            [employeeId, email, hashedPassword, companyId]
        );

        const userId = userResult.insertId;

        // Create employee profile
        await connection.query(
            `INSERT INTO employees (user_id, first_name, last_name, phone, date_of_joining) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, firstName, lastName, phone || null, dateOfJoining || new Date()]
        );

        // Create default leave types for the company
        const defaultLeaveTypes = [
            { name: 'Paid Time Off', days: 24, isPaid: true },
            { name: 'Sick Leave', days: 7, isPaid: true },
            { name: 'Unpaid Leave', days: 0, isPaid: false }
        ];

        for (const leaveType of defaultLeaveTypes) {
            await connection.query(
                'INSERT INTO leave_types (company_id, leave_name, total_days, is_paid) VALUES (?, ?, ?, ?)',
                [companyId, leaveType.name, leaveType.days, leaveType.isPaid]
            );
        }

        await connection.commit();

        // Generate JWT token
        const token = jwt.sign(
            { userId, employeeId, email, role: 'ADMIN', companyId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: 'Company and admin account created successfully',
            data: {
                token,
                user: {
                    userId,
                    employeeId,
                    email,
                    role: 'ADMIN',
                    companyId,
                    companyName,
                    firstName,
                    lastName
                }
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Sign up error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating account',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

/**
 * Sign In - User login
 */
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const [users] = await pool.query(
            `SELECT u.*, e.first_name, e.last_name, c.company_name 
             FROM users u
             LEFT JOIN employees e ON u.id = e.user_id
             LEFT JOIN companies c ON u.company_id = c.id
             WHERE u.email = ? AND u.is_active = true`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                employeeId: user.employee_id,
                email: user.email,
                role: user.role,
                companyId: user.company_id
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    userId: user.id,
                    employeeId: user.employee_id,
                    email: user.email,
                    role: user.role,
                    companyId: user.company_id,
                    companyName: user.company_name,
                    firstName: user.first_name,
                    lastName: user.last_name
                }
            }
        });

    } catch (error) {
        console.error('Sign in error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
};

/**
 * Change Password
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Get user's current password
        const [users] = await pool.query(
            'SELECT password_hash FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
};

/**
 * Get Current User Info
 */
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [users] = await pool.query(
            `SELECT u.id, u.employee_id, u.email, u.role, u.company_id,
                    e.first_name, e.last_name, e.phone, e.profile_picture,
                    c.company_name, c.company_logo
             FROM users u
             LEFT JOIN employees e ON u.id = e.user_id
             LEFT JOIN companies c ON u.company_id = c.id
             WHERE u.id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
};

module.exports = {
    signUp,
    signIn,
    changePassword,
    getCurrentUser
};
