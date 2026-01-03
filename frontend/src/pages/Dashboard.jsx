import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user, logout, isAdmin, isHR } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [pendingLeaves, setPendingLeaves] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
        if (isAdmin || isHR) {
            fetchPendingLeaves();
        }
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingLeaves = async () => {
        try {
            const response = await api.get('/leaves/all-requests?status=PENDING');
            setPendingLeaves(response.data.data.length);
        } catch (error) {
            console.error('Error fetching pending leaves:', error);
        }
    };

    const handleCardClick = (route) => {
        navigate(route);
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h2>Dayflow</h2>
                    <span className="company-name">{user?.companyName}</span>
                </div>
                <div className="navbar-menu">
                    <button onClick={() => navigate('/dashboard')}>Dashboard</button>
                    {(isAdmin || isHR) ? (
                        <>
                            <button onClick={() => navigate('/dashboard')}>Employees</button>
                            <button onClick={() => navigate('/admin/leaves')}>Leave Approvals</button>
                            <button onClick={() => navigate('/admin/attendance')}>Attendance</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/attendance')}>Attendance</button>
                            <button onClick={() => navigate('/leaves')}>Time Off</button>
                            <button onClick={() => navigate('/payroll')}>Payroll</button>
                        </>
                    )}
                </div>
                <div className="navbar-user">
                    <div className="user-info">
                        <span>{user?.firstName} {user?.lastName}</span>
                        <span className="user-role">{user?.role}</span>
                    </div>
                    <button onClick={logout} className="btn-logout">Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Welcome, {user?.firstName}!</h1>
                    <p>Every workday, perfectly aligned.</p>
                </div>

                {(isAdmin || isHR) ? (
                    // Admin/HR Dashboard
                    <div className="admin-dashboard">
                        <div className="quick-stats">
                            <div className="stat-card">
                                <h3>Total Employees</h3>
                                <p className="stat-number">{employees.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Present Today</h3>
                                <p className="stat-number">-</p>
                            </div>
                            <div className="stat-card">
                                <h3>Pending Leaves</h3>
                                <p className="stat-number">{pendingLeaves}</p>
                            </div>
                        </div>

                        <div className="employees-section">
                            <div className="section-header">
                                <h2>Employees</h2>
                                <button
                                    className="btn-primary"
                                    onClick={() => navigate('/employees/create')}
                                >
                                    + Add Employee
                                </button>
                            </div>

                            <div className="employees-grid">
                                {employees.map((employee) => (
                                    <div
                                        key={employee.id}
                                        className="employee-card"
                                        onClick={() => navigate(`/employees/${employee.id}`)}
                                    >
                                        <div className="employee-avatar">
                                            {employee.profile_picture ? (
                                                <img src={employee.profile_picture} alt={employee.first_name} />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="employee-info">
                                            <h3>{employee.first_name} {employee.last_name}</h3>
                                            <p className="employee-id">{employee.employee_id}</p>
                                            <p className="employee-designation">{employee.designation || 'N/A'}</p>
                                            <p className="employee-department">{employee.department || 'N/A'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Employee Dashboard
                    <div className="employee-dashboard">
                        <div className="quick-access">
                            <div
                                className="access-card"
                                onClick={() => navigate('/profile')}
                            >
                                <div className="card-icon">👤</div>
                                <h3>My Profile</h3>
                                <p>View and edit your profile</p>
                            </div>

                            <div
                                className="access-card"
                                onClick={() => navigate('/attendance')}
                            >
                                <div className="card-icon">📅</div>
                                <h3>Attendance</h3>
                                <p>Check in/out and view records</p>
                            </div>

                            <div
                                className="access-card"
                                onClick={() => navigate('/leaves')}
                            >
                                <div className="card-icon">🏖️</div>
                                <h3>Leave Requests</h3>
                                <p>Apply and track leave requests</p>
                            </div>

                            <div
                                className="access-card"
                                onClick={() => navigate('/payroll')}
                            >
                                <div className="card-icon">💰</div>
                                <h3>Payroll</h3>
                                <p>View salary information</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
