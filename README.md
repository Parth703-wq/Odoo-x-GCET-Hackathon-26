# DayFlow HRMS

A comprehensive Human Resource Management System built with React and Node.js, featuring employee management, attendance tracking, leave management, and payroll processing.

## 🌟 Features

### Admin Features
- **Dashboard Analytics** - Real-time charts showing attendance trends, leave distribution, and department statistics
- **Employee Management** - Complete CRUD operations, bulk import via CSV, and data export
- **Attendance Tracking** - Daily attendance monitoring with live employee status
- **Leave Management** - Approve/reject leave requests with automated balance tracking
- **Payroll System** - Generate monthly payroll, view detailed payslips, and export reports
- **Reporting** - Export all data to CSV format for external analysis

### Employee Features
- **Personal Dashboard** - Quick overview of attendance and leave status
- **Profile Management** - Update personal and contact information
- **Attendance** - Check-in/check-out functionality with work hours tracking
- **Leave Application** - Apply for leaves and track request status
- **Payroll** - View monthly payslips with detailed salary breakdown

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/dayflow-hrms.git
cd dayflow-hrms
```

### 2. Database Setup
```sql
CREATE DATABASE hrms_db;
```

Run the SQL schema file to create tables:
```bash
mysql -u root -p hrms_db < backend/config/schema.sql
```

### 3. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hrms_db
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:
```bash
npm start
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📱 Usage

### Default Admin Login
- **Email:** admin@test.com
- **Password:** password123

### Creating Employees
1. Login as admin
2. Navigate to "Employees" section
3. Click "Add Employees" or use "Import Employees" for bulk upload
4. Fill in employee details and save

### Managing Attendance
**For Employees:**
- Navigate to "Attendance" page
- Click "Mark Check In" when starting work
- Click "Mark Check Out" when leaving

**For Admins:**
- View daily attendance records
- Monitor live employee status
- Export attendance reports

### Leave Management
**For Employees:**
1. Go to "Time Off" section
2. Click "Apply for Leave"
3. Select leave type, dates, and provide reason
4. Submit request

**For Admins:**
- View all leave requests
- Approve or reject with comments
- Track leave balances

### Payroll Processing
1. Navigate to Admin Payroll section
2. Select month and year
3. Click "Generate Payroll"
4. View and export payroll records

## 📊 Key Features Explained

### Import Employees
Upload a CSV file with employee data. Required format:
```csv
firstName,lastName,email,department,designation,phone,salary
John,Doe,john@example.com,Engineering,Developer,1234567890,50000
```

### Export Reports
All admin pages support CSV export:
- Employee lists
- Attendance records
- Leave requests
- Payroll data

### Real-time Dashboard
- Weekly attendance trends (line chart)
- Leave request distribution (pie chart)
- Department-wise employee count (bar chart)
- Live statistics cards

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/HR/Employee)
- Protected API endpoints

## 📂 Project Structure

```
dayflow-hrms/
├── backend/
│   ├── config/           # Database and configuration
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth and validation
│   ├── routes/          # API routes
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Context providers
│   │   └── config/      # API configuration
│   └── public/
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 📧 Contact

For any queries or support, please contact the development team.

---

**Note:** Make sure to change default credentials and JWT secret in production environment.
