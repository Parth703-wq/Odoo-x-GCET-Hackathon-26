import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
    FiGrid, FiUsers, FiClock, FiFileText, FiSettings,
    FiSearch, FiHelpCircle, FiCalendar, FiDollarSign, FiEdit
} from 'react-icons/fi';

const EmployeeProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/employees');
            setEmployee(response.data.data[0]); // Get own profile
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', color: '#6B7280' }}>
            Loading Profile...
        </div>
    );

    if (!employee) return <div>Profile not found</div>;

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
                    <div className="nav-item active" onClick={() => navigate('/employee/profile')}>
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
                    Home &gt; <span>My Profile</span>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">My Profile</span>
                        <div className="btn-group">
                            <button className="btn btn-primary" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                                <FiEdit /> Edit Information
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '48px' }}>
                        {/* Left Column: Avatar & Quick Info */}
                        <div style={{ textAlign: 'center', padding: '24px', background: '#F9FAFB', borderRadius: '12px', height: 'fit-content' }}>
                            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontWeight: 'bold', fontSize: '48px', margin: '0 auto 16px' }}>
                                {employee.first_name[0]}{employee.last_name[0]}
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{employee.first_name} {employee.last_name}</h2>
                            <p style={{ color: '#6B7280', marginBottom: '16px' }}>{employee.designation || 'Employee'}</p>

                            <div style={{ textAlign: 'left', marginTop: '24px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                    <label style={{ fontSize: '12px', color: '#6B7280' }}>Status</label>
                                    <div style={{ color: '#059669', background: '#D1FAE5', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Active</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label style={{ fontSize: '12px', color: '#6B7280' }}>Joined</label>
                                    <div style={{ fontWeight: '500', fontSize: '13px' }}>{new Date(employee.date_of_joining).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Detailed Info */}
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>Personal Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Full Name</label>
                                    <div style={{ fontWeight: '500' }}>{employee.first_name} {employee.last_name}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Email</label>
                                    <div style={{ fontWeight: '500' }}>{employee.email}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Phone</label>
                                    <div style={{ fontWeight: '500' }}>{employee.phone || '-'}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Gender</label>
                                    <div style={{ fontWeight: '500' }}>{employee.gender || '-'}</div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>Employment Details</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Employee ID</label>
                                    <div style={{ fontWeight: '500' }}>{employee.employee_id}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Department</label>
                                    <div style={{ fontWeight: '500' }}>{employee.department || '-'}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Employment Type</label>
                                    <div style={{ fontWeight: '500' }}>{employee.employment_type || 'Full Time'}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Work Location</label>
                                    <div style={{ fontWeight: '500' }}>{employee.work_location || 'Office'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EmployeeProfile;
