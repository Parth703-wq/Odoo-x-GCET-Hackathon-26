import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmployees from './pages/AdminEmployees';
import AdminAttendance from './pages/AdminAttendance';
import AdminLeaves from './pages/AdminLeaves';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import CreateEmployee from './pages/CreateEmployee';
import EmployeeDetail from './pages/EmployeeDetail';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<PrivateRoute requireAdminOrHR={true}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/employees" element={<PrivateRoute requireAdminOrHR={true}><AdminEmployees /></PrivateRoute>} />
          <Route path="/admin/attendance" element={<PrivateRoute requireAdminOrHR={true}><AdminAttendance /></PrivateRoute>} />
          <Route path="/admin/leaves" element={<PrivateRoute requireAdminOrHR={true}><AdminLeaves /></PrivateRoute>} />

          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={<PrivateRoute><EmployeeDashboard /></PrivateRoute>} />
          <Route path="/employee/profile" element={<PrivateRoute><EmployeeProfile /></PrivateRoute>} />

          {/* Shared Routes */}
          <Route path="/employees/create" element={<PrivateRoute requireAdminOrHR={true}><CreateEmployee /></PrivateRoute>} />
          <Route path="/employees/:id" element={<PrivateRoute requireAdminOrHR={true}><EmployeeDetail /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
          <Route path="/leaves" element={<PrivateRoute><Leaves /></PrivateRoute>} />
          <Route path="/payroll" element={<PrivateRoute><Payroll /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
