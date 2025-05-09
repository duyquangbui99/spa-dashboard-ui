import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axiosInstance';
import './Login.css';

const Login = () => {
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post('/api/auth/login', { name, pin });

            const { role, workerId } = res.data;


            login(name, role, workerId); // sets isLoggedIn and role in context
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (

        <div className="login-page">
            <div className="login-background"></div>

            <div className="login-card">
                <div className="login-header">
                    <h1>Tranquility</h1>
                    <p>Nails & Spa</p>
                </div>
                <div className="login-form-container">
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <div className="input-icon">
                                <i className="user-icon"></i>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-icon">
                                <i className="password-icon"></i>
                                <input
                                    type="password"
                                    placeholder="PIN"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="login-button">
                            LOGIN
                        </button>
                    </form>

                    {error && <div className="error-message">{error}</div>}

                </div>
            </div>

            <div className="login-footer">
                <p>Tranquility Nails & Spa Staff Portal</p>
            </div>
        </div>
    );
};

export default Login;
