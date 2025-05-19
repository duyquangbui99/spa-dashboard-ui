import React, { useState } from 'react';
import TimeslotBookingsModal from '../../../components/TimeslotBookingsModal';
import BookingModal from '../../../components/BookingModal';

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
    categories,
    onSuccess
}) => {
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedBookingData, setSelectedBookingData] = useState(null);

    const handleTimeslotClick = (day, time) => {
        let slotBookings = getBookingsForSlot(day, time);

        // Filter bookings based on selected staff
        if (selectedStaff !== 'all') {
            slotBookings = slotBookings.filter(
                booking => booking.workerId?._id === selectedStaff
            );
        }

        const selectedDateTime = new Date(day);
        selectedDateTime.setHours(new Date(time).getHours(), new Date(time).getMinutes());
        const now = new Date();

        if (slotBookings.length === 0) {
            // Only check for past time when creating new bookings
            if (selectedDateTime < now) {
                // If the selected time is in the past, show an error message
                alert('Cannot book a time slot in the past');
                return;
            }
            // If no bookings for the selected staff, open the booking modal
            const year = day.getFullYear();
            const month = String(day.getMonth() + 1).padStart(2, '0');
            const date = String(day.getDate()).padStart(2, '0');
            setSelectedBookingData({
                date: `${year}-${month}-${date}`,
                time: formatTime(new Date(time))
            });
            setIsBookingModalOpen(true);
        } else {
            // If there are bookings for the selected staff, open the timeslot modal
            setSelectedDay(day);
            setSelectedTimeslot(time);
        }
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
                                                className={`booking-card ${serviceClass}${position.row > 0 ? ' stacked' : ''}`}
                                                style={{
                                                    height: position.height,
                                                    width: '98%',
                                                    left: '1%',
                                                    top: position.top,
                                                    position: 'absolute',
                                                    zIndex: position.zIndex,
                                                    backgroundColor: category ? category.color : 'var(--color-background)',
                                                    borderLeftColor: category ? category.color : 'var(--color-button-border)'
                                                }}
                                                title={`${booking.customerName} - ${serviceDisplay}`}
                                            >
                                                <div className="booking-header">
                                                    <span className="booking-time">{formatTime(booking.startTime)}</span>
                                                    <span className="booking-staff">{booking.workerId?.name || 'Unassigned'}</span>
                                                </div>
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

export default WeekView;
