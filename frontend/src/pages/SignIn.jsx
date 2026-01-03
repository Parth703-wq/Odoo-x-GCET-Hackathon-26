import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';

const SignIn = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

        const result = await login(formData.email, formData.password);

        if (result.success) {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData.role === 'ADMIN' || userData.role === 'HR') {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6' }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#4F46E5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '24px', margin: '0 auto 16px' }}>D</div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Dayflow HRMS</h1>
                    <p style={{ color: '#6B7280' }}>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    {error && <div style={{ padding: '12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>Email Address</label>
                        <div className="search-input-wrapper">
                            <FiMail className="search-icon" />
                            <input
                                type="email"
                                name="email"
                                className="search-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="name@company.com"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>Password</label>
                        <div className="search-input-wrapper">
                            <FiLock className="search-icon" />
                            <input
                                type="password"
                                name="password"
                                className="search-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ accentColor: '#4F46E5' }} /> Remember me
                        </label>
                        <a href="#" style={{ color: '#4F46E5', fontWeight: '600', textDecoration: 'none' }}>Forgot password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                        {loading ? 'Please wait...' : 'Sign In'} <FiArrowRight />
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
                    Don't have an account? <Link to="/signup" style={{ color: '#4F46E5', fontWeight: '600', textDecoration: 'none' }}>Create Company</Link>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
