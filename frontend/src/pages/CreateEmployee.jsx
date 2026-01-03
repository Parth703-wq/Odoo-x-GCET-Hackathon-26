import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
    FiGrid, FiUsers, FiClock, FiFileText, FiSettings,
    FiSearch, FiHelpCircle, FiArrowLeft, FiSave
} from 'react-icons/fi';

const CreateEmployee = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        department: '',
        designation: '',
        role: 'EMPLOYEE'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/employees', formData);
            const data = response.data.data;

            setGeneratedCredentials(data);
            setSuccess('Employee created successfully!');

            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                dateOfJoining: new Date().toISOString().split('T')[0],
                department: '',
                designation: '',
                role: 'EMPLOYEE'
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar Reuse */}
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
                    <div className="nav-item active" onClick={() => navigate('/admin/employees')}>
                        <FiUsers className="nav-icon" /> Employees
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/dashboard')}>
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
                        {/* Header content cleared as per user request */}
                    </div>
                </header>

                <div className="breadcrumb">
                    Home &gt; Employees &gt; <span>Add New</span>
                </div>

                <div className="card" style={{ maxWidth: '800px' }}>
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button onClick={() => navigate('/admin/employees')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}><FiArrowLeft /></button>
                            <span className="card-title">Create New Employee</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '20px 0' }}>
                        {error && <div style={{ padding: '12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}
                        {success && (
                            <div style={{ padding: '12px', background: '#D1FAE5', color: '#065F46', borderRadius: '6px', marginBottom: '20px' }}>
                                <p style={{ fontWeight: 600 }}>{success}</p>
                                {generatedCredentials && (
                                    <div style={{ marginTop: '10px', fontSize: '13px', background: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '4px' }}>
                                        <p><strong>Employee ID:</strong> {generatedCredentials.employeeId}</p>
                                        <p><strong>Email:</strong> {generatedCredentials.email}</p>
                                        <p><strong>Temporary Password:</strong> {generatedCredentials.temporaryPassword}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>First Name *</label>
                                <input className="search-input" name="firstName" value={formData.firstName} onChange={handleChange} required style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Last Name *</label>
                                <input className="search-input" name="lastName" value={formData.lastName} onChange={handleChange} required style={{ width: '100%' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email Address *</label>
                            <input className="search-input" type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Phone Number</label>
                                <input className="search-input" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Date of Joining *</label>
                                <input className="search-input" type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} required style={{ width: '100%' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Department</label>
                                <input className="search-input" name="department" value={formData.department} onChange={handleChange} style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Designation</label>
                                <input className="search-input" name="designation" value={formData.designation} onChange={handleChange} style={{ width: '100%' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Role *</label>
                            <select className="select-input" name="role" value={formData.role} onChange={handleChange} style={{ width: '100%' }}>
                                <option value="EMPLOYEE">Employee</option>
                                <option value="HR">HR</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <button className="btn btn-primary" type="submit" disabled={loading} style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
                            <FiSave /> {loading ? 'Creating...' : 'Save Employee'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateEmployee;
