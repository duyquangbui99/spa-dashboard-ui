import { useState, useEffect, useCallback, useMemo } from 'react';
import { Home, Calendar, Award, Users, LogOut, Menu, X, Newspaper } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Icons for menu items
    const menuItems = useMemo(() => [
        { name: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
        { name: 'Bookings', icon: <Calendar size={20} />, path: '/dashboard/bookings' },
        { name: 'Services', icon: <Award size={20} />, path: '/dashboard/services' },
        { name: 'Staffs', icon: <Users size={20} />, path: '/dashboard/staffs' },
        { name: 'Posts', icon: <Newspaper size={20} />, path: '/dashboard/posts' },
    ], []);

    // Function to determine active item based on current path
    const getActiveItemFromPath = useCallback((pathname) => {
        const currentItem = menuItems.find(item => item.path === pathname);
        return currentItem ? currentItem.name : 'Dashboard';
    }, [menuItems]);

    const [activeItem, setActiveItem] = useState(() => getActiveItemFromPath(location.pathname));
    const [isMobileView, setIsMobileView] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Update active item when location changes
    useEffect(() => {
        setActiveItem(getActiveItemFromPath(location.pathname));
    }, [location.pathname, getActiveItemFromPath]);

    // Check if window is in mobile view on mount and when resized
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth <= 1200);
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
                        <div className="mobile-logo-container">
                            <img src="/logo.svg" alt="BookSmart Logo" className="mobile-logo" />
                            <h1>Schedulo</h1>
                        </div>
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
                        <div className="logo-container">
                            <img src="/logo.svg" alt="Schedulo Logo" className="sidebar-logo" />
                            <h1>Schedulo</h1>
                        </div>
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