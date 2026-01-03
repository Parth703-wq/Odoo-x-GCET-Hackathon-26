import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import AdminSidebar from '../components/AdminSidebar';
import {
    FiSearch, FiCheck, FiX, FiClock
} from 'react-icons/fi';

const AdminLeaves = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchLeaveRequests();
    }, [filter]);

    const fetchLeaveRequests = async () => {
        try {
            const params = filter !== 'ALL' ? `?status=${filter}` : '';
            const response = await api.get(`/leaves/all-requests${params}`);
            setLeaveRequests(response.data.data);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this leave request?')) return;

        setProcessingId(id);
        try {
            await api.put(`/leaves/${id}/approve`, {
                comments: 'Approved by admin'
            });
            alert('Leave request approved successfully!');
            fetchLeaveRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Error approving leave');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this leave request?')) return;

        setProcessingId(id);
        try {
            await api.put(`/leaves/reject/${id}`, {
                comments: 'Rejected by admin'
            });
            alert('Leave request rejected');
            fetchLeaveRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Error rejecting leave');
        } finally {
            setProcessingId(null);
        }
    };

    const exportToCSV = () => {
        const dataToExport = filteredRequests;

        if (dataToExport.length === 0) {
            alert('No data to export');
            return;
        }

        let csvContent = 'Employee ID,Name,Department,Leave Type,Start Date,End Date,Days,Status,Applied On\n';
        dataToExport.forEach(leave => {
            const startDate = new Date(leave.start_date).toLocaleDateString();
            const endDate = new Date(leave.end_date).toLocaleDateString();
            const appliedDate = new Date(leave.applied_on).toLocaleDateString();
            csvContent += `${leave.employee_id || ''},"${leave.first_name} ${leave.last_name}",${leave.department || ''},${leave.leave_name},${startDate},${endDate},${leave.total_days},${leave.status},${appliedDate}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `leave-requests-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredRequests = leaveRequests.filter(req =>
        req.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.leave_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: { bg: '#FEF3C7', color: '#F59E0B', text: '⏳ Pending' },
            APPROVED: { bg: '#D1FAE5', color: '#10B981', text: '✓ Approved' },
            REJECTED: { bg: '#FEE2E2', color: '#EF4444', text: '✗ Rejected' }
        };
        const style = styles[status] || styles.PENDING;
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                background: style.bg,
                color: style.color
            }}>
                {style.text}
            </span>
        );
    };

    return (
        <div className="app-container">
            <AdminSidebar activePage="leaves" />

            <main className="main-layout">
                <header className="main-header">
                    <div></div>
                    <div className="header-right"></div>
                </header>

                <div className="breadcrumb">
                    Home &gt; <span>Leave Requests</span>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">LEAVE REQUESTS</span>
                        <button className="btn btn-primary" onClick={exportToCSV}>
                            Export CSV
                        </button>
                    </div>

                    <div className="control-bar" style={{ padding: '0 24px 24px' }}>
                        <div className="search-input-wrapper">
                            <FiSearch className="search-icon" />
                            <input
                                className="search-input"
                                placeholder="Search by employee name or leave type"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="select-input"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="ALL">All Requests</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        {loading ? (
                            <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
                                Loading leave requests...
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
                                No leave requests found
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Leave Type</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Days</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td>
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>
                                                        {request.first_name} {request.last_name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                                        {request.department || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{request.leave_name}</td>
                                            <td>{new Date(request.start_date).toLocaleDateString()}</td>
                                            <td>{new Date(request.end_date).toLocaleDateString()}</td>
                                            <td>{request.total_days}</td>
                                            <td>{getStatusBadge(request.status)}</td>
                                            <td>
                                                {request.status === 'PENDING' ? (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            className="btn"
                                                            onClick={() => handleApprove(request.id)}
                                                            disabled={processingId === request.id}
                                                            style={{
                                                                padding: '6px 12px',
                                                                background: '#10B981',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                fontSize: '13px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                cursor: processingId === request.id ? 'not-allowed' : 'pointer',
                                                                opacity: processingId === request.id ? 0.5 : 1
                                                            }}
                                                        >
                                                            <FiCheck /> Approve
                                                        </button>
                                                        <button
                                                            className="btn"
                                                            onClick={() => handleReject(request.id)}
                                                            disabled={processingId === request.id}
                                                            style={{
                                                                padding: '6px 12px',
                                                                background: '#EF4444',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                fontSize: '13px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                cursor: processingId === request.id ? 'not-allowed' : 'pointer',
                                                                opacity: processingId === request.id ? 0.5 : 1
                                                            }}
                                                        >
                                                            <FiX /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                                                        {request.approver_first_name ?
                                                            `By ${request.approver_first_name} ${request.approver_last_name}` :
                                                            'Processed'
                                                        }
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLeaves;
