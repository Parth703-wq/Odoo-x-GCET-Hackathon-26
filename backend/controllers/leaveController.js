const { pool } = require('../config/database');

/**
 * Apply for leave
 */
const applyLeave = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { userId } = req.user;
        const { leaveTypeId, startDate, endDate, reason, attachment } = req.body;

        // Get employee ID
        const [employees] = await connection.query(
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

        // Calculate total days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Check leave balance
        const currentYear = new Date().getFullYear();
        const [balance] = await connection.query(
            'SELECT available_days FROM leave_balance WHERE employee_id = ? AND leave_type_id = ? AND year = ?',
            [employeeId, leaveTypeId, currentYear]
        );

        if (balance.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Leave balance not found'
            });
        }

        if (balance[0].available_days < totalDays) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Insufficient leave balance. Available: ${balance[0].available_days} days`
            });
        }

        // Create leave request
        await connection.query(
            `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, attachment, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [employeeId, leaveTypeId, startDate, endDate, totalDays, reason, attachment]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Apply leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Error applying for leave',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

/**
 * Get my leave requests
 */
const getMyLeaveRequests = async (req, res) => {
    try {
        const { userId } = req.user;

        const [leaves] = await pool.query(
            `SELECT lr.*, lt.leave_name, lt.is_paid,
                    u.employee_id as approved_by_id, e2.first_name as approver_first_name, e2.last_name as approver_last_name
             FROM leave_requests lr
             INNER JOIN employees e ON lr.employee_id = e.id
             INNER JOIN leave_types lt ON lr.leave_type_id = lt.id
             LEFT JOIN users u ON lr.approved_by = u.id
             LEFT JOIN employees e2 ON u.id = e2.user_id
             WHERE e.user_id = ?
             ORDER BY lr.created_at DESC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            data: leaves
        });

    } catch (error) {
        console.error('Get my leave requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave requests',
            error: error.message
        });
    }
};

/**
 * Get all leave requests (Admin/HR)
 */
const getAllLeaveRequests = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { status } = req.query;

        let query = `
            SELECT lr.*, lt.leave_name, lt.is_paid,
                   e.first_name, e.last_name, e.department, e.designation,
                   u.employee_id,
                   approver.employee_id as approved_by_id, 
                   e2.first_name as approver_first_name, e2.last_name as approver_last_name
            FROM leave_requests lr
            INNER JOIN employees e ON lr.employee_id = e.id
            INNER JOIN users u ON e.user_id = u.id
            INNER JOIN leave_types lt ON lr.leave_type_id = lt.id
            LEFT JOIN users approver ON lr.approved_by = approver.id
            LEFT JOIN employees e2 ON approver.id = e2.user_id
            WHERE u.company_id = ?
        `;

        let params = [companyId];

        if (status) {
            query += ' AND lr.status = ?';
            params.push(status);
        }

        query += ' ORDER BY lr.created_at DESC';

        const [leaves] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: leaves
        });

    } catch (error) {
        console.error('Get all leave requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave requests',
            error: error.message
        });
    }
};

/**
 * Approve leave (Admin/HR)
 */
const approveLeave = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { userId } = req.user;
        const { comments } = req.body;

        // Get leave request details
        const [leaves] = await connection.query(
            'SELECT * FROM leave_requests WHERE id = ?',
            [id]
        );

        if (leaves.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        const leave = leaves[0];

        if (leave.status !== 'PENDING') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Leave request already processed'
            });
        }

        // Update leave request
        await connection.query(
            `UPDATE leave_requests 
             SET status = 'APPROVED', approved_by = ?, approval_date = NOW(), admin_comments = ?
             WHERE id = ?`,
            [userId, comments, id]
        );

        // Update leave balance
        const currentYear = new Date().getFullYear();
        await connection.query(
            `UPDATE leave_balance 
             SET used_days = used_days + ?, available_days = available_days - ?
             WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
            [leave.total_days, leave.total_days, leave.employee_id, leave.leave_type_id, currentYear]
        );

        // Mark attendance as LEAVE for the leave period
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dateStr = date.toISOString().split('T')[0];

            await connection.query(
                `INSERT INTO attendance (employee_id, date, status) 
                 VALUES (?, ?, 'LEAVE')
                 ON DUPLICATE KEY UPDATE status = 'LEAVE'`,
                [leave.employee_id, dateStr]
            );
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: 'Leave approved successfully'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Approve leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving leave',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

/**
 * Reject leave (Admin/HR)
 */
const rejectLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const { comments } = req.body;

        // Check if leave request exists
        const [leaves] = await pool.query(
            'SELECT status FROM leave_requests WHERE id = ?',
            [id]
        );

        if (leaves.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        if (leaves[0].status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Leave request already processed'
            });
        }

        // Update leave request
        await pool.query(
            `UPDATE leave_requests 
             SET status = 'REJECTED', approved_by = ?, approval_date = NOW(), admin_comments = ?
             WHERE id = ?`,
            [userId, comments, id]
        );

        res.status(200).json({
            success: true,
            message: 'Leave rejected successfully'
        });

    } catch (error) {
        console.error('Reject leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting leave',
            error: error.message
        });
    }
};

/**
 * Get leave balance
 */
const getLeaveBalance = async (req, res) => {
    try {
        const { userId } = req.user;

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
        const currentYear = new Date().getFullYear();

        const [balance] = await pool.query(
            `SELECT lb.*, lt.leave_name, lt.is_paid
             FROM leave_balance lb
             INNER JOIN leave_types lt ON lb.leave_type_id = lt.id
             WHERE lb.employee_id = ? AND lb.year = ?`,
            [employeeId, currentYear]
        );

        res.status(200).json({
            success: true,
            data: balance
        });

    } catch (error) {
        console.error('Get leave balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave balance',
            error: error.message
        });
    }
};

module.exports = {
    applyLeave,
    getMyLeaveRequests,
    getAllLeaveRequests,
    approveLeave,
    rejectLeave,
    getLeaveBalance
};
