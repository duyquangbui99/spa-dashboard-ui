import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);
    const [name, setName] = useState(null);

    const login = (userName, userRole) => {
        setIsLoggedIn(true);
        setRole(userRole);
        setName(userName);
    };

    const logout = () => {
        localStorage.removeItem('token'); // optional: if you stored JWT
        setIsLoggedIn(false);
        setRole(null);
        setName(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, name, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
