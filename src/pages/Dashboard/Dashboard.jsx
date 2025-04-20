import React from 'react';
import { Link } from 'react-router-dom';
import Logout from '../../components/Logout';

const Dashboard = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <header className="bg-blue-600 text-white p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <Link
                        to="/"
                        className="px-3 py-1 bg-blue-700 rounded hover:bg-blue-800 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </header>

            <main className="container mx-auto p-6 flex-grow">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Dashboard Overview</h2>
                    <p className="text-gray-600">
                        This is a simple dashboard component to test your React routing setup.
                        In a real application, you would display important metrics, widgets, and navigation here.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-medium text-lg mb-2 text-gray-800">Statistics Panel</h3>
                        <p className="text-gray-600">Placeholder for statistics and charts</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-medium text-lg mb-2 text-gray-800">Recent Activity</h3>
                        <p className="text-gray-600">Placeholder for activity feed</p>
                    </div>
                </div>
            </main>

            <Logout />

            <footer className="bg-gray-200 p-4 text-center text-gray-600">
                <p>Dashboard Footer • React Router Test</p>
            </footer>
        </div>
    );
};

export default Dashboard;