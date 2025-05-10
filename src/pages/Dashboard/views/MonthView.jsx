import React from 'react';

const MonthView = ({
    bookings,
    currentDate,
    selectedStaff,
    formatTime,
    getServiceClass
}) => {
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Get the first day of the week (Monday)
        const firstDayOfWeek = new Date(firstDay);
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay() + (firstDayOfWeek.getDay() === 0 ? -6 : 1));

        // Get the last day of the week (Sunday)
        const lastDayOfWeek = new Date(lastDay);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + (7 - lastDayOfWeek.getDay()));

        const days = [];
        const currentDay = new Date(firstDayOfWeek);

        while (currentDay <= lastDayOfWeek) {
            days.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }

        return days;
    };

    const getBookingsForDay = (date) => {
        return bookings.filter(booking => {
            if (selectedStaff !== 'all' && booking.workerId?._id !== selectedStaff) {
                return false;
            }

            const bookingDate = new Date(booking.startTime);
            return (
                bookingDate.getDate() === date.getDate() &&
                bookingDate.getMonth() === date.getMonth() &&
                bookingDate.getFullYear() === date.getFullYear()
            );
        }).sort((a, b) => {
            // Sort by hours and minutes
            const aTime = a.startTime.getHours() * 60 + a.startTime.getMinutes();
            const bTime = b.startTime.getHours() * 60 + b.startTime.getMinutes();
            return aTime - bTime;
        });
    };

    const getCurrentMonthBookings = () => {
        return bookings.filter(booking => {
            if (selectedStaff !== 'all' && booking.workerId?._id !== selectedStaff) {
                return false;
            }
            const bookingDate = new Date(booking.startTime);
            return (
                bookingDate.getMonth() === currentDate.getMonth() &&
                bookingDate.getFullYear() === currentDate.getFullYear()
            );
        });
    };

    const isToday = (date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isCurrentMonth = (date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    const days = getDaysInMonth(currentDate);
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentMonthBookings = getCurrentMonthBookings();

    return (
        <div className="month-view-container">
            {currentMonthBookings.length > 0 && (
                <div className="month-bookings-count">
                    <span className="count-number">{currentMonthBookings.length}</span>
                    booking{currentMonthBookings.length !== 1 ? 's' : ''} in {currentDate.toLocaleString('default', { month: 'long' })}
                </div>
            )}
            <div className="month-view-grid">
                {weekDays.map(day => (
                    <div key={day} className="month-day-header">
                        {day}
                    </div>
                ))}

                {days.map((day, index) => {
                    const dayBookings = getBookingsForDay(day);
                    const cellClasses = [
                        'month-day-cell',
                        isCurrentMonth(day) ? 'current-month' : 'other-month',
                        isToday(day) ? 'today' : ''
                    ].filter(Boolean).join(' ');

                    return (
                        <div key={index} className={cellClasses}>
                            <div className="month-day-number">
                                {day.getDate()}
                            </div>
                            {dayBookings.map(booking => {
                                const mainService = booking.serviceIds[0]?.name || '';
                                const serviceClass = getServiceClass(mainService);

                                return (
                                    <div
                                        key={booking._id}
                                        className={`month-booking-card ${serviceClass}`}
                                        title={`${booking.customerName} - ${booking.serviceIds.map(s => s.name).join(', ')}`}
                                    >
                                        <div className="month-booking-time">
                                            {formatTime(booking.startTime)}
                                        </div>
                                        <div className="month-booking-customer">
                                            {booking.customerName}
                                        </div>
                                        <div className="month-booking-service">
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
    );
};

export default MonthView;
