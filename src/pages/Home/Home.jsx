import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Welcome Home</h1>
                <p className="text-gray-700 mb-6 text-center">
                    This is the home page of your React application. Use the button below to navigate to the dashboard.
                </p>
                <div className="flex justify-center">
                    <Link
                        to="/dashboard"
                        className="px-4 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;