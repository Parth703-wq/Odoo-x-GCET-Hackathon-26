const { pool } = require('../config/database');
const { calculateSalaryComponents } = require('../utils/salaryCalculator');

/**
 * Get my salary info
 */
const getMySalary = async (req, res) => {
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

        // Get salary structure
        const [salaryStructure] = await pool.query(
            'SELECT * FROM salary_structure WHERE employee_id = ? ORDER BY effective_from DESC LIMIT 1',
            [employeeId]
        );

        if (salaryStructure.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Salary structure not found'
            });
        }

        // Get salary components
        const [components] = await pool.query(
            'SELECT * FROM salary_components WHERE salary_structure_id = ?',
            [salaryStructure[0].id]
        );

        // Calculate salary
        const calculatedSalary = calculateSalaryComponents(salaryStructure[0].base_wage, components);

        res.status(200).json({
            success: true,
            data: {
                salaryStructure: salaryStructure[0],
                ...calculatedSalary
            }
        });

    } catch (error) {
        console.error('Get my salary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching salary information',
            error: error.message
        });
    }
};

/**
 * Get employee salary (Admin/HR)
 */
const getEmployeeSalary = async (req, res) => {
    try {
        const { id } = req.params;

        // Get salary structure
        const [salaryStructure] = await pool.query(
            'SELECT * FROM salary_structure WHERE employee_id = ? ORDER BY effective_from DESC LIMIT 1',
            [id]
        );

        if (salaryStructure.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Salary structure not found'
            });
        }

        // Get salary components
        const [components] = await pool.query(
            'SELECT * FROM salary_components WHERE salary_structure_id = ?',
            [salaryStructure[0].id]
        );

        // Calculate salary
        const calculatedSalary = calculateSalaryComponents(salaryStructure[0].base_wage, components);

        res.status(200).json({
            success: true,
            data: {
                salaryStructure: salaryStructure[0],
                ...calculatedSalary
            }
        });

    } catch (error) {
        console.error('Get employee salary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching salary information',
            error: error.message
        });
    }
};

/**
 * Update salary structure (Admin/HR)
 */
const updateSalaryStructure = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { wageType, baseWage, currency, effectiveFrom, components } = req.body;

        // Check if employee exists
        const [employees] = await connection.query(
            'SELECT id FROM employees WHERE id = ?',
            [id]
        );

        if (employees.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Create new salary structure
        const [salaryResult] = await connection.query(
            `INSERT INTO salary_structure (employee_id, wage_type, base_wage, currency, effective_from)
             VALUES (?, ?, ?, ?, ?)`,
            [id, wageType || 'FIXED', baseWage, currency || 'INR', effectiveFrom || new Date()]
        );

        const salaryStructureId = salaryResult.insertId;

        // Add salary components
        if (components && components.length > 0) {
            for (const component of components) {
                await connection.query(
                    `INSERT INTO salary_components (salary_structure_id, component_name, computation_type, value)
                     VALUES (?, ?, ?, ?)`,
                    [salaryStructureId, component.name, component.computationType || 'PERCENTAGE', component.value]
                );
            }
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Salary structure updated successfully'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Update salary structure error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating salary structure',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

/**
 * Generate monthly payroll (Admin/HR)
 */
const generatePayroll = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { companyId } = req.user;
        const { month, year } = req.body;

        // Get all employees in the company with their salary
        const [employees] = await connection.query(
            `SELECT e.id, e.salary, e.user_id FROM employees e
             INNER JOIN users u ON e.user_id = u.id
             WHERE u.company_id = ? AND e.salary IS NOT NULL AND e.salary > 0`,
            [companyId]
        );

        let generatedCount = 0;

        for (const employee of employees) {
            const baseSalary = parseFloat(employee.salary) || 0;

            // Simple calculation: 10% allowances, 5% deductions
            const allowances = baseSalary * 0.10;
            const deductions = baseSalary * 0.05;
            const grossSalary = baseSalary + allowances;
            const netSalary = grossSalary - deductions;

            // Get attendance for the month
            const [attendance] = await connection.query(
                `SELECT COUNT(*) as present_days FROM attendance 
                 WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ? AND status = 'PRESENT'`,
                [employee.id, month, year]
            );

            const payableDays = attendance[0].present_days || 0;

            // Check if payroll already exists
            const [existing] = await connection.query(
                'SELECT id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?',
                [employee.id, month, year]
            );

            if (existing.length > 0) {
                // Update existing
                await connection.query(
                    `UPDATE payroll 
                     SET base_amount = ?, total_allowances = ?, total_deductions = ?, 
                         gross_salary = ?, net_salary = ?, payable_days = ?, payment_status = 'PENDING'
                     WHERE id = ?`,
                    [baseSalary, allowances, deductions, grossSalary, netSalary, payableDays, existing[0].id]
                );
            } else {
                // Create new
                await connection.query(
                    `INSERT INTO payroll (
                        employee_id, month, year, base_amount, total_allowances, total_deductions,
                        gross_salary, net_salary, payable_days, payment_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
                    [employee.id, month, year, baseSalary, allowances, deductions, grossSalary, netSalary, payableDays]
                );
            }

            generatedCount++;
        }

        await connection.commit();

        res.status(200).json({
            success: true,
            message: `Payroll generated for ${generatedCount} employees`
        });

    } catch (error) {
        await connection.rollback();
        console.error('Generate payroll error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating payroll',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

/**
 * Get payslip
 */
const getPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        const [payroll] = await pool.query(
            `SELECT p.*, e.first_name, e.last_name, e.department, e.designation,
                    u.employee_id, u.email
             FROM payroll p
             INNER JOIN employees e ON p.employee_id = e.id
             INNER JOIN users u ON e.user_id = u.id
             WHERE p.id = ?`,
            [id]
        );

        if (payroll.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payslip not found'
            });
        }

        // Check if user has permission
        if (role === 'EMPLOYEE' && payroll[0].user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: payroll[0]
        });

    } catch (error) {
        console.error('Get payslip error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payslip',
            error: error.message
        });
    }
};

/**
 * Get all payrolls (Admin/HR)
 */
const getAllPayrolls = async (req, res) => {
    try {
        const { companyId } = req.user;

        const [payrolls] = await pool.query(
            `SELECT p.*, e.first_name, e.last_name, e.department, u.employee_id
             FROM payroll p
             INNER JOIN employees e ON p.employee_id = e.id
             INNER JOIN users u ON e.user_id = u.id
             WHERE u.company_id = ?
             ORDER BY p.year DESC, p.month DESC, e.first_name`,
            [companyId]
        );

        res.status(200).json({
            success: true,
            data: payrolls
        });

    } catch (error) {
        console.error('Get all payrolls error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payrolls',
            error: error.message
        });
    }
};

/**
 * Get my payrolls (Employee)
 */
const getMyPayrolls = async (req, res) => {
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

        const [payrolls] = await pool.query(
            `SELECT * FROM payroll 
             WHERE employee_id = ?
             ORDER BY year DESC, month DESC`,
            [employeeId]
        );

        res.status(200).json({
            success: true,
            data: payrolls
        });

    } catch (error) {
        console.error('Get my payrolls error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payrolls',
            error: error.message
        });
    }
};

module.exports = {
    getMySalary,
    getEmployeeSalary,
    updateSalaryStructure,
    generatePayroll,
    getPayslip,
    getAllPayrolls,
    getMyPayrolls
};
