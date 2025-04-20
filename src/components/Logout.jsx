import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        localStorage.removeItem('token'); // if you store it
        navigate('/login');
    };

    return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
