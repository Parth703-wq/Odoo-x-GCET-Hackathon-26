import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
    FiGrid, FiUsers, FiClock, FiFileText, FiSettings,
    FiSearch, FiHelpCircle, FiCheck, FiX, FiFilter
} from 'react-icons/fi';

const AdminLeaves = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState([]);
    const [filter, setFilter] = useState('PENDING');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaves();
    }, [filter]);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/leaves/all-requests?status=${filter}`);
            setLeaves(response.data.data);
        } catch (error) {
            console.error('Error fetching leaves:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/leaves/${id}/approve`, { comments: 'Approved' });
            alert('Leave approved!');
            fetchLeaves();
        } catch (error) {
            alert(error.response?.data?.message || 'Error approving leave');
        }
    };

    const handleReject = async (id) => {
        const comments = prompt('Reason for rejection:');
        if (!comments) return;

        try {
            await api.put(`/leaves/${id}/reject`, { comments });
            alert('Leave rejected!');
            fetchLeaves();
        } catch (error) {
            alert(error.response?.data?.message || 'Error rejecting leave');
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
                    <div className="nav-item" onClick={() => navigate('/admin/employees')}>
                        <FiUsers className="nav-icon" /> Employees
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/dashboard')}>
                        <FiSettings className="nav-icon" /> Dashboard
                    </div>
                    <div className="nav-item active" onClick={() => navigate('/admin/leaves')}>
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
                    Home &gt; <span>Leave Approvals</span>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Monitor Leaves</span>
                        <div className="btn-group">
                            <button className={`btn-tab ${filter === 'PENDING' ? 'active' : ''}`} onClick={() => setFilter('PENDING')}>Pending</button>
                            <button className={`btn-tab ${filter === 'APPROVED' ? 'active' : ''}`} onClick={() => setFilter('APPROVED')}>Approved</button>
                            <button className={`btn-tab ${filter === 'REJECTED' ? 'active' : ''}`} onClick={() => setFilter('REJECTED')}>Rejected</button>
                        </div>
                    </div>

                    <div className="control-bar">
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div className="search-input-wrapper">
                                <FiSearch className="search-icon" />
                                <input className="search-input" placeholder="Search Request..." />
                            </div>
                            <button className="btn btn-primary" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                                <FiFilter /> Filter
                            </button>
                        </div>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Type</th>
                                <th>Duration</th>
                                <th>Days</th>
                                <th>Reason</th>
                                <th>Status</th>
                                {filter === 'PENDING' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map((leave) => (
                                <tr key={leave.id}>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="user-avatar-small" style={{ background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontWeight: 'bold' }}>
                                                {leave.first_name[0]}{leave.last_name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#111827' }}>{leave.first_name} {leave.last_name}</div>
                                                <div style={{ fontSize: '11px', color: '#6B7280' }}>{leave.employee_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '500' }}>{leave.leave_name}</td>
                                    <td style={{ color: '#374151' }}>
                                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className="request-badge" style={{ background: '#F3F4F6', color: '#1F2937', minWidth: '32px' }}>{leave.total_days}</span>
                                    </td>
                                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#6B7280' }}>
                                        {leave.reason || '-'}
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
                                    {filter === 'PENDING' && (
                                        <td style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleApprove(leave.id)}
                                                style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#D1FAE5', color: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Approve"
                                            >
                                                <FiCheck />
                                            </button>
                                            <button
                                                onClick={() => handleReject(leave.id)}
                                                style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#FEE2E2', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Reject"
                                            >
                                                <FiX />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {leaves.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
                            No {filter.toLowerCase()} requests found.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminLeaves;
