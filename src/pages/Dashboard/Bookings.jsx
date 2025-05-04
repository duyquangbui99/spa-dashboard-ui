import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import './Bookings.css';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get('/api/bookings');
                setBookings(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) return <div className="booking-loading">Loading bookings...</div>;
    if (error) return <div className="booking-error">{error}</div>;

    return (
        <div className="bookings-container">
            <div className="bookings-header">
                <h2>All Bookings</h2>
                <button className="add-booking-btn">+ Add Booking</button>
            </div>
            <div className="bookings-grid">
                <div className="bookings-grid-header">
                    <span>Customer</span>
                    <span>Worker</span>
                    <span>Services</span>
                    <span>Time</span>
                    <span>Status</span>
                </div>
                {bookings.map((booking) => (
                    <div className="booking-row" key={booking._id}>
                        <span>{booking.customerName}</span>
                        <span>{booking.workerId?.name}</span>
                        <span>{booking.serviceIds.map(s => s.name).join(', ')}</span>
                        <span>{new Date(booking.startTime).toLocaleString()}</span>
                        <span className={`status ${booking.status}`}>{booking.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Bookings;
