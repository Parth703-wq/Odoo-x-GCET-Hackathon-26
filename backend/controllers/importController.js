const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Import employees from CSV/Excel
 */
const importEmployees = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { companyId, userId } = req.user;
        const employees = req.body.employees; // Array of employee objects from parsed file

        if (!employees || !Array.isArray(employees) || employees.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No employee data provided'
            });
        }

        const results = {
            success: [],
            failed: []
        };

        for (const emp of employees) {
            try {
                // Validate required fields
                if (!emp.firstName || !emp.lastName || !emp.email) {
                    results.failed.push({
                        email: emp.email || 'Unknown',
                        reason: 'Missing required fields (firstName, lastName, email)'
                    });
                    continue;
                }

                // Check if user already exists
                const [existing] = await connection.query(
                    'SELECT id FROM users WHERE email = ?',
                    [emp.email]
                );

                if (existing.length > 0) {
                    results.failed.push({
                        email: emp.email,
                        reason: 'Email already exists'
                    });
                    continue;
                }

                // Generate employee ID
                const [count] = await connection.query(
                    'SELECT COUNT(*) as total FROM users WHERE company_id = ?',
                    [companyId]
                );
                const employeeId = `EMP${String(count[0].total + 1).padStart(4, '0')}`;

                // Hash default password (email or 'password123')
                const defaultPassword = emp.password || 'password123';
                const hashedPassword = await bcrypt.hash(defaultPassword, 10);

                // Create user
                const [userResult] = await connection.query(
                    `INSERT INTO users (employee_id, email, password, company_id, role, first_name, last_name)
                     VALUES (?, ?, ?, ?, 'EMPLOYEE', ?, ?)`,
                    [employeeId, emp.email, hashedPassword, companyId, emp.firstName, emp.lastName]
                );

                const newUserId = userResult.insertId;

                // Create employee profile
                await connection.query(
                    `INSERT INTO employees (user_id, first_name, last_name, email, phone, department, designation, 
                     date_of_joining, salary, address, city, state, pin_code, emergency_contact)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        newUserId,
                        emp.firstName,
                        emp.lastName,
                        emp.email,
                        emp.phone || null,
                        emp.department || null,
                        emp.designation || null,
                        emp.dateOfJoining || new Date(),
                        emp.salary || null,
                        emp.address || null,
                        emp.city || null,
                        emp.state || null,
                        emp.pinCode || null,
                        emp.emergencyContact || null
                    ]
                );

                results.success.push({
                    email: emp.email,
                    employeeId: employeeId,
                    name: `${emp.firstName} ${emp.lastName}`
                });

            } catch (error) {
                results.failed.push({
                    email: emp.email,
                    reason: error.message
                });
            }
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: `Import completed: ${results.success.length} successful, ${results.failed.length} failed`,
            data: results
        });

    } catch (error) {
        await connection.rollback();
        console.error('Import employees error:', error);
        res.status(500).json({
            success: false,
            message: 'Error importing employees',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    importEmployees
};
