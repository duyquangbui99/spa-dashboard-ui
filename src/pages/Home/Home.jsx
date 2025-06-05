import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import './Home.css';
import bookingDashboard from '../../assets/images/booking-dashboard.png';
import BookingModal from '../../components/BookingModal';
import Confirmation from '../../components/Confirmation';

const Home = () => {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [allowBooking, setAllowBooking] = useState(true);

    useEffect(() => {
        const fetchAllowBookingSetting = async () => {
            try {
                const res = await axios.get('/api/setting/allowbooking', {
                    headers: { 'Cache-Control': 'no-cache' }
                });
                setAllowBooking(res.data.allowBooking);
            } catch (err) {
                console.error('Failed to fetch allow booking setting:', err);
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

    const handleOpenBookingModal = () => {
        if (!allowBooking) {
            alert('Booking is currently disabled. Please try again later.');
            return;
        }
        console.log('Opening modal...'); // Debug log
        setIsBookingModalOpen(true);
    };

    const handleCloseBookingModal = () => {
        console.log('Closing modal...'); // Debug log
        setIsBookingModalOpen(false);
    };

    const handleBookingSuccess = (details) => {
        console.log('Booking successful!', details); // Debug log
        setIsBookingModalOpen(false);
        setBookingDetails(details);
        console.log('Setting confirmation state:', { isOpen: true, details });
        setIsConfirmationOpen(true);
    };

    const handleCloseConfirmation = () => {
        console.log('Closing confirmation modal');
        setIsConfirmationOpen(false);
        setBookingDetails(null);
    };

    // Add debug log for confirmation modal state
    useEffect(() => {
        console.log('Confirmation modal state:', { isOpen: isConfirmationOpen, details: bookingDetails });
    }, [isConfirmationOpen, bookingDetails]);

    return (
        <>
            {/* Header */}
            <header className="header">
                <div className="container header-content">
                    <div className="logo">
                        <svg xmlns="http://www.w3.org/2000/svg" className="logo-icon" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"></path>
                        </svg>
                        Quang Management Project
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        {/* Navigation items can be added here in the future */}
                    </nav>

                    <button
                        className={`book-now-btn ${!allowBooking ? 'disabled' : ''}`}
                        onClick={handleOpenBookingModal}
                        type="button"
                        disabled={!allowBooking}
                    >
                        {allowBooking ? 'Book Now' : '⏸ Booking Disabled'}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className="mobile-menu">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-xl font-bold">Tranquility Spa Management</div>
                        <button className="text-gray-500 focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text animate-fade-in">
                            <h1 className="hero-title">Transform Your Experience with Smart Management</h1>
                            <p className="hero-description">
                                Elevate your business with our comprehensive management platform.
                                Streamline appointments, enhance customer relationships, and unlock powerful
                                insights with automated scheduling, social media integration, and advanced analytics
                                designed specifically for wellness professionals.
                            </p>
                            <div className="hero-buttons">
                                {!allowBooking && (
                                    <div className="booking-notification">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="notification-icon" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span>We're currently at capacity and unable to accept new appointments today. Please visit us directly or try again tomorrow for the best service experience!</span>
                                    </div>
                                )}
                                <button
                                    className={`btn-primary ${!allowBooking ? 'disabled' : ''}`}
                                    onClick={handleOpenBookingModal}
                                    type="button"
                                    disabled={!allowBooking}
                                >
                                    {allowBooking ? '🌟 Book Your Appointment' : '⏸ Booking Currently Disabled'}
                                </button>
                                <Link to="/dashboard" className="btn-secondary">
                                    📊 Access Dashboard
                                </Link>
                            </div>
                        </div>
                        <div className="hero-image animate-slide-up">
                            <img src={bookingDashboard} alt="Modern Spa Management Dashboard - Streamline your appointments and enhance customer experience" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Modal */}
            {isBookingModalOpen && allowBooking && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={handleCloseBookingModal}
                    onSuccess={handleBookingSuccess}
                />
            )}

            {/* Confirmation Modal */}
            <Confirmation
                isOpen={isConfirmationOpen}
                onClose={handleCloseConfirmation}
                bookingDetails={bookingDetails}
            />
        </>
    );
};

export default Home;