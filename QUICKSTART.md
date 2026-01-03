# Quick Start Guide - Dayflow HRMS

## Prerequisites Check
- ✅ Node.js installed
- ✅ XAMPP installed
- ✅ MySQL running on port 3306

## Setup Steps

### 1. Database Setup (5 minutes)

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start MySQL service

2. **Create Database**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Click "New" to create database
   - Database name: `dayflow_hrms`
   - Click "Create"

3. **Import Schema**
   - Select `dayflow_hrms` database
   - Click "Import" tab
   - Choose file: `backend/database/schema.sql`
   - Click "Go"
   - ✅ You should see 11 tables created

### 2. Backend Setup (2 minutes)

```bash
# Navigate to backend folder
cd d:\New folder\dayflow-hrms\backend

# Start the server
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Dayflow HRMS Backend Server
📡 Server running on: http://localhost:5000
```

### 3. Frontend Setup (2 minutes)

Open a **new terminal** window:

```bash
# Navigate to frontend folder
cd d:\New folder\dayflow-hrms\frontend

# Start the development server
npm run dev
```

You should see:
```
VITE v7.3.0  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 4. Test the Application

1. **Open Browser**: `http://localhost:5173`

2. **Sign Up**:
   - Click "Sign Up"
   - Company Name: "Your Company"
   - Your Name: "Your Name"
   - Email: "admin@company.com"
   - Password: "password123"
   - Click "SIGN UP"

3. **You're In!**
   - You'll see the Admin Dashboard
   - Your Employee ID is auto-generated
   - You can now add employees, manage attendance, etc.

---

## Troubleshooting

### Database Connection Error
**Problem**: `❌ Database connection failed`

**Solution**:
1. Check XAMPP MySQL is running
2. Verify database name is `dayflow_hrms`
3. Check `backend/.env` file:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=dayflow_hrms
   ```

### Frontend Can't Connect to Backend
**Problem**: API errors in browser console

**Solution**:
1. Ensure backend is running on port 5000
2. Check `frontend/.env`:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
3. Restart frontend server

### Port Already in Use
**Problem**: `Port 5000 is already in use`

**Solution**:
1. Change port in `backend/.env`:
   ```
   PORT=5001
   ```
2. Update `frontend/.env`:
   ```
   VITE_API_BASE_URL=http://localhost:5001/api
   ```
3. Restart both servers

---

## Default Credentials After Signup

After signing up, you'll be logged in as **Admin** with:
- Role: ADMIN
- Auto-generated Employee ID (e.g., `YOCO2024001`)
- Full access to all features

---

## What to Test

### As Admin:
1. ✅ Create new employee
2. ✅ View all employees
3. ✅ Check attendance records
4. ✅ Approve leave requests
5. ✅ Manage payroll

### As Employee (create one first):
1. ✅ View own profile
2. ✅ Check in/out
3. ✅ Apply for leave
4. ✅ View salary info

---

## Need Help?

Check the main [README.md](../README.md) for:
- Complete API documentation
- Detailed feature list
- Project structure
- Advanced configuration

Enjoy using Dayflow HRMS! 🚀
