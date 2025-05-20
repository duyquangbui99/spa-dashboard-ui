import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import './Confirmation.css';

const Confirmation = ({ isOpen, onClose, bookingDetails }) => {
    if (!isOpen) return null;

    return (
        <div className="confirmation-overlay">
            <div className="confirmation-modal">
                <button
                    onClick={onClose}
                    className="confirmation-close-button"
                >
                    <X size={20} />
                </button>

                <div className="confirmation-content">
                    <CheckCircle2 className="confirmation-icon" size={48} />
                    <h2 className="confirmation-title">Booking Confirmed!</h2>

                    <p className="confirmation-message">
                        Thank you for your booking. We have sent a confirmation email with all the details.
                        <br />
                        <span className="confirmation-note">
                            If you need to make any changes or cancel your appointment, please contact us at 012.345.6789
                        </span>
                    </p>

                    {bookingDetails && (
                        <div className="confirmation-details">
                            <h3>Booking Details:</h3>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Date:</span>
                                    <span className="detail-value">{bookingDetails.date}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Time:</span>
                                    <span className="detail-value">{bookingDetails.time}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Service:</span>
                                    <span className="detail-value">{bookingDetails.service}</span>
                                </div>
                                {bookingDetails.bookingId && (
                                    <div className="detail-item">
                                        <span className="detail-label">Booking ID:</span>
                                        <span className="detail-value">{bookingDetails.bookingId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="confirmation-button"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Confirmation;
