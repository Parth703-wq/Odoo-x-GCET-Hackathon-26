import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
    FiGrid, FiUsers, FiClock, FiFileText, FiSettings,
    FiCalendar, FiDollarSign, FiDownload, FiEye
} from 'react-icons/fi';

const Payroll = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [payrolls, setPayrolls] = useState([]);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const fetchPayrolls = async () => {
        try {
            const response = await api.get('/payroll/my-payrolls');
            setPayrolls(response.data.data || []);
        } catch (error) {
            console.error('Error fetching payrolls:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMonthName = (month) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month - 1];
    };

    const handleViewPayslip = (payroll) => {
        setSelectedPayslip(payroll);
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
                    <div className="header-right"></div>
                </header>

                <div className="breadcrumb">
                    Home &gt; <span>My Payroll</span>
                </div>

                {!selectedPayslip ? (
                    // Payroll List View
                    <>
                        <div className="card" style={{ marginBottom: '24px', padding: '32px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <div style={{ color: 'white' }}>
                                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>MY PAYROLL</div>
                                <div style={{ fontSize: '32px', fontWeight: '700' }}>Salary & Payslips</div>
                                <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '12px' }}>
                                    View and download your monthly payslips
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <span className="card-title">PAYSLIP HISTORY</span>
                            </div>

                            {loading ? (
                                <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
                                    Loading payroll records...
                                </div>
                            ) : payrolls.length === 0 ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <FiDollarSign size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
                                    <div style={{ fontSize: '16px', color: '#6B7280', marginBottom: '8px' }}>
                                        No payslips available yet
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                        Your payslips will appear here once payroll is generated
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '24px', display: 'grid', gap: '16px' }}>
                                    {payrolls.map((payroll) => (
                                        <div
                                            key={payroll.id}
                                            style={{
                                                padding: '20px',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: 'white',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                                e.currentTarget.style.borderColor = '#4F46E5';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = '#E5E7EB';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{
                                                    width: '56px',
                                                    height: '56px',
                                                    borderRadius: '8px',
                                                    background: '#EEF2FF',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexDirection: 'column'
                                                }}>
                                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#4F46E5' }}>
                                                        {getMonthName(payroll.month).substring(0, 3)}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                                        {payroll.year}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                                                        {getMonthName(payroll.month)} {payroll.year} Payslip
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                                                        Net Salary: <span style={{ fontWeight: '600', color: '#10B981' }}>
                                                            ₹{parseFloat(payroll.net_salary || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button
                                                    className="btn"
                                                    onClick={() => handleViewPayslip(payroll)}
                                                    style={{
                                                        padding: '10px 20px',
                                                        background: '#4F46E5',
                                                        color: 'white',
                                                        border: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <FiEye /> View
                                                </button>
                                                <button
                                                    className="btn"
                                                    onClick={() => alert('Download functionality')}
                                                    style={{
                                                        padding: '10px 20px',
                                                        background: 'white',
                                                        border: '1px solid #E5E7EB',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <FiDownload /> Download
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // Payslip Detail View
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">PAYSLIP - {getMonthName(selectedPayslip.month)} {selectedPayslip.year}</span>
                            <button
                                className="btn"
                                onClick={() => setSelectedPayslip(null)}
                                style={{ background: 'white', border: '1px solid #E5E7EB' }}
                            >
                                ← Back to List
                            </button>
                        </div>

                        <div style={{ padding: '40px' }}>
                            {/* Payslip Header */}
                            <div style={{ textAlign: 'center', marginBottom: '40px', paddingBottom: '24px', borderBottom: '2px solid #E5E7EB' }}>
                                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                                    SALARY SLIP
                                </h1>
                                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                                    For the month of {getMonthName(selectedPayslip.month)} {selectedPayslip.year}
                                </div>
                            </div>

                            {/* Employee Info */}
                            <div style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Employee Name</div>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                                        {user?.firstName} {user?.lastName}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Employee ID</div>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                                        {user?.employeeId}
                                    </div>
                                </div>
                            </div>

                            {/* Earnings & Deductions */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                                {/* Earnings */}
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #4F46E5' }}>
                                        EARNINGS
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                                        <span style={{ color: '#6B7280' }}>Basic Salary</span>
                                        <span style={{ fontWeight: '600' }}>₹{parseFloat(selectedPayslip.base_amount || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                                        <span style={{ color: '#6B7280' }}>Allowances</span>
                                        <span style={{ fontWeight: '600' }}>₹{parseFloat(selectedPayslip.total_allowances || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: '700', color: '#10B981' }}>
                                        <span>Gross Salary</span>
                                        <span>₹{parseFloat(selectedPayslip.gross_salary || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Deductions */}
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #EF4444' }}>
                                        DEDUCTIONS
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                                        <span style={{ color: '#6B7280' }}>Total Deductions</span>
                                        <span style={{ fontWeight: '600' }}>₹{parseFloat(selectedPayslip.total_deductions || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                                        <span style={{ color: '#6B7280' }}>Tax (if any)</span>
                                        <span style={{ fontWeight: '600' }}>₹0</span>
                                    </div>
                                </div>
                            </div>

                            {/* Net Salary */}
                            <div style={{
                                padding: '24px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                color: 'white'
                            }}>
                                <div>
                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>NET SALARY</div>
                                    <div style={{ fontSize: '32px', fontWeight: '700' }}>
                                        ₹{parseFloat(selectedPayslip.net_salary || 0).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    className="btn"
                                    onClick={() => alert('Download PDF functionality')}
                                    style={{
                                        padding: '12px 24px',
                                        background: 'white',
                                        color: '#667eea',
                                        border: 'none',
                                        fontWeight: '600'
                                    }}
                                >
                                    <FiDownload style={{ marginRight: '8px' }} />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Payroll;
