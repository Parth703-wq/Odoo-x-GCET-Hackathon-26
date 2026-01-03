const { pool } = require('../config/database');

/**
 * Check In
 */
const checkIn = async (req, res) => {
    try {
        const { userId } = req.user;
        const today = new Date().toISOString().split('T')[0];

        // Get employee ID
        const [employees] = await pool.query(
            'SELECT id FROM employees WHERE user_id = ?',
            [userId]
        );

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee profile not found'
            });
        }

        const employeeId = employees[0].id;

        // Check if already checked in today
        const [existing] = await pool.query(
            'SELECT id, check_in FROM attendance WHERE employee_id = ? AND date = ?',
            [employeeId, today]
        );

        if (existing.length > 0 && existing[0].check_in) {
            return res.status(400).json({
                success: false,
                message: 'Already checked in today'
            });
        }

        const checkInTime = new Date().toTimeString().split(' ')[0];

        if (existing.length > 0) {
            // Update existing record
            await pool.query(
                'UPDATE attendance SET check_in = ?, status = ? WHERE id = ?',
                [checkInTime, 'PRESENT', existing[0].id]
            );
        } else {
            // Create new record
            await pool.query(
                'INSERT INTO attendance (employee_id, date, check_in, status) VALUES (?, ?, ?, ?)',
                [employeeId, today, checkInTime, 'PRESENT']
            );
        }

        res.status(200).json({
            success: true,
            message: 'Checked in successfully',
            data: { checkInTime }
        });

    } catch (error) {
        console.error('Check in error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking in',
            error: error.message
        });
    }
};

/**
 * Check Out
 */
const checkOut = async (req, res) => {
    try {
        const { userId } = req.user;
        const today = new Date().toISOString().split('T')[0];

        // Get employee ID
        const [employees] = await pool.query(
            'SELECT id FROM employees WHERE user_id = ?',
            [userId]
        );

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee profile not found'
            });
        }

        const employeeId = employees[0].id;

        // Get today's attendance
        const [attendance] = await pool.query(
            'SELECT id, check_in, check_out FROM attendance WHERE employee_id = ? AND date = ?',
            [employeeId, today]
        );

        if (attendance.length === 0 || !attendance[0].check_in) {
            return res.status(400).json({
                success: false,
                message: 'Please check in first'
            });
        }

        if (attendance[0].check_out) {
            return res.status(400).json({
                success: false,
                message: 'Already checked out today'
            });
        }

        const checkOutTime = new Date().toTimeString().split(' ')[0];

        // Calculate work hours
        const checkIn = new Date(`1970-01-01T${attendance[0].check_in}`);
        const checkOut = new Date(`1970-01-01T${checkOutTime}`);
        const workHours = ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2);

        // Calculate extra hours (assuming 8 hours is standard)
        const extraHours = Math.max(0, workHours - 8).toFixed(2);

        await pool.query(
            'UPDATE attendance SET check_out = ?, work_hours = ?, extra_hours = ? WHERE id = ?',
            [checkOutTime, workHours, extraHours, attendance[0].id]
        );

        res.status(200).json({
            success: true,
            message: 'Checked out successfully',
            data: { checkOutTime, workHours, extraHours }
        });

    } catch (error) {
        console.error('Check out error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking out',
            error: error.message
        });
    }
};

/**
 * Get my attendance
 */
const getMyAttendance = async (req, res) => {
    try {
        const { userId } = req.user;
        const { startDate, endDate } = req.query;

        // Get employee ID
        const [employees] = await pool.query(
            'SELECT id FROM employees WHERE user_id = ?',
            [userId]
        );

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee profile not found'
            });
        }

        const employeeId = employees[0].id;

        let query = 'SELECT * FROM attendance WHERE employee_id = ?';
        let params = [employeeId];

        if (startDate && endDate) {
            query += ' AND date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' ORDER BY date DESC';

        const [attendance] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: attendance
        });

    } catch (error) {
        console.error('Get my attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance',
            error: error.message
        });
    }
};

/**
 * Get employee attendance (Admin/HR)
 */
const getEmployeeAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        let query = 'SELECT * FROM attendance WHERE employee_id = ?';
        let params = [id];

        if (startDate && endDate) {
            query += ' AND date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' ORDER BY date DESC';

        const [attendance] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: attendance
        });

    } catch (error) {
        console.error('Get employee attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance',
            error: error.message
        });
    }
};

/**
 * Get daily attendance (Admin/HR)
 */
const getDailyAttendance = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const [attendance] = await pool.query(
            `SELECT a.*, e.first_name, e.last_name, e.department, e.designation, u.employee_id
             FROM attendance a
             INNER JOIN employees e ON a.employee_id = e.id
             INNER JOIN users u ON e.user_id = u.id
             WHERE u.company_id = ? AND a.date = ?
             ORDER BY e.first_name, e.last_name`,
            [companyId, targetDate]
        );

        res.status(200).json({
            success: true,
            data: attendance
        });

    } catch (error) {
        console.error('Get daily attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching daily attendance',
            error: error.message
        });
    }
};

/**
 * Update attendance (Admin/HR)
 */
const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut, status } = req.body;

        let updateFields = [];
        let updateValues = [];

        if (checkIn) { updateFields.push('check_in = ?'); updateValues.push(checkIn); }
        if (checkOut) { updateFields.push('check_out = ?'); updateValues.push(checkOut); }
        if (status) { updateFields.push('status = ?'); updateValues.push(status); }

        // Recalculate work hours if both check in and out are provided
        if (checkIn && checkOut) {
            const checkInTime = new Date(`1970-01-01T${checkIn}`);
            const checkOutTime = new Date(`1970-01-01T${checkOut}`);
            const workHours = ((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2);
            const extraHours = Math.max(0, workHours - 8).toFixed(2);

            updateFields.push('work_hours = ?', 'extra_hours = ?');
            updateValues.push(workHours, extraHours);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(id);

        await pool.query(
            `UPDATE attendance SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        res.status(200).json({
            success: true,
            message: 'Attendance updated successfully'
        });

    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating attendance',
            error: error.message
        });
    }
};

/**
 * Get live employee status (Admin/HR)
 */
const getLiveEmployeeStatus = async (req, res) => {
    try {
        const { companyId } = req.user;
        const today = new Date().toISOString().split('T')[0];

        const [employees] = await pool.query(
            `SELECT e.id, e.first_name, e.last_name, e.department, u.employee_id,
                    a.check_in, a.check_out, a.date
             FROM employees e
             INNER JOIN users u ON e.user_id = u.id
             LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = ?
             WHERE u.company_id = ? AND u.role = 'EMPLOYEE'
             ORDER BY e.first_name, e.last_name`,
            [today, companyId]
        );

        // Mark status as active if checked in and not checked out
        const employeeStatus = employees.map(emp => ({
            employeeId: emp.id,
            employeeNumber: emp.employee_id,
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department || 'N/A',
            status: emp.check_in && !emp.check_out ? 'active' : 'inactive',
            checkInTime: emp.check_in || null,
            checkOutTime: emp.check_out || null
        }));

        res.status(200).json({
            success: true,
            data: employeeStatus
        });

    } catch (error) {
        console.error('Get live employee status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching live employee status',
            error: error.message
        });
    }
};

module.exports = {
    checkIn,
    checkOut,
    getMyAttendance,
    getEmployeeAttendance,
    getDailyAttendance,
    updateAttendance,
    getLiveEmployeeStatus
};
