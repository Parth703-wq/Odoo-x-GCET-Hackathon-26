import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiUsers, FiClock, FiFileText, FiSettings
} from 'react-icons/fi';

const AdminSidebar = ({ activePage }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
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
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>Admin</div>
                    </div>
                </div>

                <div className="nav-section-title">Your Company</div>
                <div
                    className={`nav-item ${activePage === 'employees' ? 'active' : ''}`}
                    onClick={() => navigate('/admin/employees')}
                >
                    <FiUsers className="nav-icon" /> Employees
                </div>
                <div
                    className={`nav-item ${activePage === 'attendance' ? 'active' : ''}`}
                    onClick={() => navigate('/admin/attendance')}
                >
                    <FiClock className="nav-icon" /> Attendance
                </div>
                <div
                    className={`nav-item ${activePage === 'leaves' ? 'active' : ''}`}
                    onClick={() => navigate('/admin/leaves')}
                >
                    <FiFileText className="nav-icon" /> Leaves
                </div>
                <div
                    className={`nav-item ${activePage === 'payroll' ? 'active' : ''}`}
                    onClick={() => navigate('/admin/payroll')}
                >
                    <FiFileText className="nav-icon" /> Payroll
                </div>
                <div
                    className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
                    onClick={() => navigate('/admin/dashboard')}
                >
                    <FiSettings className="nav-icon" /> Dashboard
                </div>

                <div className="nav-item" style={{ marginTop: 'auto', color: '#EF4444' }} onClick={logout}>
                    <FiSettings className="nav-icon" /> Logout
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
