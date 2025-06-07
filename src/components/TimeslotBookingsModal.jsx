import React from 'react';
import './TimeslotBookingsModal.css';
import { Pencil, Trash2 } from 'lucide-react';

const TimeslotBookingsModal = ({ isOpen, onClose, bookings, formatTime, onEditBooking, onDeleteBooking, categories, workers, getServiceClass }) => {
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
        // Extract main service name using the same logic as WeekView
        let mainService = '';

        if (booking.serviceIds?.[0]?.name) {
            mainService = booking.serviceIds[0].name;
        } else if (booking.services?.[0]?.serviceId) {
            // Look up service names from worker
            const worker = workers.find(w => w._id === (booking.workerId?._id || booking.workerId));
            if (worker) {
                // Use the first service name for color
                if (typeof booking.services[0].serviceId === 'object' && booking.services[0].serviceId !== null) {
                    mainService = booking.services[0].serviceId.name || booking.services[0].serviceId._id || '';
                } else {
                    const svc = worker.services.find(ws => ws._id === booking.services[0].serviceId);
                    if (svc) mainService = svc.name;
                }
            } else {
                if (typeof booking.services[0].serviceId === 'object' && booking.services[0].serviceId !== null) {
                    mainService = booking.services[0].serviceId.name || booking.services[0].serviceId._id || '';
                } else {
                    mainService = booking.services[0].serviceId;
                }
            }
        }

        // Use the same logic as WeekView to get category color
        const serviceClass = getServiceClass(mainService);
        const category = categories.find(cat =>
            cat.name.toLowerCase() === serviceClass.replace(/-/g, ' ')
        );

        return category ? category.color : 'var(--color-accent)';
    };

    return (
        <div className="timeslot-modal-overlay" onClick={onClose}>
            <div className="timeslot-modal-content" onClick={e => e.stopPropagation()}>
                <div className="timeslot-modal-header">
                    <h2>Bookings for {formatTime(bookings[0]?.startTime)}</h2>
                    <button className="timeslot-close-button" onClick={onClose}>×</button>
                </div>
                <div className="timeslot-modal-body">
                    {bookings.length === 0 ? (
                        <p>No bookings for this time slot</p>
                    ) : (
                        <div className="timeslot-bookings-list">
                            {bookings.map(booking => (
                                <div
                                    key={booking._id}
                                    className="timeslot-booking-item"
                                    style={{
                                        borderLeft: `4px solid ${getServiceColor(booking)}`,
                                        backgroundColor: getServiceColor(booking)
                                    }}
                                >
                                    <div className="timeslot-booking-time">
                                        {formatTime(booking.startTime)}
                                    </div>
                                    <div className="timeslot-booking-details">
                                        <div className="timeslot-booking-customer">
                                            <span className="timeslot-customer-name">Customer: {booking.customerName}</span>
                                            {booking.customerPhone && (
                                                <span className="timeslot-customer-phone">Phone: {booking.customerPhone}</span>
                                            )}
                                        </div>
                                        <div className="timeslot-booking-service">
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
                                            <div className="timeslot-booking-worker">
                                                Staff: {booking.workerId.name}
                                            </div>
                                        )}
                                        <div className="timeslot-booking-actions">
                                            <button
                                                className="timeslot-icon-button timeslot-edit-button"
                                                onClick={() => handleEdit(booking)}
                                                title="Edit booking"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                className="timeslot-icon-button timeslot-delete-button"
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