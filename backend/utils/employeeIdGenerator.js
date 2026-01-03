/**
 * Generate Employee ID in the format:
 * [CompanyInitials][FirstName][LastName][Year][SerialNumber]
 * 
 * Example: OIJODO2022001
 * - OI = Odeo India (Company Name)
 * - JODO = John Doe (Employee Name)
 * - 2022 = Year of Joining
 * - 001 = Serial Number
 */

const { pool } = require('../config/database');

const generateEmployeeId = async (companyName, firstName, lastName, year) => {
    try {
        // Extract company initials (first letter of each word)
        const companyInitials = companyName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');

        // Extract first 2 letters of first name and last name
        const firstNamePart = firstName.substring(0, 2).toUpperCase();
        const lastNamePart = lastName.substring(0, 2).toUpperCase();

        // Get the current year if not provided
        const joiningYear = year || new Date().getFullYear();

        // Get the last employee ID for this year to generate serial number
        const [rows] = await pool.query(
            `SELECT employee_id FROM users 
             WHERE employee_id LIKE ? 
             ORDER BY employee_id DESC LIMIT 1`,
            [`${companyInitials}${firstNamePart}${lastNamePart}${joiningYear}%`]
        );

        let serialNumber = 1;
        if (rows.length > 0) {
            // Extract the last serial number and increment
            const lastId = rows[0].employee_id;
            const lastSerial = parseInt(lastId.slice(-3));
            serialNumber = lastSerial + 1;
        }

        // Format serial number with leading zeros (001, 002, etc.)
        const formattedSerial = serialNumber.toString().padStart(3, '0');

        // Construct the employee ID
        const employeeId = `${companyInitials}${firstNamePart}${lastNamePart}${joiningYear}${formattedSerial}`;

        return employeeId;
    } catch (error) {
        console.error('Error generating employee ID:', error);
        throw error;
    }
};

module.exports = { generateEmployeeId };
