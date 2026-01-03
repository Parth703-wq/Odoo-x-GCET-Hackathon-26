import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
    FiGrid, FiUsers, FiClock, FiFileText, FiSettings,
    FiSearch, FiHelpCircle, FiPieChart, FiTrendingUp
} from 'react-icons/fi';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [pendingLeaves, setPendingLeaves] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
        fetchPendingLeaves();
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
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>Admin</div>
                        </div>
                    </div>

                    <div className="nav-section-title">Your Apps</div>
                    <div className="nav-item">
                        <FiClock className="nav-icon" /> Timer
                    </div>
                    <div className="nav-item">
                        <FiGrid className="nav-icon" /> Projects
                    </div>

                    <div className="nav-section-title">Your Company</div>
                    <div className="nav-item" onClick={() => navigate('/admin/employees')}>
                        <FiUsers className="nav-icon" /> Employees
                    </div>
                    <div className="nav-item active" onClick={() => navigate('/admin/dashboard')}>
                        <FiSettings className="nav-icon" /> Dashboard
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/leaves')}>
                        <FiFileText className="nav-icon" /> Leave Requests
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
                        <div className="header-user-profile">
                            <span className="user-name">{user?.firstName} {user?.lastName}</span>
                            <span className="user-role-badge">{user?.role}</span>
                        </div>
                    </div>
                </header>

                <div className="breadcrumb">
                    Home &gt; <span>Dashboard Dashboard</span>
                </div>

                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Total Employees</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginTop: '4px' }}>{employees.length}</div>
                            </div>
                            <div style={{ width: '48px', height: '48px', background: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontSize: '24px' }}>
                                <FiUsers />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Pending Leaves</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginTop: '4px' }}>{pendingLeaves}</div>
                            </div>
                            <div style={{ width: '48px', height: '48px', background: '#FEF3C7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', fontSize: '24px' }}>
                                <FiFileText />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>On-Time today</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginTop: '4px' }}>92%</div>
                            </div>
                            <div style={{ width: '48px', height: '48px', background: '#D1FAE5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: '24px' }}>
                                <FiTrendingUp />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Late Arrivals</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginTop: '4px' }}>3</div>
                            </div>
                            <div style={{ width: '48px', height: '48px', background: '#FEE2E2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', fontSize: '24px' }}>
                                <FiClock />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Attendance Overview</span>
                    </div>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', borderRadius: '8px', border: '1px dashed #E5E7EB', color: '#9CA3AF' }}>
                        Chart visualization would go here
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
