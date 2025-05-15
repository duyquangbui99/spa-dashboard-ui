import React from 'react';
import './TimeslotBookingsModal.css';

const TimeslotBookingsModal = ({ isOpen, onClose, bookings, formatTime, onEditBooking, onDeleteBooking }) => {
    if (!isOpen) return null;

    const handleEdit = (booking) => {
        onEditBooking(booking);
        onClose();
    };

    const handleDelete = async (bookingId) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            await onDeleteBooking(bookingId);
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="timeslot-modal-header">
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
                                            {booking.serviceIds
                                                ? booking.serviceIds.map(s => s.name).join(', ')
                                                : booking.services.map(s => {
                                                    let name = '';
                                                    if (typeof s.serviceId === 'object' && s.serviceId !== null) {
                                                        name = s.serviceId.name || s.serviceId._id || '[unknown]';
                                                    } else {
                                                        name = s.serviceId;
                                                    }
                                                    return `${name} x ${s.quantity || 1}`;
                                                }).join(', ')}
                                        </div>
                                        {booking.workerId && (
                                            <div className="booking-worker">
                                                Staff: {booking.workerId.name}
                                            </div>
                                        )}
                                        <div className="booking-actions">
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEdit(booking)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDelete(booking._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
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