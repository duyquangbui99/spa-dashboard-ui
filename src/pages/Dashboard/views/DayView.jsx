import React from 'react';

const DayView = ({
    bookings,
    currentDate,
    selectedStaff,
    timeSlots,
    getBookingsForSlot,
    getBookingPosition,
    getServiceClass,
    formatTime,
    formatDateHeader
}) => {
    return (
        <div className="day-view-container">
            <div className="day-view-header">
                <div className="day-view-time-header">Time</div>
                <div className="day-view-date-header">
                    {formatDateHeader(currentDate)}
                </div>
            </div>

            <div className="day-view-content">
                <div className="day-view-time-column">
                    {timeSlots.map((time, index) => (
                        <div className="day-view-time-slot" key={index}>
                            <span className="day-view-time-label">
                                {formatTime(new Date(time))}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="day-view-main-column">
                    {timeSlots.map((time, timeIndex) => {
                        let slotBookings = getBookingsForSlot(currentDate, time);

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
                            <div className="day-view-slot" key={timeIndex}>
                                {slotBookings.map((booking, bookingIndex) => {
                                    const mainService = booking.serviceIds[0]?.name || '';
                                    const serviceClass = getServiceClass(mainService);
                                    const position = getBookingPosition(booking, slotBookings);

                                    return (
                                        <div
                                            key={booking._id}
                                            className={`day-view-booking-card ${serviceClass}`}
                                            style={{
                                                height: position.height,
                                                width: 'calc(98% - 16px)', // Adjusted for better spacing
                                                left: '1%',
                                                top: position.top,
                                                position: 'absolute',
                                                zIndex: bookingIndex + 1
                                            }}
                                            title={`${booking.customerName} - ${booking.serviceIds.map(s => s.name).join(', ')}`}
                                        >
                                            <div className="day-view-booking-time">
                                                {formatTime(booking.startTime)}
                                            </div>
                                            <div className="day-view-booking-customer">
                                                {booking.customerName}
                                            </div>
                                            <div className="day-view-booking-service">
                                                {booking.serviceIds.map(s => s.name).join(', ')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DayView;
