import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiLock, FiBriefcase, FiArrowRight } from 'react-icons/fi';

const SignUp = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        companyName: '',
        companyLogo: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        dateOfJoining: new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        const result = await signup({
            companyName: formData.companyName,
            companyLogo: formData.companyLogo,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            dateOfJoining: formData.dateOfJoining
        });

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', padding: '40px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#4F46E5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '24px', margin: '0 auto 16px' }}>D</div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Create Company Account</h1>
                    <p style={{ color: '#6B7280' }}>Start managing your employees today</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    {error && <div style={{ padding: '12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                    <div style={{ paddingBottom: '20px', borderBottom: '1px solid #E5E7EB', marginBottom: '8px' }}>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>Company Name *</label>
                                <div className="search-input-wrapper">
                                    <FiBriefcase className="search-icon" />
                                    <input className="search-input" name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="Acme Inc." style={{ width: '100%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>First Name *</label>
                            <div className="search-input-wrapper">
                                <FiUser className="search-icon" />
                                <input className="search-input" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" style={{ width: '100%' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>Last Name *</label>
                            <div className="search-input-wrapper">
                                <FiUser className="search-icon" />
                                <input className="search-input" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" style={{ width: '100%' }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>Email Address *</label>
                        <div className="search-input-wrapper">
                            <FiMail className="search-icon" />
                            <input type="email" className="search-input" name="email" value={formData.email} onChange={handleChange} required placeholder="john@acme.com" style={{ width: '100%' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>Phone Number</label>
                        <div className="search-input-wrapper">
                            <FiPhone className="search-icon" />
                            <input type="tel" className="search-input" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" style={{ width: '100%' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>Password *</label>
                            <div className="search-input-wrapper">
                                <FiLock className="search-icon" />
                                <input type="password" className="search-input" name="password" value={formData.password} onChange={handleChange} required placeholder="Create password" style={{ width: '100%' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>Confirm Password *</label>
                            <div className="search-input-wrapper">
                                <FiLock className="search-icon" />
                                <input type="password" className="search-input" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm password" style={{ width: '100%' }} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '16px' }}>
                        {loading ? 'Creating Account...' : 'Get Started'} <FiArrowRight />
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
                    Already have an account? <Link to="/signin" style={{ color: '#4F46E5', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
