import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
    FiGrid, FiUsers, FiClock, FiFileText, FiSettings,
    FiSearch, FiHelpCircle, FiCalendar, FiDollarSign, FiPlus, FiFilter
} from 'react-icons/fi';

const Leaves = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState([]);
    const [balance, setBalance] = useState([]);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [formData, setFormData] = useState({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: ''
    });

    useEffect(() => {
        fetchLeaves();
        fetchBalance();
    }, []);

    const fetchLeaves = async () => {
        try {
            const response = await api.get('/leaves/my-requests');
            setLeaves(response.data.data);
        } catch (error) {
            console.error('Error fetching leaves:', error);
        }
    };

    const fetchBalance = async () => {
        try {
            const response = await api.get('/leaves/balance');
            setBalance(response.data.data);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const selectedLeave = balance.find(b => b.leave_type_id == formData.leaveTypeId);

        if (!selectedLeave) {
            alert('Please select a leave type');
            return;
        }

        if (totalDays > selectedLeave.available_days) {
            alert(`Insufficient leave balance! Requested: ${totalDays}, Available: ${selectedLeave.available_days}`);
            return;
        }

        if (end < start) {
            alert('End date cannot be before start date');
            return;
        }

        try {
            await api.post('/leaves/apply', formData);
            alert('Leave request submitted successfully!');
            setShowApplyForm(false);
            setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
            fetchLeaves();
            fetchBalance();
        } catch (error) {
            alert(error.response?.data?.message || 'Error applying for leave');
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
                    <div className="nav-item active" onClick={() => navigate('/leaves')}>
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
                    Home &gt; <span>Time Off Management</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    {balance.map(b => (
                        <div key={b.id} className="card" style={{ padding: '24px' }}>
                            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>{b.leave_name}</div>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>{b.available_days} <span style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: '400' }}>/ {b.total_allocated}</span></div>
                            <div style={{ width: '100%', height: '4px', background: '#F3F4F6', borderRadius: '2px', marginTop: '16px' }}>
                                <div style={{ width: `${(b.available_days / b.total_allocated) * 100}%`, height: '100%', background: '#4F46E5', borderRadius: '2px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Leave Requests</span>
                        <div className="btn-group">
                            <button className="btn btn-primary" onClick={() => setShowApplyForm(!showApplyForm)}>
                                <FiPlus /> Apply Leave
                            </button>
                        </div>
                    </div>

                    {showApplyForm && (
                        <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', maxWidth: '600px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Leave Type</label>
                                    <select className="input-field select-input" style={{ width: '100%' }} value={formData.leaveTypeId} onChange={e => setFormData({ ...formData, leaveTypeId: e.target.value })} required>
                                        <option value="">Select Type</option>
                                        {balance.map(b => <option key={b.leave_type_id} value={b.leave_type_id}>{b.leave_name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>From</label>
                                        <input type="date" className="search-input" style={{ width: '100%' }} value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>To</label>
                                        <input type="date" className="search-input" style={{ width: '100%' }} value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} required />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Reason</label>
                                    <textarea className="search-input" style={{ width: '100%', minHeight: '80px' }} value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason for leave..."></textarea>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" className="btn" onClick={() => setShowApplyForm(false)} style={{ border: '1px solid #D1D5DB' }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Submit Request</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Dates</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map((leave) => (
                                <tr key={leave.id}>
                                    <td style={{ fontWeight: '500' }}>{leave.leave_name}</td>
                                    <td style={{ color: '#374151' }}>
                                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className="request-badge" style={{ background: '#F3F4F6', color: '#1F2937' }}>{leave.total_days} days</span>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            background: leave.status === 'APPROVED' ? '#D1FAE5' : leave.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                                            color: leave.status === 'APPROVED' ? '#065F46' : leave.status === 'REJECTED' ? '#991B1B' : '#92400E'
                                        }}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td style={{ color: '#6B7280', fontSize: '13px' }}>{leave.reason || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {leaves.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
                            No leave history found.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Leaves;
