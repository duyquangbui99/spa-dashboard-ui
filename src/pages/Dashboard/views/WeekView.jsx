import React from 'react';

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
    formatShortDate
}) => {
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
            <div className="calendar-grid">
                <div className="calendar-grid-scroll">
                    <div className="time-column">
                        <div className="day-header"></div>
                        {timeSlots.map((time, index) => (
                            <div className="time-slot" key={index}>
                                <span className="time-label">
                                    {formatTime(new Date(time))}
                                </span>
                            </div>
                        ))}
                    </div>

                    {weekDays.map((day, dayIndex) => (
                        <div className="day-column" key={dayIndex}>
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
                                    <div className="day-time-slot" key={timeIndex}>
                                        {slotBookings.map((booking, bookingIndex) => {
                                            const mainService = booking.serviceIds[0]?.name || '';
                                            const serviceClass = getServiceClass(mainService);
                                            const position = getBookingPosition(booking, slotBookings);

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
                                                        zIndex: bookingIndex + 1
                                                    }}
                                                >
                                                    <div className="booking-time">{formatTime(booking.startTime)}</div>
                                                    <div className="booking-customer">{booking.customerName}</div>
                                                    <div className="booking-service">
                                                        {booking.serviceIds.map(s => s.name).join(', ')}
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
            </div>
        </div>
    );
};

export default WeekView;
