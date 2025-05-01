import { useState } from 'react';
import { Home, Calendar, Award, Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const [activeItem, setActiveItem] = useState('Dashboard');
    const navigate = useNavigate();
    const { logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
        { name: 'Bookings', icon: <Calendar size={20} />, path: '/dashboard/bookings' },
        { name: 'Services', icon: <Award size={20} />, path: '/dashboard/services' },
        { name: 'Staff', icon: <Users size={20} />, path: '/dashboard/staff' },
    ];

    const handleLogout = () => {
        logout();
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h1>Tranquility</h1>
                <p>Nails & Spa</p>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.name}
                        className={activeItem === item.name ? 'active' : ''}
                        onClick={() => {
                            setActiveItem(item.name);
                            navigate(item.path);
                        }}
                    >
                        {item.icon}
                        {item.name}
                    </button>
                ))}
            </nav>
            <div className="sidebar-footer">
                <button onClick={handleLogout}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
