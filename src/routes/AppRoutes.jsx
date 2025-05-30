import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lazy, Suspense } from 'react';


const Home = lazy(() => import('../pages/Home/Home'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Login = lazy(() => import('../pages/Login/Login'));
const Bookings = lazy(() => import('../pages/Dashboard/Bookings'));
const Services = lazy(() => import('../pages/Dashboard/Services'));
const Staffs = lazy(() => import('../pages/Dashboard/Staffs'));
const Posts = lazy(() => import('../pages/Dashboard/Posts'));
const DashboardLayout = lazy(() => import('../pages/Dashboard/DashboardLayout'));


const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, loading } = useAuth();
    const location = useLocation();

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading...</p>
        </div>
    );

    if (!isLoggedIn) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
};

export default function AppRoutes() {
    const { loading } = useAuth();
    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading...</p>
        </div>
    );
    return (
        <Suspense fallback={
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading...</p>
            </div>
        }>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />            {/* /dashboard */}
                    <Route path="bookings" element={<Bookings />} />   {/* /dashboard/bookings */}
                    <Route path="services" element={<Services />} />   {/* /dashboard/services */}
                    <Route path="staffs" element={<Staffs />} />   {/* /dashboard/staffs */}
                    <Route path="posts" element={<Posts />} />   {/* /dashboard/posting */}
                </Route>
            </Routes>
        </Suspense>
    );
}
