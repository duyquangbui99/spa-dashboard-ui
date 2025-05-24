import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axiosInstance';
import './Dashboard.css';

const Dashboard = () => {
    const { name, role, workerId } = useAuth();
    const [todayStats, setTodayStats] = useState({
        appointments: 0,
        staffOff: [],
        upcomingAppointments: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Get today's date in UTC
                const today = new Date();
                console.log('Local today:', today.toLocaleString());

                // Set to start of day in local time
                const localStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
                console.log('Local start of day:', localStart.toLocaleString());

                // Convert to UTC
                const todayUTC = new Date(Date.UTC(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    0, 0, 0, 0
                ));
                console.log('UTC start of day:', todayUTC.toISOString());

                const tomorrowUTC = new Date(todayUTC);
                tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);
                console.log('UTC end of day:', tomorrowUTC.toISOString());

                // Fetch today's appointments
                let appointmentsRes;
                if (role === 'admin') {
                    appointmentsRes = await axios.get(`/api/bookings/range?start=${todayUTC.toISOString()}&end=${tomorrowUTC.toISOString()}`);
                } else {
                    appointmentsRes = await axios.get(`/api/bookings/worker/${workerId}/range?start=${todayUTC.toISOString()}&end=${tomorrowUTC.toISOString()}`);
                }

                // Filter to only local today
                const isTodayLocal = (date) => {
                    const now = new Date();
                    return (
                        date.getFullYear() === now.getFullYear() &&
                        date.getMonth() === now.getMonth() &&
                        date.getDate() === now.getDate()
                    );
                };
                const filteredAppointments = appointmentsRes.data.filter(booking =>
                    isTodayLocal(new Date(booking.startTime))
                );

                console.log('Today\'s appointments:', filteredAppointments.map(booking => ({
                    time: new Date(booking.startTime).toLocaleString(),
                    customer: booking.customerName
                })));

                // Fetch all workers
                const workersRes = await axios.get('/api/workers');

                // Get today's day name in local time
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const todayName = days[today.getDay()];

                // Find staff who are off today
                const staffOff = workersRes.data.filter(worker =>
                    !worker.workingDays?.includes(todayName)
                );

                // Get upcoming appointments (next 7 days)
                const nextWeekUTC = new Date(todayUTC);
                nextWeekUTC.setUTCDate(nextWeekUTC.getUTCDate() + 7);

                // Normalize the booking dates and convert to local time for display
                const normalizeBookings = (bookings) => {
                    return bookings.map(booking => {
                        const startTime = new Date(booking.startTime);
                        return {
                            ...booking,
                            startTime,
                            localTime: startTime.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })
                        };
                    });
                };

                const now = new Date();
                const upcomingToday = normalizeBookings(filteredAppointments)
                    .filter(booking => booking.startTime > now)
                    .sort((a, b) => a.startTime - b.startTime);

                console.log('Upcoming appointments:', upcomingToday.map(b => ({
                    time: b.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    customer: b.customerName
                })));

                setTodayStats({
                    appointments: filteredAppointments.length,
                    staffOff: staffOff,
                    upcomingAppointments: upcomingToday.slice(0, 5)
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [role, workerId]);

    if (loading) return <div className="dashboard-loading">Loading dashboard data...</div>;
    if (error) return <div className="dashboard-error">{error}</div>;

    const getWelcomeMessage = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const formatRole = (role) => {
        return role?.charAt(0).toUpperCase() + role?.slice(1) || 'Staff Member';
    };

    return (
        <>
            <div className="dashboard-header">
                <h2>{getWelcomeMessage()}, {name || 'User'}! 👋</h2>
                <p className="user-role">
                    {formatRole(role)} • {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            <div className="dashboard-content">
                <div className="dashboard-card">
                    <h3>📊 Today's Overview</h3>
                    <div className="dashboard-stats">
                        <div className="stat-item">
                            <span className="stat-value">{todayStats.appointments}</span>
                            <span className="stat-label">Appointments Today</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{todayStats.staffOff.length}</span>
                            <span className="stat-label">Staff Off Today</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{todayStats.upcomingAppointments.length}</span>
                            <span className="stat-label">Upcoming Today</span>
                        </div>
                    </div>
                </div>

                {todayStats.staffOff.length > 0 && (
                    <div className="dashboard-card">
                        <h3>🏠 Staff Off Today</h3>
                        <div className="staff-off-list">
                            {todayStats.staffOff.map(staff => (
                                <div key={staff._id} className="staff-off-item">
                                    <span className="staff-name">{staff.name}</span>
                                </div>
                            ))}
                        </div>
                        {todayStats.staffOff.length === 0 && (
                            <div className="no-appointments">All staff members are working today! 🎉</div>
                        )}
                    </div>
                )}

                <div className="dashboard-card">
                    <h3>⏰ Upcoming Appointments</h3>
                    <div className="upcoming-appointments">
                        {todayStats.upcomingAppointments.length === 0 ? (
                            <div className="no-appointments">
                                No upcoming appointments for today.
                                <br />
                                <small>Enjoy the peaceful moment! ✨</small>
                            </div>
                        ) : (
                            todayStats.upcomingAppointments.map(appointment => (
                                <div key={appointment._id} className="appointment-item">
                                    <div className="appointment-time">
                                        {appointment.localTime}
                                    </div>
                                    <div className="appointment-details">
                                        <span className="customer-name">
                                            👤 {appointment.customerName}
                                        </span>
                                        <span className="service-name">
                                            ✂️ {appointment.serviceIds?.[0]?.name || 'Service'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
