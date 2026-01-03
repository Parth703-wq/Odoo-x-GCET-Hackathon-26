import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
    FiGrid, FiUsers, FiClock, FiFileText, FiSettings,
    FiCalendar, FiDollarSign, FiEdit, FiSave, FiX
} from 'react-icons/fi';

const EmployeeProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/employees');
            const profile = response.data.data[0];
            setEmployee(profile);
            setFormData({
                phone: profile.phone || '',
                address: profile.address || '',
                city: profile.city || '',
                state: profile.state || '',
                pinCode: profile.pin_code || '',
                emergencyContact: profile.emergency_contact || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaveLoading(true);
        try {
            await api.put(`/employees/${employee.id}`, formData);
            alert('Profile updated successfully!');
            setIsEditing(false);
            fetchProfile();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating profile');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            phone: employee.phone || '',
            address: employee.address || '',
            city: employee.city || '',
            state: employee.state || '',
            pinCode: employee.pin_code || '',
            emergencyContact: employee.emergency_contact || ''
        });
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
                        <span className="card-title">MY PROFILE</span>
                        <div>
                            {!isEditing ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setIsEditing(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <FiEdit /> Edit Profile
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSave}
                                        disabled={saveLoading}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10B981' }}
                                    >
                                        <FiSave /> {saveLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleCancel}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#6B7280' }}
                                    >
                                        <FiX /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ padding: '32px' }}>
                        {/* Personal Information */}
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Personal Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Full Name</label>
                                    <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                                        {employee.first_name} {employee.last_name}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Email</label>
                                    <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                                        {employee.email}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Phone</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                                            {employee.phone || 'Not provided'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Emergency Contact</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.emergencyContact}
                                            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                                            {employee.emergency_contact || 'Not provided'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '# 111827', marginBottom: '16px' }}>Address</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Street Address</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                                            {employee.address || 'Not provided'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>City</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                                            {employee.city || 'Not provided'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>State</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                                            {employee.state || 'Not provided'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>PIN Code</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.pinCode}
                                            onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                                            {employee.pin_code || 'Not provided'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Work Information (Read-only) */}
                        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #E5E7EB' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Work Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Employee ID</label>
                                    <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                                        {employee.employee_id}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Department</label>
                                    <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                                        {employee.department || 'Not assigned'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Designation</label>
                                    <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                                        {employee.designation || 'Not assigned'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Date of Joining</label>
                                    <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                                        {employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : 'Not provided'}
                                    </div>
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
