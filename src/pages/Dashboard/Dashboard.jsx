import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { name, role } = useAuth();

    return (
        <>
            <div className="dashboard-header">
                <h2>Welcome, {name || 'User'}!</h2>
                <p className="user-role">Role: {role || 'N/A'}</p>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-card">
                    <h3>Quick Stats</h3>
                    <div className="dashboard-stats">
                        <div className="stat-item">
                            <span className="stat-value">28</span>
                            <span className="stat-label">Appointments</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">5</span>
                            <span className="stat-label">Staff Members</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">12</span>
                            <span className="stat-label">Services</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
