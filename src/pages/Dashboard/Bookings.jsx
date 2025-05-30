import React, { useCallback, useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import './Bookings.css';
import WeekView from './views/WeekView';
import DayView from './views/DayView';
import MonthView from './views/MonthView';
import { useAuth } from '../../context/AuthContext';

import BookingModal from '../../components/BookingModal';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // week, day, month
    const [selectedStaff, setSelectedStaff] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
    const [staffSearchTerm, setStaffSearchTerm] = useState('');
    const [editingBooking, setEditingBooking] = useState(null);
    const [allowBooking, setAllowBooking] = useState(true);
    const { role, workerId } = useAuth();
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

    // Add click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            const dropdown = document.querySelector('.staff-dropdown');
            if (dropdown && !dropdown.contains(event.target)) {
                setIsStaffDropdownOpen(false);
            }
        };

        if (isStaffDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isStaffDropdownOpen]);

    const fetchBookings = useCallback(async () => {
        try {
            const { start, end } = getStartAndEndDates();
            let res;

            if (role === 'admin') {
                res = await axios.get(`/api/bookings/range?start=${start}&end=${end}`);
            } else {
                res = await axios.get(`/api/bookings/worker/${workerId}/range?start=${start}&end=${end}`);
            }

            console.log(role, workerId);
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
    }, [getStartAndEndDates, role, workerId]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    useEffect(() => {
        // Fetch workers and categories for service name lookup
        const fetchData = async () => {
            try {
                const [workersRes, categoriesRes] = await Promise.all([
                    axios.get('/api/workers'),
                    axios.get('/api/service-categories')
                ]);
                setWorkers(workersRes.data);
                setCategories(categoriesRes.data);
            } catch (err) {
                console.error('Failed to fetch data', err);
            }
        };
        fetchData();
    }, []);

    // Get start of the week (Monday)
    const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    };

    // Format date as "Sat, May 10 2025"
    const formatDateHeader = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
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



    // Get service class for styling
    const getServiceClass = (serviceName) => {
        if (!serviceName || typeof serviceName !== 'string') {
            console.warn('Invalid serviceName:', serviceName);
            return '';
        }
        // First try to find an exact match
        for (const worker of workers) {
            const matchedService = worker.services.find(
                s => s.name.toLowerCase() === serviceName.toLowerCase()
            );

            if (matchedService) {
                const category = categories.find(cat => cat._id === matchedService.categoryId);
                if (category) {
                    return category.name.toLowerCase().replace(/\s+/g, '-');
                }
            }
        }

        // If no exact match, try partial matching
        for (const worker of workers) {
            const matchedService = worker.services.find(s => {
                const serviceWords = s.name.toLowerCase().split(/\s+/);
                const searchWords = serviceName.toLowerCase().split(/\s+/);
                // Check if all words in the search term are present in the service name
                return searchWords.every(word =>
                    serviceWords.some(serviceWord => serviceWord.includes(word) || word.includes(serviceWord))
                );
            });

            if (matchedService) {
                const category = categories.find(cat => cat._id === matchedService.categoryId);
                if (category) {
                    return category.name.toLowerCase().replace(/\s+/g, '-');
                }
            }
        }

        const fallback = serviceName.toLowerCase().replace(/\s+/g, '-').replace(/['"]/g, '');
        return fallback;
    };


    // Generate time slots for the calendar
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 20; hour++) {
            // Add the hour slot (e.g., 9:00)
            slots.push(new Date(currentDate).setHours(hour, 0, 0, 0));
            // Add the half-hour slot (e.g., 9:30)
            slots.push(new Date(currentDate).setHours(hour, 30, 0, 0));
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

    // Modified getBookingsForSlot function to only show bookings in their starting slot
    const getBookingsForSlot = (day, timeSlot) => {
        // Create a date object for the day and time in local time
        const slotDate = new Date(day);
        const slotTime = new Date(timeSlot);
        slotDate.setHours(slotTime.getHours(), slotTime.getMinutes(), 0, 0);

        // Create an end date for the slot (30 minutes later)
        const slotEndDate = new Date(slotDate);
        slotEndDate.setMinutes(slotDate.getMinutes() + 30);

        return bookings.filter(booking => {
            // Make sure we have a valid date object
            if (!booking.startTime || !(booking.startTime instanceof Date)) {
                console.error('Invalid booking date:', booking);
                return false;
            }

            try {
                // Only show bookings that start in this exact slot
                return (
                    booking.startTime.getTime() >= slotDate.getTime() &&
                    booking.startTime.getTime() < slotEndDate.getTime()
                );
            } catch (err) {
                console.error('Error comparing dates:', err, booking);
                return false;
            }
        }).sort((a, b) => {
            // Sort by start time
            return a.startTime.getTime() - b.startTime.getTime();
        });
    };


    // Calculate booking position and size
    const getBookingPosition = (booking, allBookings) => {
        // Sort all bookings in this slot by start time
        const sortedBookings = [...allBookings].sort((a, b) =>
            a.startTime.getTime() - b.startTime.getTime()
        );

        // Find the index of the current booking
        const index = sortedBookings.findIndex(b => b._id === booking._id);

        // Each booking is offset by 16px vertically
        const offset = index * 16;

        return {
            top: `${offset}px`,
            height: `70px`,
            row: index,
            zIndex: 10 + index // ensure later bookings are on top
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

    // Filter staff based on search term
    const filteredStaff = () => {
        const staff = getUniqueStaff();
        if (!staffSearchTerm) return staff;
        return staff.filter(worker =>
            worker.name.toLowerCase().includes(staffSearchTerm.toLowerCase())
        );
    };

    const handleEditBooking = (booking) => {
        setEditingBooking(booking);
        setIsModalOpen(true);
    };

    const handleDeleteBooking = async (bookingId) => {
        try {
            await axios.delete(`/api/bookings/${bookingId}`);
            // Refresh bookings after deletion
            fetchBookings();
        } catch (err) {
            console.error('Error deleting booking:', err);
            setError('Failed to delete booking');
        }
    };

    // Add dedicated click handler for mobile compatibility
    const handleToggleClick = async (e) => {
        console.log('Toggle clicked - Event type:', e.type, 'Allow booking current state:', allowBooking);
        e.preventDefault();
        e.stopPropagation();

        try {
            const newValue = !allowBooking;
            console.log('Attempting to set allow booking to:', newValue);
            await axios.put('/api/setting/allowbooking', { allowBooking: newValue });
            setAllowBooking(newValue);
            console.log('Successfully updated allow booking to:', newValue);
            // Broadcast the change to other components
            window.dispatchEvent(new CustomEvent('allowBookingChanged', { detail: { allowBooking: newValue } }));
        } catch (err) {
            console.error('Failed to update allow booking setting:', err);
        }
    };

    // Add touch handler for mobile devices
    const handleToggleTouch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // For touch devices, we'll rely on the click event
        // This prevents double-firing on mobile
    };

    // Add new useEffect for fetching allow booking setting
    useEffect(() => {
        const fetchAllowBookingSetting = async () => {
            try {
                const res = await axios.get('/api/setting/allowbooking');
                setAllowBooking(res.data.allowBooking);
            } catch (err) {
                console.error('Failed to fetch allow booking setting:', err);
                // If the setting doesn't exist yet, create it with default value true
                try {
                    await axios.post('/api/setting/allowbooking');
                    setAllowBooking(true);
                } catch (createErr) {
                    console.error('Failed to create allow booking setting:', createErr);
                }
            }
        };
        fetchAllowBookingSetting();

        // Listen for changes from other components
        const handleAllowBookingChange = (event) => {
            setAllowBooking(event.detail.allowBooking);
        };

        window.addEventListener('allowBookingChanged', handleAllowBookingChange);
        return () => {
            window.removeEventListener('allowBookingChanged', handleAllowBookingChange);
        };
    }, []);

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading...</p>
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
                <div className="controls-left">
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
                </div>

                {role === 'admin' && (
                    <div className="controls-right">
                        <div className="staff-dropdown">
                            <div
                                className="staff-dropdown-header"
                                onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                            >
                                <span>{selectedStaff === 'all' ? 'All Staff' : staff.find(s => s._id === selectedStaff)?.name || 'All Staff'}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                                </svg>
                            </div>
                            {isStaffDropdownOpen && (
                                <div className="staff-dropdown-content">
                                    <div className="staff-search">
                                        <input
                                            type="text"
                                            placeholder="Search staff..."
                                            value={staffSearchTerm}
                                            onChange={(e) => setStaffSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="staff-options">
                                        <div
                                            className={`staff-option ${selectedStaff === 'all' ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedStaff('all');
                                                setIsStaffDropdownOpen(false);
                                            }}
                                        >
                                            All Staff
                                        </div>
                                        {filteredStaff().map(worker => (
                                            <div
                                                key={worker._id}
                                                className={`staff-option ${selectedStaff === worker._id ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setSelectedStaff(worker._id);
                                                    setIsStaffDropdownOpen(false);
                                                }}
                                            >
                                                {worker.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div
                            className="allow-booking-toggle"
                            onClick={handleToggleClick}
                            onTouchStart={handleToggleTouch}
                            role="button"
                            tabIndex={0}
                            data-checked={allowBooking}
                        >
                            <div className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={allowBooking}
                                    readOnly
                                    style={{ display: 'none' }}
                                />
                                <span className="toggle-slider"></span>
                            </div>
                            <span className="toggle-label">
                                Allow Bookings
                            </span>
                        </div>
                        <button
                            className="add-booking-btn"
                            onClick={() => setIsModalOpen(true)}
                            disabled={!allowBooking}
                        >
                            + Add Booking
                        </button>
                    </div>
                )}
            </div>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBooking(null);
                }}
                editingBooking={editingBooking}
                onSuccess={fetchBookings}
            />
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
                    workers={workers}
                    onEditBooking={handleEditBooking}
                    onDeleteBooking={handleDeleteBooking}
                    categories={categories}
                    onSuccess={fetchBookings}
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
                    onEditBooking={handleEditBooking}
                    onDeleteBooking={handleDeleteBooking}
                    workers={workers}
                    categories={categories}
                    onSuccess={fetchBookings}
                />
            )}
            {/* Month view */}
            {viewMode === 'month' && (
                <MonthView
                    bookings={bookings}
                    currentDate={currentDate}
                    selectedStaff={selectedStaff}
                    formatTime={formatTime}
                    getServiceClass={getServiceClass}
                    onEditBooking={handleEditBooking}
                    onDeleteBooking={handleDeleteBooking}
                    workers={workers}
                    categories={categories}
                    onSuccess={fetchBookings}
                />
            )}

            <div className="service-labels">
                {categories.map(category => (
                    <div key={category._id} className="service-label">
                        <div
                            className="service-color"
                            style={{ backgroundColor: category.color }}
                        ></div>
                        <span>{category.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Bookings;