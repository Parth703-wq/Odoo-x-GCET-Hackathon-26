import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
    FiGrid, FiUsers, FiClock, FiFileText, FiSettings,
    FiSearch, FiHelpCircle, FiCalendar, FiDownload, FiFilter
} from 'react-icons/fi';

const AdminAttendance = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [attendance, setAttendance] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDailyAttendance();
    }, [selectedDate]);

    const fetchDailyAttendance = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/attendance/daily?date=${selectedDate}`);
            setAttendance(response.data.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
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
                    <div className="nav-item" onClick={() => navigate('/admin/employees')}>
                        <FiUsers className="nav-icon" /> Employees
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/dashboard')}>
                        <FiSettings className="nav-icon" /> Dashboard
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/leaves')}>
                        <FiFileText className="nav-icon" /> Leave Requests
                    </div>
                    <div className="nav-item active" onClick={() => navigate('/admin/attendance')}>
                        <FiClock className="nav-icon" /> Attendance
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
                    Home &gt; <span>Attendance Log</span>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Daily Attendance</span>
                        <div className="btn-group">
                            <button className="btn btn-primary" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                                <FiDownload /> Export Report
                            </button>
                        </div>
                    </div>

                    <div className="control-bar">
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div className="search-input-wrapper" style={{ width: '200px' }}>
                                <FiCalendar className="search-icon" />
                                <input
                                    type="date"
                                    className="search-input"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    style={{ paddingTop: '8px', paddingBottom: '8px' }}
                                />
                            </div>
                            <div className="search-input-wrapper">
                                <FiSearch className="search-icon" />
                                <input className="search-input" placeholder="Search Employee..." />
                            </div>
                        </div>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Work Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map((record) => (
                                <tr key={record.id}>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="user-avatar-small" style={{ background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontWeight: 'bold' }}>
                                                {record.first_name[0]}{record.last_name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#111827' }}>{record.first_name} {record.last_name}</div>
                                                <div style={{ fontSize: '11px', color: '#6B7280' }}>{record.employee_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '500', color: '#111827' }}>
                                        {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td style={{ fontWeight: '500', color: '#111827' }}>
                                        {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td style={{ color: '#374151' }}>
                                        {record.work_hours || '0'} hrs
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            background: record.status === 'PRESENT' ? '#D1FAE5' : record.status === 'LEAVE' ? '#FEF3C7' : '#FEE2E2',
                                            color: record.status === 'PRESENT' ? '#065F46' : record.status === 'LEAVE' ? '#92400E' : '#991B1B'
                                        }}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {attendance.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
                            No attendance records found for {selectedDate}.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminAttendance;
