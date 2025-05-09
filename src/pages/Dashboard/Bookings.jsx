import React, { useCallback, useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import './Bookings.css';
import WeekView from './views/WeekView';
import DayView from './views/DayView';
import MonthView from './views/MonthView';

import BookingModal from '../../components/BookingModal';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // week, day, month
    const [selectedStaff, setSelectedStaff] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    //Get start and end dates for the current view
    const getStartAndEndDates = useCallback(() => {
        const start = new Date(currentDate);
        const end = new Date(currentDate);

        if (viewMode === 'month') {
            start.setMonth(start.getMonth() - 6); // 6 months before
            start.setDate(1); // start of that month
            start.setHours(0, 0, 0, 0);

            end.setMonth(end.getMonth() + 6); // 6 months after
            end.setDate(0); // end of that month
            end.setHours(23, 59, 59, 999);
        } else {  //for day and week view
            start.setDate(start.getDate() - 14); // 2 weeks before
            start.setHours(0, 0, 0, 0);

            end.setMonth(end.getMonth() + 3); // 3 months after
            end.setHours(23, 59, 59, 999);
        }

        return {
            start: start.toISOString(),
            end: end.toISOString()
        };
    }, [currentDate, viewMode]);


    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { start, end } = getStartAndEndDates();
                const res = await axios.get(`/api/bookings/range?start=${start}&end=${end}`);

                console.log(start, end)
                // Ensure all bookings have valid Date objects
                const normalizedBookings = res.data.map(booking => {
                    // Create a proper Date object from the startTime string
                    const startTimeDate = new Date(booking.startTime);

                    // Make sure we have a valid date before proceeding
                    if (isNaN(startTimeDate.getTime())) {
                        console.error('Invalid date found:', booking.startTime);
                    }

                    startTimeDate.toLocaleString();


                    return {
                        ...booking,
                        // Store the original UTC date string for reference
                        originalStartTime: booking.startTime,
                        // Store the parsed Date object
                        startTime: startTimeDate
                    };
                });

                setBookings(normalizedBookings);
                console.log('Normalized bookings:', normalizedBookings);
            } catch (err) {
                console.error(err);
                setError('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [getStartAndEndDates]);


    // Get start of the week (Monday)
    const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    };

    // Format date as "Monday, 27 Apr 2025"
    const formatDateHeader = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format short date as "Mon 27"
    const formatShortDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric'
        });
    };

    // Format time as "9:00 AM"
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Get worker initials
    /*const getInitials = (name) => {
        if (!name) return '';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };*/

    // Get service class for styling
    const getServiceClass = (serviceName) => {
        if (!serviceName) return '';
        return serviceName.toLowerCase().replace(/[\s-]+/g, '-');
    };

    // Generate time slots for the calendar
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 20; hour++) {
            slots.push(new Date(currentDate).setHours(hour, 0, 0, 0));
        }
        return slots;
    };

    // Generate days for the week view
    const generateWeekDays = () => {
        const weekStart = getWeekStart(currentDate);
        const days = [];
        for (let i = 0; i < 7; i++) { // Monday to Sunday
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            days.push(day);
        }
        return days;
    };

    // Modified getBookingsForSlot function to correctly handle local time
    const getBookingsForSlot = (day, timeSlot) => {
        // Create a date object for the day and hour in local time
        const slotDate = new Date(day);
        const slotHour = new Date(timeSlot).getHours();
        slotDate.setHours(slotHour, 0, 0, 0);

        // Create an end date for the slot
        const slotEndDate = new Date(slotDate);
        slotEndDate.setHours(slotHour + 1, 0, 0, 0);

        return bookings.filter(booking => {
            // Make sure we have a valid date object
            if (!booking.startTime || !(booking.startTime instanceof Date)) {
                console.error('Invalid booking date:', booking);
                return false;
            }

            try {
                // Compare using local date components
                return (
                    booking.startTime.getDate() === slotDate.getDate() &&
                    booking.startTime.getMonth() === slotDate.getMonth() &&
                    booking.startTime.getFullYear() === slotDate.getFullYear() &&
                    booking.startTime.getHours() === slotHour
                );
            } catch (err) {
                console.error('Error comparing dates:', err, booking);
                return false;
            }
        });
    };

    // Calculate booking card height based on duration
    const getBookingHeight = (duration) => {
        // Each time slot is 100px height
        const slotHeight = 100;
        // Calculate height based on duration in hours
        return (duration / 60) * slotHeight;
    };

    // Calculate booking position and size
    const getBookingPosition = (booking, allBookings) => {
        // Find overlapping bookings
        const overlappingBookings = allBookings.filter(b => {
            const bookingStart = booking.startTime.getTime();
            const bookingEnd = new Date(booking.startTime.getTime() + booking.duration * 60000).getTime();
            const bStart = b.startTime.getTime();
            const bEnd = new Date(b.startTime.getTime() + b.duration * 60000).getTime();

            return (bookingStart < bEnd && bookingEnd > bStart);
        });

        // Find the first available row
        const usedRows = overlappingBookings
            .filter(b => b._id !== booking._id)
            .map(b => b.row)
            .filter(row => row !== undefined);

        let row = 0;
        while (usedRows.includes(row)) {
            row++;
        }

        // Calculate height based on duration and position
        const baseHeight = getBookingHeight(booking.duration);
        const totalOverlapping = Math.max(...usedRows, row) + 1;
        const adjustedHeight = baseHeight / totalOverlapping;

        return {
            top: `${row * adjustedHeight}px`,
            height: `${adjustedHeight}px`,
            row
        };
    };


    // Navigate to previous/next week
    const navigatePrevious = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() - 7);
        } else if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() - 1);
        }
        setCurrentDate(newDate);
    };

    const navigateNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    // Get unique staff from bookings
    const getUniqueStaff = () => {
        const staffMap = {};
        bookings.forEach(booking => {
            if (booking.workerId && booking.workerId._id) {
                staffMap[booking.workerId._id] = booking.workerId.name;
            }
        });
        return Object.entries(staffMap).map(([id, name]) => ({ _id: id, name }));
    };

    if (loading) return (
        <div className="booking-loading">
            <div>Loading bookings...</div>
        </div>
    );

    if (error) return (
        <div className="booking-error">
            <div>{error}</div>
        </div>
    );

    const timeSlots = generateTimeSlots();
    const weekDays = generateWeekDays();
    const staff = getUniqueStaff();

    return (
        <div className="bookings-container">
            <div className="bookings-header">
                <h2>Booking Calendar</h2>
            </div>

            <div className="controls-wrapper">
                <div className="date-navigation">
                    <button className="nav-btn" onClick={navigatePrevious}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                        </svg>
                    </button>
                    <div className="date-display">
                        {viewMode === 'week' ? (
                            `Week of ${getWeekStart(currentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        ) : viewMode === 'day' ? (
                            formatDateHeader(currentDate)
                        ) : (
                            currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        )}
                    </div>
                    <button className="nav-btn" onClick={navigateNext}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </button>
                </div>

                <div className="view-options">
                    <button
                        className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
                        onClick={() => setViewMode('day')}
                    >
                        Day
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
                        onClick={() => setViewMode('week')}
                    >
                        Week
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
                        onClick={() => setViewMode('month')}
                    >
                        Month
                    </button>
                </div>

                <div className="staff-dropdown">
                    <select
                        value={selectedStaff}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                    >
                        <option value="all">All Staff</option>
                        {staff.map(worker => (
                            <option key={worker._id} value={worker._id}>
                                {worker.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button className="add-booking-btn" onClick={() => setIsModalOpen(true)}>
                    + Add Booking
                </button>
            </div>

            <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            {/* Week view */}
            {viewMode === 'week' && (
                <WeekView
                    bookings={bookings}
                    currentDate={currentDate}
                    selectedStaff={selectedStaff}
                    timeSlots={timeSlots}
                    weekDays={weekDays}
                    getBookingsForSlot={getBookingsForSlot}
                    getBookingPosition={getBookingPosition}
                    getServiceClass={getServiceClass}
                    formatTime={formatTime}
                    formatShortDate={formatShortDate}
                />
            )}
            {/* Day view */}
            {viewMode === 'day' && (
                <DayView
                    bookings={bookings}
                    currentDate={currentDate}
                    selectedStaff={selectedStaff}
                    timeSlots={timeSlots}
                    getBookingsForSlot={getBookingsForSlot}
                    getBookingPosition={getBookingPosition}
                    getServiceClass={getServiceClass}
                    formatTime={formatTime}
                    formatDateHeader={formatDateHeader}
                />
            )}
            {/* Month view */}
            {viewMode === 'month' && (
                <MonthView
                    bookings={bookings}
                    currentDate={currentDate}
                    selectedStaff={selectedStaff}
                    formatTime={formatTime}
                />
            )}

            <div className="service-labels">
                <div className="service-label">
                    <div className="service-color gel-x"></div>
                    <span>Gel X</span>
                </div>
                <div className="service-label">
                    <div className="service-color full-set"></div>
                    <span>Full-Set</span>
                </div>
                <div className="service-label">
                    <div className="service-color massage"></div>
                    <span>Massage</span>
                </div>
                <div className="service-label">
                    <div className="service-color hair-coloring"></div>
                    <span>Hair Coloring</span>
                </div>
                <div className="service-label">
                    <div className="service-color beard-grooming"></div>
                    <span>Beard Grooming</span>
                </div>
                <div className="service-label">
                    <div className="service-color blow-dry"></div>
                    <span>Blow Dry</span>
                </div>
            </div>
        </div>
    );
};

export default Bookings;