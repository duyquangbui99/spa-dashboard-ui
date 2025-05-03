import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';


const DashboardLayout = ({ children }) => {
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth <= 768);
        };

        checkMobileView();
        window.addEventListener('resize', checkMobileView);
        return () => window.removeEventListener('resize', checkMobileView);
    }, []);

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className={`main-content ${isMobileView ? 'mobile-view' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;
