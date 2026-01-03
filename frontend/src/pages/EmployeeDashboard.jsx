import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiGrid, FiUsers, FiClock, FiFileText, FiSettings,
    FiSearch, FiHelpCircle, FiCalendar, FiDollarSign
} from 'react-icons/fi';

const EmployeeDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)' }}></div>
                        <span>CuteHR</span>
                    </div>
                </div>

                <div className="sidebar-content">
                    <div className="sidebar-profile">
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontWeight: 'bold' }}>
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#111827' }}>{user?.firstName} {user?.lastName}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>Employee</div>
                        </div>
                    </div>

                    <div className="nav-section-title">My Workspace</div>
                    <div className="nav-item active" onClick={() => navigate('/employee/dashboard')}>
                        <FiGrid className="nav-icon" /> Dashboard
                    </div>
                    <div className="nav-item" onClick={() => navigate('/employee/profile')}>
                        <FiUsers className="nav-icon" /> My Profile
                    </div>
                    <div className="nav-item" onClick={() => navigate('/attendance')}>
                        <FiClock className="nav-icon" /> Attendance
                    </div>
                    <div className="nav-item" onClick={() => navigate('/leaves')}>
                        <FiCalendar className="nav-icon" /> Time Off
                    </div>
                    <div className="nav-item" onClick={() => navigate('/payroll')}>
                        <FiDollarSign className="nav-icon" /> Payroll
                    </div>

                    <div className="nav-item" style={{ marginTop: 'auto', color: '#EF4444' }} onClick={logout}>
                        <FiSettings className="nav-icon" /> Logout
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-layout">
                <header className="main-header">
                    <div></div>
                    <div className="header-right">
                        {/* Header content cleared as per user request */}
                    </div>
                </header>

                <div className="breadcrumb">
                    Home &gt; <span>My Dashboard</span>
                </div>

                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div className="card cursor-pointer" onClick={() => navigate('/attendance')}>
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ width: '64px', height: '64px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', margin: '0 auto 16px', fontSize: '28px' }}>
                                <FiClock />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Attendance</h3>
                            <p style={{ color: '#6B7280', fontSize: '13px' }}>Check In / Out</p>
                        </div>
                    </div>

                    <div className="card cursor-pointer" onClick={() => navigate('/leaves')}>
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ width: '64px', height: '64px', background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', margin: '0 auto 16px', fontSize: '28px' }}>
                                <FiCalendar />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Time Off</h3>
                            <p style={{ color: '#6B7280', fontSize: '13px' }}>Apply for Leave</p>
                        </div>
                    </div>

                    <div className="card cursor-pointer" onClick={() => navigate('/payroll')}>
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ width: '64px', height: '64px', background: '#F5F3FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', margin: '0 auto 16px', fontSize: '28px' }}>
                                <FiDollarSign />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Payroll</h3>
                            <p style={{ color: '#6B7280', fontSize: '13px' }}>View Salary</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">My Recent Activity</span>
                    </div>
                    <div style={{ padding: '20px', color: '#6B7280', textAlign: 'center' }}>
                        No recent activity found.
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EmployeeDashboard;
