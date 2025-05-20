import React, { useEffect, useState, useCallback } from 'react';
import axios from '../utils/axiosInstance';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, editingBooking, onSuccess, initialData }) => {
    const [workers, setWorkers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [serviceQuantities, setServiceQuantities] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stylistSearch, setStylistSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [workersRes, categoriesRes] = await Promise.all([
                    axios.get('/api/workers'),
                    axios.get('/api/service-categories')
                ]);
                setWorkers(workersRes.data);
                setCategories(categoriesRes.data);
                setError('');
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedWorker && selectedDate && selectedServices.length > 0) {
            const worker = workers.find(w => w._id === selectedWorker);
            if (!worker || !worker.services) {
                setAvailableTimeSlots([]);
                return;
            }

            const totalDuration = selectedServices.reduce((acc, id) => {
                const svc = worker.services.find(s => s._id === id);
                return acc + (svc?.duration || 0);
            }, 0);

            // Create date objects for comparison (using local midnight)
            const [year, month, day] = selectedDate.split('-').map(Number);
            const selectedDateLocal = new Date(year, month - 1, day); // months are 0-based
            console.log('Selected Date Local:', selectedDateLocal);

            // Check if the selected date is a working day for the worker
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const selectedDayName = days[selectedDateLocal.getDay()];

            // If the selected worker is "Anyone", show all available slots without checking bookings
            if (worker.name === "Anyone") {
                if (!worker.workingHours?.start || !worker.workingHours?.end) {
                    setAvailableTimeSlots([]);
                    return;
                }

                const start = parseTime(worker.workingHours.start);
                const end = parseTime(worker.workingHours.end);

                const slots = [];

                for (let time = start; time + totalDuration <= end; time += 15) {
                    const timeStr = formatTime(time);
                    // Check if it's Sunday and after 6 PM
                    const isAfter6PM = selectedDayName === 'Sunday' && time >= parseTime('18:00');

                    // Check if the time slot is in the past
                    const currentDate = new Date();
                    const [year, month, day] = selectedDate.split('-').map(Number);
                    const slotDateTime = new Date(year, month - 1, day, Math.floor(time / 60), time % 60);
                    const isPastTime = slotDateTime <= currentDate;

                    slots.push({
                        time: timeStr,
                        available: !isAfter6PM && !isPastTime
                    });
                }

                setAvailableTimeSlots(slots);
                return;
            }

            // Check if it's Sunday and handle special closing time
            if (selectedDayName === 'Sunday') {
                const start = parseTime(worker.workingHours.start);
                const end = parseTime(worker.workingHours.end);
                const slots = [];

                if (!worker.workingDays?.includes('Sunday')) {
                    // If worker doesn't work on Sunday, set all slots as unavailable
                    for (let time = start; time + totalDuration <= end; time += 15) {
                        slots.push({
                            time: formatTime(time),
                            available: false
                        });
                    }
                } else {
                    // If worker works on Sunday, create slots with 6 PM cutoff
                    for (let time = start; time + totalDuration <= end; time += 15) {
                        const timeStr = formatTime(time);
                        const isAfter6PM = time >= parseTime('18:00');
                        slots.push({
                            time: timeStr,
                            available: !isAfter6PM
                        });
                    }
                }
                setAvailableTimeSlots(slots);
                return;
            }

            if (!worker.workingDays?.includes(selectedDayName)) {
                // If it's not a working day, set all slots as unavailable
                const start = parseTime(worker.workingHours.start);
                const end = parseTime(worker.workingHours.end);
                const slots = [];
                for (let time = start; time + totalDuration <= end; time += 15) {
                    slots.push({
                        time: formatTime(time),
                        available: false
                    });
                }
                setAvailableTimeSlots(slots);
                return;
            }

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
                    if (!worker.workingHours?.start || !worker.workingHours?.end) {
                        setAvailableTimeSlots([]);
                        return;
                    }

                    const start = parseTime(worker.workingHours.start);
                    const end = parseTime(worker.workingHours.end);

                    const slots = [];
                    for (let time = start; time + totalDuration <= end; time += 15) {
                        let timeStr = formatTime(time);
                        let isSlotAvailable = true;

                        // Check if the time slot is in the past
                        const currentDate = new Date();
                        const [year, month, day] = selectedDate.split('-').map(Number);
                        const slotDateTime = new Date(year, month - 1, day, Math.floor(time / 60), time % 60);
                        if (slotDateTime <= currentDate) {
                            isSlotAvailable = false;
                        }

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

    useEffect(() => {
        if (editingBooking) {
            try {
                // Populate form with editing booking data
                setCustomer({
                    name: editingBooking.customerName || '',
                    phone: editingBooking.customerPhone || '',
                    email: editingBooking.customerEmail || ''
                });

                // Safely handle worker ID
                if (editingBooking.workerId && editingBooking.workerId._id) {
                    setSelectedWorker(editingBooking.workerId._id);
                } else if (typeof editingBooking.workerId === 'string') {
                    setSelectedWorker(editingBooking.workerId);
                }

                // Safely handle services
                if (Array.isArray(editingBooking.services)) {
                    const serviceIds = editingBooking.services.map(s => {
                        if (s.serviceId && s.serviceId._id) {
                            return s.serviceId._id;
                        } else if (typeof s.serviceId === 'string') {
                            return s.serviceId;
                        }
                        return null;
                    }).filter(Boolean);
                    setSelectedServices(serviceIds);
                }

                // Safely handle date and time
                if (editingBooking.startTime) {
                    const startDate = new Date(editingBooking.startTime);
                    if (!isNaN(startDate.getTime())) {
                        setSelectedDate(startDate.toISOString().split('T')[0]);
                        setSelectedTime(formatTime(startDate));
                    }
                }
            } catch (error) {
                console.error('Error populating booking form:', error);
                setError('Failed to load booking data. Please try again.');
            }
        }
    }, [editingBooking]);

    // Add new useEffect to handle initialData
    useEffect(() => {
        if (initialData) {
            if (initialData.date) {
                setSelectedDate(initialData.date);
            }
            if (initialData.time) {
                setSelectedTime(initialData.time);
            }
            if (initialData.workerId) {
                setSelectedWorker(initialData.workerId);
                // Only jump to step 2 if we have a worker but no services
                if (selectedServices.length === 0) {
                    setCurrentStep(2);
                }
            }
            // Only jump to step 3 if we have all required data
            if (initialData.date && initialData.time && initialData.workerId && selectedServices.length > 0) {
                setCurrentStep(3);
            }
        }
    }, [initialData, selectedServices.length]);

    const handleNextStep = () => {
        if (currentStep < 6) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const resetForm = () => {
        setSelectedWorker(null);
        setSelectedServices([]);
        setSelectedDate('');
        setSelectedTime('');
        setCustomer({ name: '', phone: '', email: '' });
        setCurrentStep(1);
        setExpandedCategory(null);
        setError('');
        setServiceQuantities({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent multiple submissions
        setError(null);
        setIsSubmitting(true);

        try {
            const bookingData = {
                customerName: customer.name,
                customerPhone: customer.phone,
                customerEmail: customer.email,
                workerId: selectedWorker,
                services: selectedServices.map(serviceId => ({
                    serviceId,
                    quantity: serviceQuantities[serviceId] || 1
                })),
                startTime: new Date(`${selectedDate}T${selectedTime}`).toISOString()
            };

            console.log('Submitting booking data:', bookingData);

            let response;
            if (editingBooking) {
                // Update existing booking
                response = await axios.put(`/api/bookings/${editingBooking._id}`, bookingData);
            } else {
                // Create new booking
                response = await axios.post('/api/bookings', bookingData);
            }

            console.log('Booking response:', response.data);

            resetForm();
            onClose();
            // Pass the booking details to the onSuccess callback
            if (typeof onSuccess === 'function') {
                const worker = workers.find(w => w._id === selectedWorker);
                const bookingDetails = {
                    date: selectedDate,
                    time: selectedTime,
                    service: selectedServices.map(serviceId => {
                        const service = worker?.services.find(s => s._id === serviceId);
                        return service ? service.name : '';
                    }).join(', '),
                    bookingId: response.data.booking?._id || response.data._id // Handle both nested and direct response structures
                };
                console.log('Passing booking details to confirmation:', bookingDetails);
                onSuccess(bookingDetails);
            }
        } catch (err) {
            console.error('Error saving booking:', err);
            setError(err.response?.data?.message || 'Failed to save booking');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTotalPrice = useCallback(() => {
        if (!selectedWorker || selectedServices.length === 0) return 0;
        const worker = workers.find(w => w._id === selectedWorker);
        if (!worker || !worker.services) return 0;

        return selectedServices.reduce((acc, id) => {
            const svc = worker.services.find(s => s._id === id);
            if (!svc) return acc;
            const quantity = serviceQuantities[id] || 1;
            return acc + (svc.price || 0) * quantity;
        }, 0);
    }, [selectedWorker, selectedServices, workers, serviceQuantities]);

    const getStylistCategories = useCallback(() => {
        if (!selectedWorker) return [];
        const worker = workers.find(w => w._id === selectedWorker);
        if (!worker) return [];

        // Get unique category IDs from worker's services
        const categoryIds = [...new Set(worker.services.map(s => s.categoryId))];

        // Filter categories to only include those that the worker can perform
        return categories.filter(cat =>
            categoryIds.includes(cat._id) &&
            !cat.name.toLowerCase().includes('add-on')
        );
    }, [selectedWorker, workers, categories]);

    const getServicesByCategory = useCallback((categoryId) => {
        if (!selectedWorker) return [];
        const worker = workers.find(w => w._id === selectedWorker);
        return worker?.services.filter(s => s.categoryId === categoryId) || [];
    }, [selectedWorker, workers]);

    const handleCategoryClick = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    const handleServiceSelect = (serviceId) => {
        setSelectedServices(prev => {
            if (prev.includes(serviceId)) {
                // Remove service and its quantity when unselected
                const newQuantities = { ...serviceQuantities };
                delete newQuantities[serviceId];
                setServiceQuantities(newQuantities);
                return prev.filter(id => id !== serviceId);
            } else {
                // Add service with default quantity of 1
                setServiceQuantities(prev => ({
                    ...prev,
                    [serviceId]: 1
                }));
                return [...prev, serviceId];
            }
        });
        setSelectedTime('');
    };

    const handleQuantityChange = (serviceId, newQuantity) => {
        if (newQuantity > 0) {
            setServiceQuantities(prev => ({
                ...prev,
                [serviceId]: newQuantity
            }));
        }
    };

    // Filtered stylists for search
    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(stylistSearch.toLowerCase())
    );

    // Add effect to handle body scroll lock
    useEffect(() => {
        if (isOpen) {
            // Save current scroll position
            const scrollY = window.scrollY;
            // Add styles to prevent background scrolling
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            // Restore scroll position and remove styles
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }

        // Cleanup function
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editingBooking ? 'Edit Booking' : 'New Booking'}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="booking-steps">
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. Stylist</div>
                        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. Services</div>
                        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. Date & Time</div>
                        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4. Info</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    {currentStep === 1 && (
                        <div className="booking-form-group">
                            <label>Select Stylist</label>
                            <input
                                className="stylist-search-bar"
                                type="text"
                                placeholder="Search stylist by name..."
                                value={stylistSearch}
                                onChange={e => setStylistSearch(e.target.value)}
                                autoComplete="off"
                                spellCheck={false}
                                style={{ marginBottom: 18 }}
                            />
                            <div className="stylist-cards">
                                {filteredWorkers.map(w => (
                                    <div
                                        key={w._id}
                                        className={`stylist-card${selectedWorker === w._id ? ' selected' : ''}`}
                                        onClick={() => {
                                            setSelectedWorker(w._id);
                                            setSelectedServices([]);
                                            setSelectedDate('');
                                            setSelectedTime('');
                                            setExpandedCategory(null);
                                            setServiceQuantities({});
                                        }}
                                    >
                                        {w.profileImage ? (
                                            <img src={w.profileImage} alt={w.name} className="profile-img" />
                                        ) : (
                                            <div className="profile-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#b0b0c3', background: '#f0f0f7' }}>
                                                <span role="img" aria-label="user">👤</span>
                                            </div>
                                        )}
                                        <div className="stylist-name">{w.name}</div>
                                        {w.experience ? (
                                            <div className="stylist-exp">{w.experience} yrs exp</div>
                                        ) : w.name === 'Anyone' && w.range ? (
                                            <div className="stylist-range">{w.range} yrs exp</div>
                                        ) : null}
                                        {selectedWorker === w._id && (
                                            <div className="checkmark">✓</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && selectedWorker && (
                        <div className="booking-form-group">
                            <label>Select Services</label>
                            {getStylistCategories().length > 0 ? (
                                <div className="categories-container">
                                    {getStylistCategories().map(category => (
                                        <div key={category._id} className="category-section">
                                            <div
                                                className={`category-header ${expandedCategory === category._id ? 'expanded' : ''}`}
                                                onClick={() => handleCategoryClick(category._id)}
                                            >
                                                <h3>{category.name}</h3>
                                                <span className="expand-icon">
                                                    {expandedCategory === category._id ? '−' : '+'}
                                                </span>
                                            </div>
                                            {expandedCategory === category._id && (
                                                <div className="category-services">
                                                    {getServicesByCategory(category._id).map(svc => (
                                                        <div
                                                            key={svc._id}
                                                            className={`service-item ${selectedServices.includes(svc._id) ? 'selected' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleServiceSelect(svc._id);
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedServices.includes(svc._id)}
                                                                readOnly
                                                            />
                                                            <div className="service-details">
                                                                <div>{svc.name}</div>
                                                                <small>{svc.duration} mins - ${svc.price}</small>
                                                            </div>
                                                            {selectedServices.includes(svc._id) && (
                                                                <div className="quantity-control">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleQuantityChange(svc._id, (serviceQuantities[svc._id] || 1) - 1);
                                                                        }}
                                                                        disabled={serviceQuantities[svc._id] <= 1}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={serviceQuantities[svc._id] || 1}
                                                                        onChange={(e) => {
                                                                            e.stopPropagation();
                                                                            handleQuantityChange(svc._id, parseInt(e.target.value) || 1);
                                                                        }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleQuantityChange(svc._id, (serviceQuantities[svc._id] || 1) + 1);
                                                                        }}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-categories-message">
                                    This stylist doesn't have any service categories available.
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 3 && selectedWorker && selectedServices.length > 0 && (
                        <>
                            <div className="booking-form-group">
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

                            {selectedDate && (
                                <div className="booking-form-group">
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
                        </>
                    )}

                    {currentStep === 4 && (
                        <div className="booking-form-group">
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
                    )}

                    {selectedServices.length > 0 && (
                        <div className="booking-summary">
                            <p>Stylist: {workers.find(w => w._id === selectedWorker)?.name}</p>
                            <div className="selected-services">
                                {selectedServices.map(serviceId => {
                                    const worker = workers.find(w => w._id === selectedWorker);
                                    const service = worker?.services.find(s => s._id === serviceId);
                                    const quantity = serviceQuantities[serviceId] || 1;
                                    return (
                                        <p key={serviceId}>
                                            {service?.name} x {quantity} - ${(service?.price * quantity).toFixed(2)}
                                        </p>
                                    );
                                })}
                            </div>
                            <p className="total-price">Total: ${getTotalPrice().toFixed(2)}</p>
                            <p className="price-note">Please note that total prices might be different due to the design, length and shape, please call for the exact amount</p>
                        </div>
                    )}

                    <div className="modal-actions">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                className="prev-button"
                                onClick={handlePrevStep}
                            >
                                Previous
                            </button>
                        )}
                        {currentStep < 4 ? (
                            <button
                                type="button"
                                className="next-button"
                                onClick={handleNextStep}
                                disabled={
                                    (currentStep === 1 && !selectedWorker) ||
                                    (currentStep === 2 && selectedServices.length === 0) ||
                                    (currentStep === 3 && (!selectedDate || !selectedTime))
                                }
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isLoading || !isValid || isSubmitting}
                            >
                                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                            </button>
                        )}
                    </div>
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
