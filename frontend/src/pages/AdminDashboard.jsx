import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import AdminSidebar from '../components/AdminSidebar';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    FiUsers, FiClock, FiFileText, FiDollarSign
} from 'react-icons/fi';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        pendingLeaves: 0,
        activeToday: 0,
        totalSalary: 0
    });
    const [attendanceData, setAttendanceData] = useState([]);
    const [leaveData, setLeaveData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch employees
            const empResponse = await api.get('/employees');
            const employees = empResponse.data.data || [];
            console.log('Employees fetched:', employees.length); // Debug log

            // Fetch live attendance (use fallback if endpoint fails)
            let activeCount = 0;
            try {
                const liveResponse = await api.get('/attendance/live-status');
                const liveStatus = liveResponse.data.data || [];
                activeCount = liveStatus.filter(e => e.status === 'active').length;
            } catch (error) {
                console.log('Live status not available, using 0');
            }

            // Fetch pending leaves
            const leaveResponse = await api.get('/leaves/all-requests?status=PENDING');
            const pendingCount = leaveResponse.data.data?.length || 0;

            // Fetch all leaves for stats
            const allLeavesResponse = await api.get('/leaves/all-requests');
            const allLeaves = allLeavesResponse.data.data || [];

            // Calculate total salary
            const totalSalary = employees.reduce((sum, e) => sum + parseFloat(e.salary || 0), 0);
            console.log('Total salary:', totalSalary); // Debug log

            setStats({
                totalEmployees: employees.length,
                pendingLeaves: pendingCount,
                activeToday: activeCount,
                totalSalary: totalSalary
            });

            // Get real attendance data for last 7 days
            const attendanceTrend = [];
            const today = new Date();
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                try {
                    const dayResponse = await api.get(`/attendance/daily?date=${dateStr}`);
                    const dayData = dayResponse.data.data || [];
                    const presentCount = dayData.filter(a => a.status === 'PRESENT').length;
                    const absentCount = employees.length - presentCount;

                    attendanceTrend.push({
                        name: daysOfWeek[date.getDay()],
                        present: presentCount,
                        absent: absentCount
                    });
                } catch (error) {
                    // If no data for this day, add zeros
                    attendanceTrend.push({
                        name: daysOfWeek[date.getDay()],
                        present: 0,
                        absent: 0
                    });
                }
            }

            setAttendanceData(attendanceTrend);

            // Leave statistics
            const approved = allLeaves.filter(l => l.status === 'APPROVED').length;
            const rejected = allLeaves.filter(l => l.status === 'REJECTED').length;
            const pending = allLeaves.filter(l => l.status === 'PENDING').length;

            setLeaveData([
                { name: 'Approved', value: approved },
                { name: 'Rejected', value: rejected },
                { name: 'Pending', value: pending }
            ]);

            // Department distribution
            const deptCount = {};
            employees.forEach(emp => {
                const dept = emp.department || 'Unassigned';
                deptCount[dept] = (deptCount[dept] || 0) + 1;
            });

            const deptData = Object.keys(deptCount).map(dept => ({
                name: dept,
                count: deptCount[dept]
            }));
            setDepartmentData(deptData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    return (
        <div className="app-container">
            <AdminSidebar activePage="dashboard" />

            <main className="main-layout">
                <header className="main-header">
                    <div></div>
                    <div className="header-right"></div>
                </header>

                <div className="breadcrumb">
                    Home &gt; <span>Dashboard</span>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div className="card" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => navigate('/admin/employees')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
                                <FiUsers size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                                    Total Employees
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
                                    {stats.totalEmployees}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => navigate('/admin/attendance')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                                <FiClock size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                                    Active Today
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
                                    {stats.activeToday}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => navigate('/admin/leaves')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                                <FiFileText size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                                    Pending Leaves
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
                                    {stats.pendingLeaves}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => navigate('/admin/payroll')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                                <FiDollarSign size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>
                                    Total Payroll
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
                                    ₹{(stats.totalSalary / 1000).toFixed(0)}K
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                    {/* Attendance Trend */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
                            Weekly Attendance Trend
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                                    labelStyle={{ color: '#111827', fontWeight: '600' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} name="Present" />
                                <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} name="Absent" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Leave Statistics */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
                            Leave Requests Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={leaveData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {leaveData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
                        Department Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={departmentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '6px' }}
                                labelStyle={{ color: '#111827', fontWeight: '600' }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="#4F46E5" name="Employees" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
