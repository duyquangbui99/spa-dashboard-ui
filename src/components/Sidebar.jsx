import { useState, useEffect } from 'react';
import { Home, Calendar, Award, Users, LogOut, Menu, X, Newspaper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const [activeItem, setActiveItem] = useState('Dashboard');
    const [isMobileView, setIsMobileView] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Icons for menu items
    const menuItems = [
        { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
        { name: 'Bookings', icon: <Calendar size={20} />, path: '/dashboard/bookings' },
        { name: 'Services', icon: <Award size={20} />, path: '/dashboard/services' },
        { name: 'Staffs', icon: <Users size={20} />, path: '/dashboard/staffs' },
        { name: 'Posts', icon: <Newspaper size={20} />, path: '/dashboard/posts' },
    ];

    // Check if window is in mobile view on mount and when resized
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth <= 768);
            setMobileNavOpen(false); // Close mobile nav on resize
        };

        // Initial check
        checkMobileView();

        // Add event listener
        window.addEventListener('resize', checkMobileView);

        // Clean up
        return () => window.removeEventListener('resize', checkMobileView);
    }, []);

    const handleLogout = () => {
        logout();
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleMobileNav = () => {
        setMobileNavOpen(!mobileNavOpen);
    };

    const handleNavClick = (item) => {
        setActiveItem(item.name);
        navigate(item.path);
        if (isMobileView) {
            setMobileNavOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Navbar */}
            {isMobileView && (
                <div className="mobile-navbar">
                    <div className="mobile-navbar-header">
                        <h1>Management Project</h1>
                        <button className="mobile-menu-toggle" onClick={toggleMobileNav}>
                            {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Nav Menu */}
                    {mobileNavOpen && (
                        <div className="mobile-nav-menu">
                            {menuItems.map((item) => (
                                <button
                                    key={item.name}
                                    className={activeItem === item.name ? 'active' : ''}
                                    onClick={() => handleNavClick(item)}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </button>
                            ))}
                            <button onClick={handleLogout} className="mobile-logout-btn">
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Desktop Sidebar - Hidden on mobile */}
            {!isMobileView && (
                <div className="sidebar">
                    <div className="sidebar-header">
                        <h1>Management Project</h1>
                    </div>

                    <div className="sidebar-nav">
                        {menuItems.map((item) => (
                            <button
                                key={item.name}
                                className={activeItem === item.name ? 'active' : ''}
                                onClick={() => handleNavClick(item)}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="sidebar-footer">
                        <button onClick={handleLogout}>
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay for mobile view when nav is open */}
            {isMobileView && mobileNavOpen && (
                <div className="mobile-overlay" onClick={() => setMobileNavOpen(false)} />
            )}
        </>
    );
};

export default Sidebar;