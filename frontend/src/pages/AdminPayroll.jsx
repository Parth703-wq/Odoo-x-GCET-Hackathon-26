import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import AdminSidebar from '../components/AdminSidebar';
import {
    FiSearch, FiDollarSign, FiDownload
} from 'react-icons/fi';

const AdminPayroll = () => {
    const navigate = useNavigate();
    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenerateForm, setShowGenerateForm] = useState(false);
    const [formData, setFormData] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayrolls();
        fetchEmployees();
    }, []);

    const fetchPayrolls = async () => {
        try {
            const response = await api.get('/payroll/all');
            setPayrolls(response.data.data || []);
        } catch (error) {
            console.error('Error fetching payrolls:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleGeneratePayroll = async (e) => {
        e.preventDefault();

        if (!window.confirm(`Generate payroll for ${getMonthName(formData.month)} ${formData.year}?`)) {
            return;
        }

        try {
            await api.post('/payroll/generate', formData);
            alert('Payroll generated successfully!');
            setShowGenerateForm(false);
            fetchPayrolls();
        } catch (error) {
            alert(error.response?.data?.message || 'Error generating payroll');
        }
    };

    const getMonthName = (month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1];
    };

    const filteredPayrolls = payrolls.filter(p =>
        p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="app-container">
            <AdminSidebar activePage="payroll" />

            <main className="main-layout">
                <header className="main-header">
                    <div></div>
                    <div className="header-right"></div>
                </header>

                <div className="breadcrumb">
                    Home &gt; <span>Payroll</span>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                            Total Employees
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                            {employees.length}
                        </div>
                    </div>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                            This Month Salary
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: '#10B981' }}>
                            ₹{payrolls.filter(p => {
                                const date = new Date(p.created_at);
                                return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
                            }).reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                            Payrolls Generated
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: '#4F46E5' }}>
                            {payrolls.length}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">PAYROLL RECORDS</span>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowGenerateForm(!showGenerateForm)}
                            style={{ background: '#4F46E5', color: 'white', border: 'none' }}
                        >
                            <FiDollarSign /> Generate Payroll
                        </button>
                    </div>

                    {/* Generate Form */}
                    {showGenerateForm && (
                        <div style={{ padding: '24px', marginBottom: '24px', background: '#F9FAFB', borderRadius: '8px' }}>
                            <form onSubmit={handleGeneratePayroll} style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                                        Month
                                    </label>
                                    <select
                                        className="select-input"
                                        value={formData.month}
                                        onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                                        style={{ width: '100%' }}
                                    >
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                                        Year
                                    </label>
                                    <select
                                        className="select-input"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        style={{ width: '100%' }}
                                    >
                                        {[2024, 2025, 2026].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="btn" style={{ background: '#10B981', color: 'white', border: 'none' }}>
                                    Generate
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setShowGenerateForm(false)}
                                    style={{ background: 'white', border: '1px solid #D1D5DB' }}
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Search */}
                    <div className="control-bar">
                        <div className="search-input-wrapper">
                            <FiSearch className="search-icon" />
                            <input
                                className="search-input"
                                placeholder="Search by employee name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        {loading ? (
                            <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
                                Loading payroll records...
                            </div>
                        ) : filteredPayrolls.length === 0 ? (
                            <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
                                No payroll records found. Generate payroll to get started.
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Period</th>
                                        <th>Basic Salary</th>
                                        <th>Allowances</th>
                                        <th>Deductions</th>
                                        <th>Net Salary</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayrolls.map((payroll) => (
                                        <tr key={payroll.id}>
                                            <td>
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>
                                                        {payroll.first_name} {payroll.last_name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                                        {payroll.employee_id}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{getMonthName(payroll.month)} {payroll.year}</td>
                                            <td>₹{parseFloat(payroll.base_amount || 0).toLocaleString()}</td>
                                            <td>₹{parseFloat(payroll.total_allowances || 0).toLocaleString()}</td>
                                            <td>₹{parseFloat(payroll.total_deductions || 0).toLocaleString()}</td>
                                            <td style={{ fontWeight: '600', color: '#10B981' }}>
                                                ₹{parseFloat(payroll.net_salary || 0).toLocaleString()}
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    background: payroll.payment_status === 'PAID' ? '#D1FAE5' : '#FEF3C7',
                                                    color: payroll.payment_status === 'PAID' ? '#10B981' : '#F59E0B'
                                                }}>
                                                    {payroll.payment_status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => alert('Download payslip functionality')}
                                                    title="Download"
                                                >
                                                    <FiDownload />
                                                </button>
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

export default AdminPayroll;
