import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
    FiGrid, FiUsers, FiClock, FiFileText, FiSettings,
    FiSearch, FiHelpCircle, FiCalendar, FiDollarSign, FiCheckCircle, FiXCircle
} from 'react-icons/fi';

const Attendance = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [attendance, setAttendance] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await api.get('/attendance/my-attendance');
            setAttendance(response.data.data);

            const today = new Date().toISOString().split('T')[0];
            const todayRecord = response.data.data.find(a => a.date.startsWith(today));
            setTodayAttendance(todayRecord);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            await api.post('/attendance/check-in');
            alert('Checked in successfully!');
            fetchAttendance();
        } catch (error) {
            alert(error.response?.data?.message || 'Error checking in');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            await api.post('/attendance/check-out');
            alert('Checked out successfully!');
            fetchAttendance();
        } catch (error) {
            alert(error.response?.data?.message || 'Error checking out');
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
                    <div className="nav-item active" onClick={() => navigate('/attendance')}>
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
                    Home &gt; <span>My Attendance</span>
                </div>

                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-header">
                        <span className="card-title">Today's Action</span>
                        <div className="btn-group">
                            <button className="btn btn-primary" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                                View Roster
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '24px', color: '#111827', marginBottom: '8px' }}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h2>
                            <p style={{ color: '#6B7280' }}>Mark your daily attendance here.</p>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            {!todayAttendance ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleCheckIn}
                                    disabled={loading}
                                    style={{ background: '#4F46E5', color: 'white', border: 'none', padding: '12px 24px', fontSize: '16px' }}
                                >
                                    <FiCheckCircle /> Mark Check In
                                </button>
                            ) : !todayAttendance.check_out_time ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleCheckOut}
                                    disabled={loading}
                                    style={{ background: '#F59E0B', color: 'white', border: 'none', padding: '12px 24px', fontSize: '16px' }}
                                >
                                    <FiXCircle /> Mark Check Out
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    disabled={true}
                                    style={{ background: '#10B981', color: 'white', border: 'none', padding: '12px 24px', fontSize: '16px', opacity: 0.8 }}
                                >
                                    ✓ Shift Completed
                                </button>
                            )}
                        </div>
                    </div>

                    {todayAttendance && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#E5E7EB', margin: '0 24px 24px', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ background: 'white', padding: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Check In</div>
                                <div style={{ fontWeight: '600', fontSize: '18px' }}>{new Date(todayAttendance.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div style={{ background: 'white', padding: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Check Out</div>
                                <div style={{ fontWeight: '600', fontSize: '18px' }}>{todayAttendance.check_out_time ? new Date(todayAttendance.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
                            </div>
                            <div style={{ background: 'white', padding: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Work Hours</div>
                                <div style={{ fontWeight: '600', fontSize: '18px' }}>{todayAttendance.work_hours || '0'} hrs</div>
                            </div>
                            <div style={{ background: 'white', padding: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Status</div>
                                <div style={{ fontWeight: '600', fontSize: '18px', color: '#059669' }}>{todayAttendance.status}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Attendance History</span>
                        <div className="search-input-wrapper">
                            <FiSearch className="search-icon" />
                            <input className="search-input" placeholder="Search Date..." />
                        </div>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Duration</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.slice(0, 10).map((record) => (
                                <tr key={record.id}>
                                    <td style={{ fontWeight: '500' }}>{new Date(record.date).toLocaleDateString()}</td>
                                    <td>
                                        {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td>
                                        {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td style={{ color: '#374151' }}>{record.work_hours || '0'} hrs</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            background: record.status === 'PRESENT' ? '#D1FAE5' : '#FEE2E2',
                                            color: record.status === 'PRESENT' ? '#065F46' : '#991B1B'
                                        }}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Attendance;
