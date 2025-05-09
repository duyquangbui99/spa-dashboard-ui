import React, { useState } from 'react';
import './Staff.css';

const StaffForm = ({ formData, handleChange, handleSubmit, services, editingId, error, onCancel }) => {
    const [searchService, setSearchService] = useState('');

    const DAYS_OF_WEEK = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ];

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchService.toLowerCase())
    );

    const handleServiceChange = (serviceId) => {
        const updatedServices = formData.services.includes(serviceId)
            ? formData.services.filter(id => id !== serviceId)
            : [...formData.services, serviceId];

        handleChange({
            target: {
                name: 'services',
                value: updatedServices
            }
        });
    };

    const handleDayChange = (day) => {
        const updatedDays = formData.workingDays.includes(day)
            ? formData.workingDays.filter(d => d !== day)
            : [...formData.workingDays, day];

        handleChange({
            target: {
                name: 'workingDays',
                value: updatedDays
            }
        });
    };

    return (
        <div className="form-overlay">
            <div className="form-modal">
                <form className="staff-form" onSubmit={handleSubmit}>
                    <h3>{editingId ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>

                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            name="name"
                            placeholder="Enter staff name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input
                            id="phone"
                            name="phone"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="services">Services</label>
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchService}
                            onChange={(e) => setSearchService(e.target.value)}
                            className="service-search"
                        />
                        <div className="staff-services-selection">
                            {filteredServices.map(service => (
                                <div key={service._id} className="service-option">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.services.includes(service._id)}
                                            onChange={() => handleServiceChange(service._id)}
                                        />
                                        <span>{service.name}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Working Days</label>
                        <div className="working-days-container">
                            {DAYS_OF_WEEK.map(day => (
                                <div key={day} className="day-option">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.workingDays.includes(day)}
                                            onChange={() => handleDayChange(day)}
                                        />
                                        <span>{day}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="start">Start Time</label>
                            <input
                                id="start"
                                name="start"
                                type="time"
                                value={formData.workingHours.start}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="end">End Time</label>
                            <input
                                id="end"
                                name="end"
                                type="time"
                                value={formData.workingHours.end}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="pin">PIN</label>
                        <input
                            id="pin"
                            name="pin"
                            type="password"
                            placeholder="Enter 4-digit PIN"
                            value={formData.pin}
                            onChange={handleChange}
                            required={!editingId}
                            maxLength="4"
                            pattern="[0-9]{4}"
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">
                            {editingId ? 'Update' : 'Create'} Staff
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StaffForm; 