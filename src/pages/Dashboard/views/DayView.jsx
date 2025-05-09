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
    // Get unique staff members from bookings
    const getUniqueStaff = () => {
        const staffMap = new Map();
        bookings.forEach(booking => {
            if (booking.workerId && booking.workerId._id) {
                staffMap.set(booking.workerId._id, booking.workerId);
            }
        });
        return Array.from(staffMap.values());
    };

    const staffMembers = getUniqueStaff();

    // Filter bookings for a specific staff member
    const getStaffBookings = (timeSlot, staffId) => {
        let slotBookings = getBookingsForSlot(currentDate, timeSlot);
        return slotBookings.filter(booking => booking.workerId?._id === staffId);
    };

    return (
        <div className="day-view-container">
            <div className="day-view-header">
                <div className="day-view-time-header">Time</div>
                {staffMembers.map(staff => (
                    <div key={staff._id} className="day-view-staff-header">
                        {staff.name}
                    </div>
                ))}
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

                {staffMembers.map(staff => (
                    <div key={staff._id} className="day-view-staff-column">
                        {timeSlots.map((time, timeIndex) => {
                            const staffBookings = getStaffBookings(time, staff._id);

                            staffBookings.forEach((booking, index) => {
                                const position = getBookingPosition(booking, staffBookings);
                                booking.row = position.row;
                            });

                            return (
                                <div className="day-view-slot" key={timeIndex}>
                                    {staffBookings.map((booking, bookingIndex) => {
                                        const mainService = booking.serviceIds[0]?.name || '';
                                        const serviceClass = getServiceClass(mainService);
                                        const position = getBookingPosition(booking, staffBookings);

                                        return (
                                            <div
                                                key={booking._id}
                                                className={`day-view-booking-card ${serviceClass}`}
                                                style={{
                                                    height: position.height,
                                                    width: 'calc(98% - 16px)',
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
                ))}
            </div>
        </div>
    );
};

export default DayView;
