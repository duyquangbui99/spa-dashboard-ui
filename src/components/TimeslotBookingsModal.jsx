import React from 'react';
import './TimeslotBookingsModal.css';
import { Pencil, Trash2 } from 'lucide-react';

const TimeslotBookingsModal = ({ isOpen, onClose, bookings, formatTime, onEditBooking, onDeleteBooking, categories, workers }) => {
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

    const getServiceColor = (booking) => {
        if (!booking.services?.[0]?.serviceId) {
            return 'var(--color-accent)';
        }

        const service = booking.services[0].serviceId;

        // If service is an object with categoryId
        if (typeof service === 'object' && service.categoryId) {
            const category = categories.find(cat => cat._id === service.categoryId);
            if (category) {
                return category.color;
            }
        }

        return 'var(--color-accent)';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="timeslot-modal-content" onClick={e => e.stopPropagation()}>
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
                                <div
                                    key={booking._id}
                                    className="booking-item"
                                    style={{ borderLeft: `4px solid ${getServiceColor(booking)}` }}
                                >
                                    <div className="booking-time">
                                        {formatTime(booking.startTime)}
                                    </div>
                                    <div className="booking-details">
                                        <div className="booking-customer">
                                            <span className="customer-name">{booking.customerName}</span>
                                            {booking.customerPhone && (
                                                <span className="customer-phone">{booking.customerPhone}</span>
                                            )}
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
                                                className="icon-button edit-button"
                                                onClick={() => handleEdit(booking)}
                                                title="Edit booking"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                className="icon-button delete-button"
                                                onClick={() => handleDelete(booking._id)}
                                                title="Delete booking"
                                            >
                                                <Trash2 size={16} />
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