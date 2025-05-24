import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axiosInstance';
import './Login.css';

const Login = () => {
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // ⬅️ Get previous location
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('/api/auth/login', { name, pin });
            const { role, workerId } = res.data;
            login(name, role, workerId); // sets isLoggedIn and role in context

            const redirectPath = location.state?.from?.pathname || '/dashboard'; // ⬅️ Use saved location or default
            navigate(redirectPath, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-background"></div>

            <div className="login-card">
                <div className="login-header">
                    <h1>Quang Bui</h1>
                    <p>Staff Management Portal</p>
                </div>
                <div className="login-form-container">
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <div className="input-icon">
                                <i className="user-icon"></i>
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-icon">
                                <i className="password-icon"></i>
                                <input
                                    type="password"
                                    placeholder="Enter your PIN"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    {error && <div className="error-message">{error}</div>}
                </div>
            </div>

            <div className="login-footer">
                <p>© 2025 Quang Management Project - Secure Staff Access</p>
            </div>
        </div>
    );
};

export default Login;
