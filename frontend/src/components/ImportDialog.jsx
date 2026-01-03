import React, { useState } from 'react';
import { FiUpload, FiX, FiDownload, FiCheck, FiAlertCircle } from 'react-icons/fi';
import api from '../config/api';

const ImportDialog = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = ['.csv', '.xlsx', '.xls'];
            const fileExt = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
            if (!validTypes.includes(fileExt)) {
                alert('Please upload a CSV or Excel file');
                return;
            }
            setFile(selectedFile);
        }
    };

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const employees = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const emp = {};

            headers.forEach((header, index) => {
                const key = header.toLowerCase().replace(/\s+/g, '');
                emp[key] = values[index] || '';
            });

            // Map to expected format
            employees.push({
                firstName: emp.firstname || emp.first_name,
                lastName: emp.lastname || emp.last_name,
                email: emp.email,
                phone: emp.phone || emp.phonenumber,
                department: emp.department,
                designation: emp.designation || emp.position,
                salary: emp.salary ? parseFloat(emp.salary) : null,
                dateOfJoining: emp.dateofjoining || emp.joiningdate || new Date().toISOString().split('T')[0],
                address: emp.address,
                city: emp.city,
                state: emp.state,
                pinCode: emp.pincode || emp.pin_code,
                emergencyContact: emp.emergencycontact || emp.emergency_contact
            });
        }

        return employees;
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        setUploading(true);

        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const text = e.target.result;
                    const employees = parseCSV(text);

                    if (employees.length === 0) {
                        alert('No valid employee data found in file');
                        setUploading(false);
                        return;
                    }

                    // Send to backend
                    const response = await api.post('/import/employees', { employees });

                    setResults(response.data.data);
                    if (response.data.data.success.length > 0) {
                        onSuccess();
                    }
                } catch (error) {
                    alert(error.response?.data?.message || 'Error processing file');
                } finally {
                    setUploading(false);
                }
            };

            reader.readAsText(file);
        } catch (error) {
            alert('Error reading file');
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const template = `firstname,lastname,email,phone,department,designation,salary,dateofjoining,address,city,state,pincode,emergencycontact
John,Doe,john.doe@example.com,1234567890,Engineering,Software Engineer,50000,2024-01-01,123 Main St,New York,NY,10001,9876543210
Jane,Smith,jane.smith@example.com,9876543210,HR,HR Manager,60000,2024-01-01,456 Oak Ave,Los Angeles,CA,90001,1234567890`;

        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employee_import_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                        Import Employees
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                        <FiX size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {!results ? (
                        <>
                            {/* Template Download */}
                            <div style={{
                                background: '#F3F4F6',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '24px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <FiDownload style={{ color: '#4F46E5' }} />
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Need a template?</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                                    Download our CSV template with sample data to make importing easier.
                                </p>
                                <button
                                    onClick={downloadTemplate}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'white',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Download Template
                                </button>
                            </div>

                            {/* File Upload */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                                    Upload CSV File
                                </label>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px dashed #D1D5DB',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                />
                                {file && (
                                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#10B981' }}>
                                        ✓ Selected: {file.name}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={onClose}
                                    style={{
                                        padding: '10px 20px',
                                        background: 'white',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
                                    style={{
                                        padding: '10px 20px',
                                        background: file && !uploading ? '#4F46E5' : '#D1D5DB',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: file && !uploading ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <FiUpload />
                                    {uploading ? 'Importing...' : 'Import Employees'}
                                </button>
                            </div>
                        </>
                    ) : (
                        // Results Display
                        <div>
                            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: results.success.length > 0 ? '#D1FAE5' : '#FEE2E2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}>
                                    {results.success.length > 0 ? (
                                        <FiCheck size={32} color="#10B981" />
                                    ) : (
                                        <FiAlertCircle size={32} color="#EF4444" />
                                    )}
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                    Import Completed
                                </h3>
                                <p style={{ fontSize: '14px', color: '#6B7280' }}>
                                    {results.success.length} employees imported successfully
                                    {results.failed.length > 0 && `, ${results.failed.length} failed`}
                                </p>
                            </div>

                            {/* Success List */}
                            {results.success.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#10B981', marginBottom: '8px' }}>
                                        ✓ Successful ({results.success.length})
                                    </h4>
                                    <div style={{ maxHeight: '150px', overflow: 'auto', background: '#F9FAFB', padding: '12px', borderRadius: '6px' }}>
                                        {results.success.map((emp, idx) => (
                                            <div key={idx} style={{ fontSize: '13px', padding: '4px 0' }}>
                                                {emp.name} ({emp.email}) - ID: {emp.employeeId}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Failed List */}
                            {results.failed.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444', marginBottom: '8px' }}>
                                        ✗ Failed ({results.failed.length})
                                    </h4>
                                    <div style={{ maxHeight: '150px', overflow: 'auto', background: '#FEF2F2', padding: '12px', borderRadius: '6px' }}>
                                        {results.failed.map((emp, idx) => (
                                            <div key={idx} style={{ fontSize: '13px', padding: '4px 0' }}>
                                                {emp.email}: {emp.reason}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#4F46E5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportDialog;
