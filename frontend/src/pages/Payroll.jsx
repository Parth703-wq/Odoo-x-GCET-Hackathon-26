import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
    FiGrid, FiUsers, FiClock, FiFileText, FiSettings,
    FiSearch, FiHelpCircle, FiCalendar, FiDollarSign, FiDownload
} from 'react-icons/fi';

const Payroll = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [salary, setSalary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSalary();
    }, []);

    const fetchSalary = async () => {
        try {
            const response = await api.get('/payroll/my-salary');
            setSalary(response.data.data);
        } catch (error) {
            console.error('Error fetching salary:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            {/* Employee Sidebar */}
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
                    <div className="nav-item" onClick={() => navigate('/employee/dashboard')}>
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
                    <div className="nav-item active" onClick={() => navigate('/payroll')}>
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
                    Home &gt; <span>My Payroll</span>
                </div>

                {loading ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>Loading payroll data...</div>
                ) : salary ? (
                    <>
                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                            <div className="card" style={{ padding: '24px' }}>
                                <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Base Wage</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>₹{salary.base_wage?.toLocaleString()}</div>
                            </div>
                            <div className="card" style={{ padding: '24px' }}>
                                <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Allowances</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669' }}>+ ₹{salary.total_allowances?.toLocaleString()}</div>
                            </div>
                            <div className="card" style={{ padding: '24px' }}>
                                <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Deductions</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#EF4444' }}>- ₹{salary.total_deductions?.toLocaleString()}</div>
                            </div>
                            <div className="card full-gradient-bg" style={{ padding: '24px', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: 'white' }}>
                                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Net Take Home</div>
                                <div style={{ fontSize: '28px', fontWeight: '700' }}>₹{salary.net_salary?.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <span className="card-title">Salary Breakdown</span>
                                <div className="btn-group">
                                    <button className="btn btn-primary" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                                        <FiDownload /> Download Slip
                                    </button>
                                </div>
                            </div>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Component</th>
                                        <th>Calculation</th>
                                        <th style={{ textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salary.components?.map((comp, index) => (
                                        <tr key={index}>
                                            <td style={{ fontWeight: '500' }}>{comp.component_name}</td>
                                            <td style={{ color: '#6B7280' }}>
                                                {comp.computation_type === 'PERCENTAGE' ? `${comp.value}% of Base` : 'Fixed Amount'}
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: '600', color: comp.calculated_amount > 0 ? '#111827' : '#EF4444' }}>
                                                ₹{comp.calculated_amount?.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
                        No salary structure assigned. Contact HR.
                    </div>
                )}
            </main>
        </div>
    );
};

export default Payroll;
