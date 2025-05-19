import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Outlet } from 'react-router-dom'; // 🔥 Add this

const DashboardLayout = () => {
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth <= 1200);
        };

        checkMobileView();
        window.addEventListener('resize', checkMobileView);
        return () => window.removeEventListener('resize', checkMobileView);
    }, []);

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className={`main-content ${isMobileView ? 'mobile-view' : ''}`}>
                <Outlet /> {/* 🔥 This is where nested routes like <Dashboard /> and <Bookings /> render */}
            </div>
        </div>
    );
};

export default DashboardLayout;
