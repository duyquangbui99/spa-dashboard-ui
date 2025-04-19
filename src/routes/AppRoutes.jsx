import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('../pages/Home/Home'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? children : <Navigate to="/" />;
};

export default function AppRoutes() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Suspense>
    );
}
