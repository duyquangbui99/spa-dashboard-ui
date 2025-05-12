import React, { useState } from 'react';
import TimeslotBookingsModal from '../../../components/TimeslotBookingsModal';

const WeekView = ({
    bookings,
    currentDate,
    selectedStaff,
    timeSlots,
    weekDays,
    getBookingsForSlot,
    getBookingPosition,
    getServiceClass,
    formatTime,
    formatShortDate,
    workers,
    onEditBooking,
    onDeleteBooking,
    categories
}) => {
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    const handleTimeslotClick = (day, time) => {
        setSelectedDay(day);
        setSelectedTimeslot(time);
    };

    const getCurrentWeekBookings = () => {
        return bookings.filter(booking => {
            if (selectedStaff !== 'all' && booking.workerId?._id !== selectedStaff) {
                return false;
            }
            const bookingDate = new Date(booking.startTime);
            const weekStart = weekDays[0];
            const weekEnd = weekDays[weekDays.length - 1];
            return bookingDate >= weekStart && bookingDate <= weekEnd;
        });
    };

    const currentWeekBookings = getCurrentWeekBookings();

    return (
        <div className="week-view-container">
            {currentWeekBookings.length > 0 && (
                <div className="week-bookings-count">
                    <span className="count-number">{currentWeekBookings.length}</span>
                    booking{currentWeekBookings.length !== 1 ? 's' : ''} this week
                </div>
            )}
            <div className="week-view-grid">
                <div className="time-column">
                    <div className="day-header">Time</div>
                    {timeSlots.map((time, index) => (
                        <div key={index} className="time-slot">
                            <span className="time-label">
                                {formatTime(new Date(time))}
                            </span>
                        </div>
                    ))}
                </div>

                {weekDays.map((day, dayIndex) => (
                    <div key={dayIndex} className="day-column">
                        <div className="day-header">
                            {formatShortDate(day)}
                        </div>
                        {timeSlots.map((time, timeIndex) => {
                            let slotBookings = getBookingsForSlot(day, time);

                            if (selectedStaff !== 'all') {
                                slotBookings = slotBookings.filter(
                                    booking => booking.workerId?._id === selectedStaff
                                );
                            }

                            slotBookings.forEach((booking, index) => {
                                const position = getBookingPosition(booking, slotBookings);
                                booking.row = position.row;
                            });

                            return (
                                <div
                                    className="day-time-slot"
                                    key={timeIndex}
                                    onClick={() => handleTimeslotClick(day, time)}
                                >
                                    {slotBookings.map((booking, bookingIndex) => {
                                        let mainService = '';
                                        let serviceDisplay = '';
                                        if (booking.serviceIds?.[0]?.name) {
                                            mainService = booking.serviceIds[0].name;
                                            serviceDisplay = booking.serviceIds.map(s => s.name).join(', ');
                                        } else if (booking.services?.[0]?.serviceId) {
                                            // Look up service names and quantities from worker
                                            const worker = workers.find(w => w._id === (booking.workerId?._id || booking.workerId));
                                            if (worker) {
                                                serviceDisplay = booking.services.map(s => {
                                                    let name = '';
                                                    if (typeof s.serviceId === 'object' && s.serviceId !== null) {
                                                        name = s.serviceId.name || s.serviceId._id || '[unknown]';
                                                    } else {
                                                        const svc = worker.services.find(ws => ws._id === s.serviceId);
                                                        name = svc ? svc.name : s.serviceId;
                                                    }
                                                    return `${name} x ${s.quantity || 1}`;
                                                }).join(', ');
                                                // Use the first service name for color
                                                let firstName = '';
                                                if (typeof booking.services[0].serviceId === 'object' && booking.services[0].serviceId !== null) {
                                                    firstName = booking.services[0].serviceId.name || booking.services[0].serviceId._id || '';
                                                } else {
                                                    const svc = worker.services.find(ws => ws._id === booking.services[0].serviceId);
                                                    if (svc) firstName = svc.name;
                                                }
                                                if (firstName) mainService = firstName;
                                            } else {
                                                serviceDisplay = booking.services.map(s => {
                                                    let name = '';
                                                    if (typeof s.serviceId === 'object' && s.serviceId !== null) {
                                                        name = s.serviceId.name || s.serviceId._id || '[unknown]';
                                                    } else {
                                                        name = s.serviceId;
                                                    }
                                                    return `${name} x ${s.quantity || 1}`;
                                                }).join(', ');
                                                if (typeof booking.services[0].serviceId === 'object' && booking.services[0].serviceId !== null) {
                                                    mainService = booking.services[0].serviceId.name || booking.services[0].serviceId._id || '';
                                                } else {
                                                    mainService = booking.services[0].serviceId;
                                                }
                                            }
                                        }
                                        const serviceClass = getServiceClass(mainService);
                                        const position = getBookingPosition(booking, slotBookings);
                                        const category = categories.find(cat =>
                                            cat.name.toLowerCase() === serviceClass.replace(/-/g, ' ')
                                        );

                                        return (
                                            <div
                                                key={booking._id}
                                                className={`booking-card ${serviceClass}`}
                                                style={{
                                                    height: position.height,
                                                    width: '98%',
                                                    left: '1%',
                                                    top: position.top,
                                                    position: 'absolute',
                                                    zIndex: bookingIndex + 1,
                                                    backgroundColor: category ? `${category.color}66` : 'var(--color-background)',
                                                    borderLeftColor: category ? category.color : 'var(--color-button-border)'
                                                }}
                                                title={`${booking.customerName} - ${serviceDisplay}`}
                                            >
                                                <div className="booking-time">{formatTime(booking.startTime)}</div>
                                                <div className="booking-customer">{booking.customerName}</div>
                                                <div className="booking-service">
                                                    {serviceDisplay}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <TimeslotBookingsModal
                isOpen={selectedTimeslot !== null}
                onClose={() => {
                    setSelectedTimeslot(null);
                    setSelectedDay(null);
                }}
                bookings={selectedTimeslot ? getBookingsForSlot(selectedDay, selectedTimeslot) : []}
                formatTime={formatTime}
                onEditBooking={onEditBooking}
                onDeleteBooking={onDeleteBooking}
            />
        </div>
    );
};

export default WeekView;
