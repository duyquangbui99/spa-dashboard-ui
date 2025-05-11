import React from 'react';
import './TimeslotBookingsModal.css';

const TimeslotBookingsModal = ({ isOpen, onClose, bookings, formatTime }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Bookings for {formatTime(bookings[0]?.startTime)}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {bookings.length === 0 ? (
                        <p>No bookings for this time slot</p>
                    ) : (
                        <div className="bookings-list">
                            {bookings.map(booking => (
                                <div key={booking._id} className="booking-item">
                                    <div className="booking-time">
                                        {formatTime(booking.startTime)}
                                    </div>
                                    <div className="booking-details">
                                        <div className="booking-customer">
                                            {booking.customerName}
                                        </div>
                                        <div className="booking-service">
                                            {booking.serviceIds.map(s => s.name).join(', ')}
                                        </div>
                                        {booking.workerId && (
                                            <div className="booking-worker">
                                                Staff: {booking.workerId.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimeslotBookingsModal; 