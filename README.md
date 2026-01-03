# Dayflow - Human Resource Management System

**Every workday, perfectly aligned.**

A full-stack HRMS application built with React, Node.js, Express, and MySQL.

## Features

✅ **Authentication & Authorization**
- Sign Up with auto-generated Employee IDs
- Sign In with JWT authentication
- Role-based access control (Admin, HR, Employee)

✅ **Employee Management**
- Create, view, update, and delete employees
- Profile management with multiple tabs
- Document upload support

✅ **Attendance Management**
- Check In/Check Out system
- Daily and weekly attendance views
- Work hours calculation
- Admin attendance tracking

✅ **Leave Management**
- Apply for leave (Paid, Sick, Unpaid)
- Leave approval/rejection workflow
- Leave balance tracking
- Automatic attendance updates

✅ **Payroll Management**
- Salary structure with automatic calculations
- Component-based salary (Basic, HRA, Allowances, etc.)
- Payroll generation based on attendance
- Payslip viewing

## Tech Stack

### Backend
- Node.js & Express.js
- MySQL (via XAMPP)
- JWT Authentication
- Bcrypt for password hashing

### Frontend
- React.js with Vite
- React Router for navigation
- Axios for API calls
- Modern CSS with glassmorphism effects

## Prerequisites

- Node.js (v16 or higher)
- XAMPP with MySQL running on port 3306
- npm or yarn

## Installation & Setup

### 1. Database Setup

1. Start XAMPP and ensure MySQL is running on port 3306
2. Open phpMyAdmin or MySQL command line
3. Run the database schema:

```bash
cd backend/database
# Import schema.sql into MySQL
mysql -u root -p < schema.sql
```

Or manually:
- Open phpMyAdmin
- Create a new database named `dayflow_hrms`
- Import the `backend/database/schema.sql` file

### 2. Backend Setup

```bash
cd backend

# Install dependencies (already done)
npm install

# Configure environment variables
# Edit .env file and update if needed:
# - DB_PASSWORD (if you have a MySQL password)
# - JWT_SECRET (change to a secure random string)

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
npm install

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

### First Time Setup

1. Open `http://localhost:5173` in your browser
2. Click "Sign Up" to create your company and admin account
3. Fill in the company details and your information
4. Your Employee ID will be auto-generated (e.g., `OIJODO2024001`)
5. After signup, you'll be logged in as an Admin

### Admin/HR Features

- **Dashboard**: View all employees and quick stats
- **Add Employee**: Create new employee accounts (auto-generates password)
- **Manage Attendance**: View and edit attendance records
- **Approve Leaves**: Review and approve/reject leave requests
- **Manage Payroll**: Set salary structures and generate payroll

### Employee Features

- **My Profile**: View and edit personal information
- **Attendance**: Check in/out and view attendance history
- **Leave Requests**: Apply for leave and track status
- **Payroll**: View salary structure and payslips

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register company and admin
- `POST /api/auth/signin` - User login
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user info

### Employees
- `POST /api/employees` - Create employee (Admin/HR)
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee (Admin)

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/my-attendance` - Get my attendance
- `GET /api/attendance/employee/:id` - Get employee attendance (Admin/HR)
- `GET /api/attendance/daily` - Get daily attendance (Admin/HR)
- `PUT /api/attendance/:id` - Update attendance (Admin/HR)

### Leaves
- `POST /api/leaves/apply` - Apply for leave
- `GET /api/leaves/my-requests` - Get my leave requests
- `GET /api/leaves/all-requests` - Get all requests (Admin/HR)
- `PUT /api/leaves/:id/approve` - Approve leave (Admin/HR)
- `PUT /api/leaves/:id/reject` - Reject leave (Admin/HR)
- `GET /api/leaves/balance` - Get leave balance

### Payroll
- `GET /api/payroll/my-salary` - Get my salary info
- `GET /api/payroll/employee/:id` - Get employee salary (Admin/HR)
- `PUT /api/payroll/employee/:id` - Update salary structure (Admin/HR)
- `POST /api/payroll/generate` - Generate monthly payroll (Admin/HR)
- `GET /api/payroll/slip/:id` - Get payslip

## Employee ID Format

Employee IDs are auto-generated in the format:
`[CompanyInitials][FirstName][LastName][Year][SerialNumber]`

Example: `OIJODO2024001`
- `OI` = Odeo India (Company Name)
- `JODO` = John Doe (Employee Name)
- `2024` = Year of Joining
- `001` = Serial Number

## Default Leave Types

When a company is created, the following leave types are automatically added:
- **Paid Time Off**: 24 days per year
- **Sick Leave**: 7 days per year
- **Unpaid Leave**: Unlimited

## Project Structure

```
dayflow-hrms/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   └── payrollController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── attendance.js
│   │   ├── leaves.js
│   │   └── payroll.js
│   ├── utils/
│   │   ├── employeeIdGenerator.js
│   │   ├── passwordGenerator.js
│   │   └── salaryCalculator.js
│   ├── database/
│   │   └── schema.sql
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.jsx
│   │   ├── config/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── styles/
│   │   │   ├── Auth.css
│   │   │   └── Dashboard.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   └── package.json
└── README.md
```

## Troubleshooting

### Database Connection Issues
- Ensure XAMPP MySQL is running
- Check that MySQL is on port 3306
- Verify database credentials in `backend/.env`

### Frontend Not Loading
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify API_BASE_URL in `frontend/.env`

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET in backend .env
- Ensure token is being sent in requests

## Future Enhancements

- File upload for profile pictures and documents
- Email notifications
- Advanced reporting and analytics
- Payslip PDF generation
- Multi-company support
- Mobile responsive improvements

## License

MIT

## Author

Built with ❤️ for modern HR management
