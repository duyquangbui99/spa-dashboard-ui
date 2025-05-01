import React from 'react';
import Sidebar from '../../components/Sidebar';
import './Dashboard.css'; // Make sure to create this file
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const { name, role } = useAuth();
    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-content">
                Dashboard content
                <h2>Welcome, {name || 'User'}!</h2>
                <p>Role: {role || 'N/A'}</p>
            </div>
        </div>
    );
};

export default Dashboard;
