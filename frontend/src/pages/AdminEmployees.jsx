import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import AdminSidebar from '../components/AdminSidebar';
import ImportDialog from '../components/ImportDialog';
import {
    FiSearch, FiMoreVertical, FiGrid, FiList
} from 'react-icons/fi';

const AdminEmployees = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [liveStatus, setLiveStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Employees');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [showImportDialog, setShowImportDialog] = useState(false);

    useEffect(() => {
        fetchEmployees();
        if (activeTab === 'Live View') {
            fetchLiveStatus();
            const interval = setInterval(fetchLiveStatus, 30000); // Refresh every 30s
            return () => clearInterval(interval);
        }
    }, [activeTab]);

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

    const fetchLiveStatus = async () => {
        try {
            const response = await api.get('/attendance/live-status');
            setLiveStatus(response.data.data || []);
        } catch (error) {
            console.error('Error fetching live status:', error);
        }
    };

    const exportToCSV = () => {
        const dataToExport = activeTab === 'Live View' ? liveStatus : employees;

        if (dataToExport.length === 0) {
            alert('No data to export');
            return;
        }

        let csvContent = '';

        if (activeTab === 'Live View') {
            // Live view export
            csvContent = 'Employee ID,Name,Email,Department,Status,Check In,Check Out\n';
            dataToExport.forEach(emp => {
                csvContent += `${emp.employee_id || ''},${emp.first_name} ${emp.last_name},${emp.email || ''},${emp.department || ''},${emp.status || ''},${emp.check_in_time || ''},${emp.check_out_time || ''}\n`;
            });
        } else {
            // Employees export
            csvContent = 'Employee ID,Name,Email,Department,Designation,Phone,Salary\n';
            dataToExport.forEach(emp => {
                csvContent += `${emp.employee_id || ''},${emp.first_name} ${emp.last_name},${emp.email || ''},${emp.department || ''},${emp.designation || ''},${emp.phone || ''},${emp.salary || ''}\n`;
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${activeTab === 'Live View' ? 'live-status' : 'employees'}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredEmployees = employees.filter(emp =>
        emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLiveStatus = liveStatus.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="app-container">
            <AdminSidebar activePage="employees" />

            {/* Main Content */}
            <main className="main-layout">
                <header className="main-header">
                    <div></div>
                    <div className="header-right">
                        {/* Header cleared as per user request */}
                    </div>
                </header>

                <div className="breadcrumb">
                    Home &gt; <span>Employees</span>
                </div>

                <div className="card">
                    {/* Tabs */}
                    <div className="card-header" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <div className="btn-tab-group">
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
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="control-bar">
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div className="search-input-wrapper">
                                <FiSearch className="search-icon" />
                                <input
                                    className="search-input"
                                    placeholder="Search Employee"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {activeTab === 'Employees' && (
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                    <button
                                        className={`btn ${viewMode === 'table' ? 'btn-primary' : ''}`}
                                        onClick={() => setViewMode('table')}
                                        style={{ padding: '8px 12px', background: viewMode === 'table' ? '#4F46E5' : 'white', color: viewMode === 'table' ? 'white' : '#6B7280', border: '1px solid #E5E7EB' }}
                                    >
                                        <FiList />
                                    </button>
                                    <button
                                        className={`btn ${viewMode === 'card' ? 'btn-primary' : ''}`}
                                        onClick={() => setViewMode('card')}
                                        style={{ padding: '8px 12px', background: viewMode === 'card' ? '#4F46E5' : 'white', color: viewMode === 'card' ? 'white' : '#6B7280', border: '1px solid #E5E7EB' }}
                                    >
                                        <FiGrid />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="btn-group">
                            <button className="btn btn-primary" onClick={exportToCSV}>
                                Export CSV
                            </button>
                            <button className="btn btn-primary" onClick={() => navigate('/employees/create')}>
                                Add Employees
                            </button>
                            <button className="btn btn-primary" onClick={() => setShowImportDialog(true)}>
                                Import Employees
                            </button>
                        </div>
                    </div>

                    {/* Content based on active tab */}
                    {activeTab === 'Employees' && (
                        <>
                            {viewMode === 'table' ? (
                                // Table View
                                <div className="table-container">
                                    {loading ? (
                                        <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>Loading employees...</div>
                                    ) : filteredEmployees.length === 0 ? (
                                        <div style={{ padding: '48px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '16px', color: '#6B7280', marginBottom: '8px' }}>
                                                {searchTerm ? 'No employees found matching your search' : 'No employees added yet'}
                                            </div>
                                            {!searchTerm && (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => navigate('/employees/create')}
                                                    style={{ marginTop: '16px' }}
                                                >
                                                    Add Your First Employee
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Department</th>
                                                    <th>Designation</th>
                                                    <th>Phone</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredEmployees.map((employee) => (
                                                    <tr key={employee.id} onClick={() => navigate(`/employees/${employee.id}`)} style={{ cursor: 'pointer' }}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontWeight: 'bold', fontSize: '12px' }}>
                                                                    {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                                                                </div>
                                                                <span>{employee.first_name} {employee.last_name}</span>
                                                            </div>
                                                        </td>
                                                        <td>{employee.email}</td>
                                                        <td>{employee.department || 'N/A'}</td>
                                                        <td>{employee.designation || 'N/A'}</td>
                                                        <td>{employee.phone || 'N/A'}</td>
                                                        <td>
                                                            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); }}>
                                                                <FiMoreVertical />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            ) : (
                                // Card View
                                <div style={{ padding: '24px' }}>
                                    {loading ? (
                                        <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>Loading employees...</div>
                                    ) : filteredEmployees.length === 0 ? (
                                        <div style={{ padding: '48px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '16px', color: '#6B7280', marginBottom: '8px' }}>
                                                {searchTerm ? 'No employees found matching your search' : 'No employees added yet'}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                                            {filteredEmployees.map((employee) => (
                                                <div
                                                    key={employee.id}
                                                    onClick={() => navigate(`/employees/${employee.id}`)}
                                                    style={{
                                                        background: 'white',
                                                        border: '1px solid #E5E7EB',
                                                        borderRadius: '8px',
                                                        padding: '24px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontWeight: 'bold', fontSize: '20px', marginBottom: '16px' }}>
                                                            {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                                                        </div>
                                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                                                            {employee.first_name} {employee.last_name}
                                                        </h3>
                                                        <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                                                            {employee.designation || 'No designation'}
                                                        </div>
                                                        <div style={{ width: '100%', padding: '12px 0', borderTop: '1px solid #E5E7EB', marginTop: '12px' }}>
                                                            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Department</div>
                                                            <div style={{ fontSize: '13px', color: '#111827', fontWeight: '500' }}>
                                                                {employee.department || 'Not assigned'}
                                                            </div>
                                                        </div>
                                                        <div style={{ width: '100%', padding: '12px 0', borderTop: '1px solid #E5E7EB' }}>
                                                            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Email</div>
                                                            <div style={{ fontSize: '13px', color: '#111827', wordBreak: 'break-all' }}>
                                                                {employee.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'Live View' && (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Department</th>
                                        <th>Status</th>
                                        <th>Check In</th>
                                        <th>Check Out</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLiveStatus.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>
                                                No employee data available
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLiveStatus.map((emp) => (
                                            <tr key={emp.employeeId}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: emp.status === 'active' ? '#D1FAE5' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: emp.status === 'active' ? '#10B981' : '#6B7280', fontWeight: 'bold', fontSize: '12px' }}>
                                                            {emp.name?.split(' ')[0]?.charAt(0)}{emp.name?.split(' ')[1]?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '500' }}>{emp.name}</div>
                                                            <div style={{ fontSize: '12px', color: '#6B7280' }}>#{emp.employeeNumber}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{emp.department}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        background: emp.status === 'active' ? '#D1FAE5' : '#F3F4F6',
                                                        color: emp.status === 'active' ? '#10B981' : '#6B7280'
                                                    }}>
                                                        {emp.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                                                    </span>
                                                </td>
                                                <td>{emp.checkInTime || '-'}</td>
                                                <td>{emp.checkOutTime || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Import Dialog */}
            {showImportDialog && (
                <ImportDialog
                    onClose={() => setShowImportDialog(false)}
                    onSuccess={() => {
                        fetchEmployees();
                        setShowImportDialog(false);
                    }}
                />
            )}
        </div>
    );
};

export default AdminEmployees;
