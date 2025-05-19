import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);
    const [name, setName] = useState(null);
    const [workerId, setWorkerId] = useState(null);
    const [loading, setLoading] = useState(true); // add this

    const login = (userName, userRole, workerId) => {
        setIsLoggedIn(true);
        setRole(userRole);
        setName(userName);
        setWorkerId(workerId);
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setIsLoggedIn(false);
            setRole(null);
            setName(null);
            setWorkerId(null);
        }
    };
    useEffect(() => {
        const verifyUser = async () => {
            try {
                const res = await axios.get('/api/auth/verify');
                setIsLoggedIn(true);
                setRole(res.data.role);
                setName(res.data.name);
                if (res.data.workerId) setWorkerId(res.data.workerId);
            } catch (err) {
                setIsLoggedIn(false);
            } finally {
                setLoading(false); // mark as done
            }
        };

        verifyUser();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, name, role, workerId, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
