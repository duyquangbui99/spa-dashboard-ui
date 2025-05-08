import React, { useEffect, useState, useCallback } from 'react';
import axios from '../utils/axiosInstance';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose }) => {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get('/api/workers');
                setWorkers(res.data);
                setError('');
            } catch (err) {
                setError('Failed to load workers. Please try again.');
                console.error('Error fetching workers:', err);
            } finally {
                setIsLoading(false);
            }
        };
        if (isOpen) {
            fetchWorkers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedWorker && selectedDate && selectedServices.length > 0) {
            const worker = workers.find(w => w._id === selectedWorker);
            console.log('Selected Worker:', worker);
            console.log('Selected Date:', selectedDate);

            const totalDuration = selectedServices.reduce((acc, id) => {
                const svc = worker.services.find(s => s._id === id);
                return acc + (svc?.duration || 0);
            }, 0);

            // If the selected worker is "Anyone", show all available slots without checking bookings
            if (worker.name === "Anyone") {
                const start = parseTime(worker.workingHours.start);
                const end = parseTime(worker.workingHours.end);

                const slots = [];
                for (let time = start; time + totalDuration <= end; time += 15) {
                    slots.push({
                        time: formatTime(time),
                        available: true
                    });
                }

                setAvailableTimeSlots(slots);
                return;
            }

            // Create date objects for comparison (using local midnight)
            const [year, month, day] = selectedDate.split('-').map(Number);
            const selectedDateLocal = new Date(year, month - 1, day); // months are 0-based
            console.log('Selected Date Local:', selectedDateLocal);

            // Fetch worker's bookings
            const fetchWorkerBookings = async () => {
                try {
                    const res = await axios.get(`/api/bookings/worker/${worker._id}`);
                    console.log('Fetched Worker Bookings:', res.data);

                    // Filter bookings for the selected date
                    const selectedDateBookings = res.data.filter(booking => {
                        // Convert UTC booking time to local
                        const bookingTimeUTC = new Date(booking.startTime);

                        // Get local date components
                        const localYear = bookingTimeUTC.getFullYear();
                        const localMonth = bookingTimeUTC.getMonth();
                        const localDay = bookingTimeUTC.getDate();

                        console.log('Comparing dates:', {
                            selectedDate: selectedDateLocal.toLocaleDateString(),
                            bookingDate: bookingTimeUTC.toLocaleDateString(),
                            selectedComponents: {
                                year: selectedDateLocal.getFullYear(),
                                month: selectedDateLocal.getMonth(),
                                day: selectedDateLocal.getDate()
                            },
                            bookingComponents: {
                                year: localYear,
                                month: localMonth,
                                day: localDay
                            }
                        });

                        // Compare dates in local time
                        return (
                            localYear === selectedDateLocal.getFullYear() &&
                            localMonth === selectedDateLocal.getMonth() &&
                            localDay === selectedDateLocal.getDate()
                        );
                    });

                    console.log('Bookings for selected date:', selectedDateBookings);

                    // Create array of taken time slots
                    const takenTimeSlots = [];
                    selectedDateBookings.forEach(booking => {
                        const bookingTimeUTC = new Date(booking.startTime);
                        const bookingDuration = booking.duration || 0;

                        console.log('Processing booking:', {
                            utc: bookingTimeUTC.toISOString(),
                            local: bookingTimeUTC.toLocaleString(),
                            duration: bookingDuration
                        });

                        // Add all 15-minute intervals for the booking duration
                        for (let i = 0; i < bookingDuration; i += 15) {
                            const slotTime = new Date(bookingTimeUTC);
                            slotTime.setMinutes(bookingTimeUTC.getMinutes() + i);
                            const timeStr = formatTime(slotTime.getHours() * 60 + slotTime.getMinutes());
                            takenTimeSlots.push(timeStr);
                        }
                    });

                    console.log('Taken time slots:', takenTimeSlots);

                    // Calculate available slots
                    const start = parseTime(worker.workingHours.start);
                    const end = parseTime(worker.workingHours.end);

                    const slots = [];
                    for (let time = start; time + totalDuration <= end; time += 15) {
                        let timeStr = formatTime(time);
                        let isSlotAvailable = true;

                        // Check if any part of the service duration overlaps with taken slots
                        for (let i = 0; i < totalDuration; i += 15) {
                            const checkTime = formatTime(time + i);
                            if (takenTimeSlots.includes(checkTime)) {
                                isSlotAvailable = false;
                                break;
                            }
                        }

                        slots.push({
                            time: timeStr,
                            available: isSlotAvailable
                        });
                    }

                    setAvailableTimeSlots(slots);

                    // Reset selected time if it's no longer available
                    if (selectedTime && !slots.find(slot => slot.time === selectedTime)?.available) {
                        setSelectedTime('');
                    }
                } catch (err) {
                    console.error('Error fetching worker bookings:', err);
                    setError('Failed to load available time slots');
                }
            };

            fetchWorkerBookings();
        } else {
            setAvailableTimeSlots([]);
        }
    }, [selectedWorker, selectedDate, selectedServices, workers, selectedTime]);

    useEffect(() => {
        const isValidForm = Boolean(
            customer.name &&
            customer.phone &&
            customer.email &&
            selectedWorker &&
            selectedServices.length > 0 &&
            selectedDate &&
            selectedTime
        );
        setIsValid(isValidForm);
    }, [customer, selectedWorker, selectedServices, selectedDate, selectedTime]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;

        try {
            setIsLoading(true);
            setError('');

            // Parse the selected date and time
            const [year, month, day] = selectedDate.split('-').map(Number);
            const [hours, minutes] = selectedTime.split(':').map(Number);

            // Create local date first
            const localDateTime = new Date(year, month - 1, day, hours, minutes);

            console.log('Local DateTime:', {
                date: localDateTime.toLocaleString(),
                components: {
                    year,
                    month,
                    day,
                    hours,
                    minutes
                }
            });

            // Convert to UTC
            // For CDT (UTC-5), if local is 9:00 AM, we need to store 14:00 UTC
            const utcHours = hours + Math.floor(localDateTime.getTimezoneOffset() / 60);
            const utcMinutes = minutes + (localDateTime.getTimezoneOffset() % 60);

            // Handle minute overflow
            let finalUtcHours = utcHours;
            let finalUtcMinutes = utcMinutes;
            if (finalUtcMinutes >= 60) {
                finalUtcHours += Math.floor(finalUtcMinutes / 60);
                finalUtcMinutes = finalUtcMinutes % 60;
            }

            // Handle hour overflow
            let finalYear = year;
            let finalMonth = month - 1;
            let finalDay = day;
            if (finalUtcHours >= 24) {
                // Move to next day
                const nextDay = new Date(year, month - 1, day + 1);
                finalYear = nextDay.getFullYear();
                finalMonth = nextDay.getMonth();
                finalDay = nextDay.getDate();
                finalUtcHours = finalUtcHours % 24;
            }

            const utcDateTime = new Date(Date.UTC(
                finalYear,
                finalMonth,
                finalDay,
                finalUtcHours,
                finalUtcMinutes
            ));

            console.log('Booking Times:', {
                local: localDateTime.toLocaleString(),
                localComponents: {
                    year, month, day,
                    hours, minutes
                },
                utc: utcDateTime.toISOString(),
                utcComponents: {
                    year: finalYear,
                    month: finalMonth + 1,
                    day: finalDay,
                    hours: finalUtcHours,
                    minutes: finalUtcMinutes
                },
                offset: localDateTime.getTimezoneOffset()
            });

            const res = await axios.post('/api/bookings', {
                customerName: customer.name,
                customerPhone: customer.phone,
                customerEmail: customer.email,
                workerId: selectedWorker,
                serviceIds: selectedServices,
                startTime: utcDateTime.toISOString(),
            });

            if (res.status === 201) {
                onClose();
                // You might want to add a success notification here
            }
        } catch (err) {
            setError('Booking failed. Please try again.');
            console.error('Booking creation failed:', err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getTotalDuration = useCallback(() => {
        if (!selectedWorker || selectedServices.length === 0) return 0;
        const worker = workers.find(w => w._id === selectedWorker);
        return selectedServices.reduce((acc, id) => {
            const svc = worker.services.find(s => s._id === id);
            return acc + (svc?.duration || 0);
        }, 0);
    }, [selectedWorker, selectedServices, workers]);

    const getTotalPrice = useCallback(() => {
        if (!selectedWorker || selectedServices.length === 0) return 0;
        const worker = workers.find(w => w._id === selectedWorker);
        return selectedServices.reduce((acc, id) => {
            const svc = worker.services.find(s => s._id === id);
            return acc + (svc?.price || 0);
        }, 0);
    }, [selectedWorker, selectedServices, workers]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>×</button>

                <div className="modal-header">
                    <h2>Book an Appointment</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Select Stylist</label>
                        <select
                            value={selectedWorker || ''}
                            onChange={e => {
                                setSelectedWorker(e.target.value);
                                setSelectedServices([]);
                                setSelectedTime('');
                            }}
                            disabled={isLoading}
                        >
                            <option value="">Choose a stylist</option>
                            {workers.map(w => (
                                <option key={w._id} value={w._id}>{w.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedWorker && (
                        <>
                            <div className="form-group">
                                <label>Select Services</label>
                                <div className="services-grid">
                                    {workers.find(w => w._id === selectedWorker)?.services.map(svc => (
                                        <div
                                            key={svc._id}
                                            className={`service-item ${selectedServices.includes(svc._id) ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedServices(prev =>
                                                    prev.includes(svc._id)
                                                        ? prev.filter(id => id !== svc._id)
                                                        : [...prev, svc._id]
                                                );
                                                setSelectedTime('');
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedServices.includes(svc._id)}
                                                readOnly
                                            />
                                            <div>
                                                <div>{svc.name}</div>
                                                <small>{svc.duration} mins - ${svc.price}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Select Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => {
                                        setSelectedDate(e.target.value);
                                        setSelectedTime('');
                                    }}
                                />
                            </div>

                            {selectedDate && selectedServices.length > 0 && (
                                <div className="form-group">
                                    <label>Select Time</label>
                                    <div className="time-slots-grid">
                                        {availableTimeSlots.map(slot => (
                                            <div
                                                key={slot.time}
                                                className={`time-slot ${!slot.available ? 'disabled' :
                                                    selectedTime === slot.time ? 'selected' : ''
                                                    }`}
                                                onClick={() => {
                                                    if (slot.available) {
                                                        setSelectedTime(slot.time);
                                                    }
                                                }}
                                            >
                                                {slot.time}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Your Information</label>
                                <input
                                    placeholder="Name"
                                    value={customer.name}
                                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                />
                                <input
                                    placeholder="Phone"
                                    value={customer.phone}
                                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={customer.email}
                                    onChange={e => setCustomer({ ...customer, email: e.target.value })}
                                />
                            </div>

                            {selectedServices.length > 0 && (
                                <div className="booking-summary">
                                    <p>Total Duration: {getTotalDuration()} minutes</p>
                                    <p>Total Price: ${getTotalPrice()}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isLoading || !isValid}
                            >
                                {isLoading ? 'Booking...' : 'Confirm Booking'}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default BookingModal;

function parseTime(str) {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
}

function formatTime(mins) {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
} 
