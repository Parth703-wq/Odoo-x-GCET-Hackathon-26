import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
    FiGrid, FiUsers, FiClock, FiFileText, FiSettings,
    FiSearch, FiMoreVertical, FiHelpCircle
} from 'react-icons/fi';

const AdminEmployees = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Employees');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="app-container">
            {/* Sidebar - Matching Reference */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)' }}></div>
                        <span>CuteHR</span>
                    </div>
                </div>

                <div className="sidebar-content">
                    {/* User Profile in Sidebar (Reference Style) */}
                    <div className="sidebar-profile">
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontWeight: 'bold' }}>
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#111827' }}>{user?.firstName} {user?.lastName}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>Centrovo</div>
                        </div>
                    </div>

                    <div className="nav-section-title">Your Apps</div>
                    <div className="nav-item">
                        <FiClock className="nav-icon" /> Timer
                    </div>
                    <div className="nav-item">
                        <FiGrid className="nav-icon" /> Projects
                    </div>
                    <div className="nav-item">
                        <FiFileText className="nav-icon" /> Reports
                    </div>

                    <div className="nav-section-title">Your Company</div>
                    <div className="nav-item active" onClick={() => navigate('/admin/employees')}>
                        <FiUsers className="nav-icon" /> Employees
                    </div>
                    <div className="nav-item">
                        <FiFileText className="nav-icon" /> Payroll
                    </div>
                    <div className="nav-item">
                        <FiUsers className="nav-icon" /> Applicant Tracking
                    </div>
                    <div className="nav-item">
                        <FiUsers className="nav-icon" /> Clients
                    </div>
                    <div className="nav-item">
                        <FiFileText className="nav-icon" /> Invoice
                    </div>
                    <div className="nav-item">
                        <FiClock className="nav-icon" /> Events
                    </div>
                    <div className="nav-item" onClick={() => navigate('/admin/dashboard')}>
                        <FiSettings className="nav-icon" /> Dashboard (View)
                    </div>

                    <div className="nav-section-title">Support</div>
                    <div className="nav-item">
                        <FiHelpCircle className="nav-icon" /> Knowledge Base
                    </div>

                    <div className="nav-item" style={{ marginTop: '20px', color: '#EF4444' }} onClick={logout}>
                        <FiSettings className="nav-icon" /> Logout
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-layout">
                {/* Top Header - Purple */}
                <header className="main-header">
                    <div></div> {/* Spacer */}
                    <div className="header-right">
                        {/* Header content cleared as per user request */}
                    </div>
                </header>

                <div className="breadcrumb">
                    Home &gt; <span>Employees</span>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">COMPANY EMPLOYEES</span>
                        <div className="btn-group">
                            <button
                                className={`btn-tab ${activeTab === 'Employees' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Employees')}
                            >
                                Employees
                            </button>
                            <button
                                className={`btn-tab ${activeTab === 'Live View' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Live View')}
                            >
                                Live View
                            </button>
                            <button
                                className={`btn-tab ${activeTab === 'Org Chart' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Org Chart')}
                            >
                                Org Chart
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="control-bar">
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div className="search-input-wrapper">
                                <FiSearch className="search-icon" />
                                <input
                                    className="search-input"
                                    placeholder="Search Employee"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select className="select-input">
                                <option>Active</option>
                            </select>
                        </div>
                        <div className="btn-group">
                            <button className="btn btn-primary" onClick={() => navigate('/employees/create')}>
                                Add Employees
                            </button>
                            <button className="btn btn-primary">
                                Import Employees
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>ID</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Contact</th>
                                <th>Requests</th>
                                <th>Hire Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((emp, index) => (
                                <tr key={emp.id}>
                                    <td>
                                        <b style={{ color: '#111827' }}>{index + 1}</b>
                                    </td>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="user-avatar-small" style={{ background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontWeight: 'bold' }}>
                                                {emp.first_name[0]}{emp.last_name[0]}
                                            </div>
                                            <a href="#" className="user-name-link" onClick={(e) => { e.preventDefault(); navigate(`/employees/${emp.id}`) }}>
                                                {emp.first_name} {emp.last_name}
                                            </a>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '500' }}>
                                        {emp.department || 'Admin'}
                                    </td>
                                    <td>
                                        <div className="contact-stack">
                                            <span className="contact-main">{emp.phone || '+1 404-233-7961'}</span>
                                            <span className="contact-sub">{emp.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {/* Mocking request badge for visual accuracy per reference */}
                                        <span className="request-badge">{(index % 3) + 1}</span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: '500', color: '#374151' }}>
                                            {emp.date_of_joining ? new Date(emp.date_of_joining).toISOString().split('T')[0] : '2019-06-06'}
                                        </span>
                                    </td>
                                    <td>
                                        <FiMoreVertical className="action-dots" />
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

export default AdminEmployees;
