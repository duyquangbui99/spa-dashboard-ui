import React, { useState } from 'react';
import TimeslotBookingsModal from '../../../components/TimeslotBookingsModal';
import BookingModal from '../../../components/BookingModal';

const MonthView = ({
    bookings,
    currentDate,
    selectedStaff,
    formatTime,
    getServiceClass,
    onEditBooking,
    onDeleteBooking,
    workers,
    categories,
    onSuccess
}) => {
    const [selectedDay, setSelectedDay] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedBookingData, setSelectedBookingData] = useState(null);

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

            // Get start of month
            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            monthStart.setHours(0, 0, 0, 0);

            // Get end of month
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);

            return bookingDate >= monthStart && bookingDate <= monthEnd;
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

    const handleDayClick = (day) => {
        const dayBookings = getBookingsForDay(day);
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

        if (dayBookings.length === 0) {
            // Only check for past time when creating new bookings
            if (day < now) {
                // If the selected day is in the past, show an error message
                alert('Cannot book a day in the past');
                return;
            }
            // If no bookings, open the booking modal
            const year = day.getFullYear();
            const month = String(day.getMonth() + 1).padStart(2, '0');
            const date = String(day.getDate()).padStart(2, '0');
            setSelectedBookingData({
                date: `${year}-${month}-${date}`
            });
            setIsBookingModalOpen(true);
        } else {
            // If there are bookings, open the timeslot modal
            setSelectedDay(day);
        }
    };

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
                    const cellClasses = `month-day-cell ${isToday(day) ? 'today' : ''} ${isCurrentMonth(day) ? 'current-month' : 'other-month'}`;

                    return (
                        <div
                            key={index}
                            className={cellClasses}
                            onClick={() => handleDayClick(day)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="month-day-number">
                                {day.getDate()}
                            </div>
                            {dayBookings.length > 0 && (() => {
                                // Use the first booking's category for color
                                let mainService = '';
                                if (dayBookings[0].serviceIds?.[0]?.name) {
                                    mainService = dayBookings[0].serviceIds[0].name;
                                } else if (dayBookings[0].services?.[0]?.serviceId) {
                                    if (typeof dayBookings[0].services[0].serviceId === 'object' && dayBookings[0].services[0].serviceId !== null) {
                                        mainService = dayBookings[0].services[0].serviceId.name || dayBookings[0].services[0].serviceId._id || '';
                                    } else {
                                        mainService = dayBookings[0].services[0].serviceId;
                                    }
                                }
                                const serviceClass = getServiceClass(mainService);
                                const category = categories.find(cat =>
                                    cat.name.toLowerCase() === serviceClass.replace(/-/g, ' ')
                                );
                                return (
                                    <div
                                        className={`month-booking-card summary ${serviceClass}`}
                                        style={{
                                            backgroundColor: category ? category.color : 'var(--color-background)',
                                            borderLeftColor: category ? category.color : 'var(--color-button-border)'
                                        }}
                                        title={dayBookings.map(b => `${formatTime(b.startTime)} - ${b.customerName || ''}`).join('\n')}
                                    >
                                        <div className="booking-summary-count">{dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}</div>
                                    </div>
                                );
                            })()}
                        </div>
                    );
                })}
            </div>
            <TimeslotBookingsModal
                isOpen={!!selectedDay}
                onClose={() => setSelectedDay(null)}
                bookings={selectedDay ? getBookingsForDay(selectedDay) : []}
                formatTime={formatTime}
                categories={categories}
                workers={workers}
                getServiceClass={getServiceClass}
                onEditBooking={onEditBooking}
                onDeleteBooking={onDeleteBooking}
            />

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => {
                    setIsBookingModalOpen(false);
                    setSelectedBookingData(null);
                }}
                initialData={selectedBookingData}
                onSuccess={() => {
                    setIsBookingModalOpen(false);
                    setSelectedBookingData(null);
                    // Refresh bookings
                    if (typeof onSuccess === 'function') {
                        onSuccess();
                    }
                }}
            />
        </div>
    );
};

export default MonthView;
