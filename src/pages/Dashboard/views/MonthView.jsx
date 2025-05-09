import React from 'react';

const MonthView = ({
    bookings,
    currentDate,
    selectedStaff,
    formatTime
}) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first and last day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    // Get day of week the first day lands on (0 = Sun, 1 = Mon, ...)
    const startDay = firstDayOfMonth.getDay();

    // Build array of all dates to render (including blank slots before month starts)
    const calendarDays = [];
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null); // Empty slots
    }

    for (let i = 1; i <= totalDays; i++) {
        calendarDays.push(new Date(year, month, i));
    }

    // Group bookings by date
    const getBookingsForDate = (date) => {
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.startTime);
            return (
                bookingDate.getFullYear() === date.getFullYear() &&
                bookingDate.getMonth() === date.getMonth() &&
                bookingDate.getDate() === date.getDate() &&
                (selectedStaff === 'all' || booking.workerId?._id === selectedStaff)
            );
        });
    };

    return (
        <div className="month-view-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div key={idx} className="month-day-header">{day}</div>
            ))}

            {calendarDays.map((date, idx) => (
                <div key={idx} className="month-day-cell">
                    {date && (
                        <>
                            <div className="month-day-number">{date.getDate()}</div>
                            <div className="month-bookings">
                                {getBookingsForDate(date).map(booking => (
                                    <div key={booking._id} className="month-booking-card">
                                        <strong>{formatTime(new Date(booking.startTime))}</strong>
                                        <div style={{ fontSize: '11px' }}>{booking.customerName}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MonthView;
