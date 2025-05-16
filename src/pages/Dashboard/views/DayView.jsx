import React, { useState } from 'react';
import TimeslotBookingsModal from '../../../components/TimeslotBookingsModal';

const DayView = ({
    bookings,
    currentDate,
    selectedStaff,
    timeSlots,
    getBookingsForSlot,
    getBookingPosition,
    getServiceClass,
    formatTime,
    formatDateHeader,
    onEditBooking,
    onDeleteBooking,
    workers,
    categories
}) => {
    // Get unique staff members from bookings
    const getUniqueStaff = () => {
        const staffMap = new Map();
        bookings.forEach(booking => {
            if (booking.workerId && booking.workerId._id) {
                // Only add staff if selectedStaff is 'all' or matches the selected staff
                if (selectedStaff === 'all' || booking.workerId._id === selectedStaff) {
                    staffMap.set(booking.workerId._id, booking.workerId);
                }
            }
        });
        return Array.from(staffMap.values());
    };

    const getCurrentDayBookings = () => {
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.startTime);
            return (
                bookingDate.getDate() === currentDate.getDate() &&
                bookingDate.getMonth() === currentDate.getMonth() &&
                bookingDate.getFullYear() === currentDate.getFullYear()
            );
        });
    };

    const staffMembers = getUniqueStaff();
    const currentDayBookings = getCurrentDayBookings();

    // Filter bookings for a specific staff member
    const getStaffBookings = (timeSlot, staffId) => {
        let slotBookings = getBookingsForSlot(currentDate, timeSlot);
        // If a specific staff is selected, only show their bookings
        if (selectedStaff !== 'all') {
            return slotBookings.filter(booking => booking.workerId?._id === selectedStaff);
        }
        // Otherwise show bookings for the staff member in this column
        return slotBookings.filter(booking => booking.workerId?._id === staffId);
    };

    // Modal state
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);
    const [selectedStaffColumn, setSelectedStaffColumn] = useState(null);

    const handleTimeslotClick = (time, staffId) => {
        setSelectedTimeslot(time);
        setSelectedStaffColumn(staffId);
    };

    return (
        <div className="day-view-container">
            {currentDayBookings.length > 0 && (
                <div className="day-bookings-count">
                    <span className="count-number">{currentDayBookings.length}</span>
                    booking{currentDayBookings.length !== 1 ? 's' : ''} on {formatDateHeader(currentDate)}
                </div>
            )}
            <div className="day-view-table">
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
                                    <div
                                        className="day-view-slot"
                                        key={timeIndex}
                                        onClick={() => handleTimeslotClick(time, staff._id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {staffBookings.map((booking, bookingIndex) => {
                                            let mainService = '';
                                            let serviceDisplay = '';
                                            if (booking.serviceIds?.[0]?.name) {
                                                mainService = booking.serviceIds[0].name;
                                                serviceDisplay = booking.serviceIds.map(s => s.name).join(', ');
                                            } else if (booking.services?.[0]?.serviceId) {
                                                const worker = workers && (workers.find(w => w._id === (booking.workerId?._id || booking.workerId)));
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
                                            const position = getBookingPosition(booking, staffBookings);
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
                                                        zIndex: position.zIndex || (bookingIndex + 1),
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
            </div>
            <TimeslotBookingsModal
                isOpen={selectedTimeslot !== null}
                onClose={() => {
                    setSelectedTimeslot(null);
                    setSelectedStaffColumn(null);
                }}
                bookings={selectedTimeslot && selectedStaffColumn ? getStaffBookings(selectedTimeslot, selectedStaffColumn) : []}
                formatTime={formatTime}
                onEditBooking={onEditBooking}
                onDeleteBooking={onDeleteBooking}
            />
        </div>
    );
};

export default DayView;
