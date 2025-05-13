import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import bookingDashboard from '../../assets/images/booking-dashboard.png';
import BookingModal from '../../components/BookingModal';

const Home = () => {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const handleOpenBookingModal = () => {
        console.log('Opening modal...'); // Debug log
        setIsBookingModalOpen(true);
    };

    const handleCloseBookingModal = () => {
        console.log('Closing modal...'); // Debug log
        setIsBookingModalOpen(false);
    };

    const handleBookingSuccess = () => {
        console.log('Booking successful!'); // Debug log
        setIsBookingModalOpen(false);
        // You can add additional success handling here if needed
    };

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
                    </nav>

                    <button
                        className="book-now-btn"
                        onClick={handleOpenBookingModal}
                        type="button"
                    >
                        Book Now
                    </button>

                    {/* Mobile Menu Button */}
                    <button className="mobile-menu-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className="mobile-menu">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-xl font-bold">Quang Management Project</div>
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
                            <h1 className="hero-title">Streamline Your Business with Smart Booking Management</h1>
                            <p className="hero-description">Take control of your appointments with our intuitive booking system. Manage schedules, track customer preferences, and grow your business with powerful analytics, automated reminders, social media integration, and seamless customer communication tools.</p>
                            <div className="hero-buttons">
                                <button
                                    className="btn-primary"
                                    onClick={handleOpenBookingModal}
                                    type="button"
                                >
                                    Book Appointment
                                </button>
                                <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
                            </div>
                        </div>
                        <div className="hero-image animate-slide-up">
                            <img src={bookingDashboard} alt="Booking Dashboard" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Modal */}
            {isBookingModalOpen && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={handleCloseBookingModal}
                    onSuccess={handleBookingSuccess}
                />
            )}
        </>
    );
};

export default Home;