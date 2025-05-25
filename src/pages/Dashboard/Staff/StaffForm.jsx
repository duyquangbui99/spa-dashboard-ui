import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import './Staff.css';

const StaffForm = ({ formData, handleChange, handleSubmit, services, editingId, error, onCancel }) => {
    const [searchService, setSearchService] = useState('');
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    const DAYS_OF_WEEK = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/service-categories');
            setCategories(res.data);
            // Expand all categories by default
            setExpandedCategories(new Set(res.data.map(cat => cat._id)));
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const getServicesByCategory = () => {
        const servicesByCategory = {};

        categories.forEach(category => {
            const categoryServices = services.filter(service =>
                service.categoryId === category._id &&
                service.name.toLowerCase().includes(searchService.toLowerCase())
            );
            if (categoryServices.length > 0) {
                servicesByCategory[category._id] = {
                    category,
                    services: categoryServices
                };
            }
        });

        return servicesByCategory;
    };

    const toggleCategory = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

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

    const handleCategorySelectAll = (categoryServices) => {
        const categoryServiceIds = categoryServices.map(service => service._id);
        const allSelected = categoryServiceIds.every(id => formData.services.includes(id));

        let updatedServices;
        if (allSelected) {
            // Remove all category services
            updatedServices = formData.services.filter(id => !categoryServiceIds.includes(id));
        } else {
            // Add all category services
            const newServices = categoryServiceIds.filter(id => !formData.services.includes(id));
            updatedServices = [...formData.services, ...newServices];
        }

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

    const servicesByCategory = getServicesByCategory();

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
                        <label htmlFor="services">Services by Category</label>
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchService}
                            onChange={(e) => setSearchService(e.target.value)}
                            className="service-search"
                        />
                        <div className="services-by-category">
                            {Object.keys(servicesByCategory).length === 0 ? (
                                <div className="no-services-found">No services found</div>
                            ) : (
                                Object.values(servicesByCategory).map(({ category, services: categoryServices }) => {
                                    const isExpanded = expandedCategories.has(category._id);
                                    const allSelected = categoryServices.every(service =>
                                        formData.services.includes(service._id)
                                    );
                                    const someSelected = categoryServices.some(service =>
                                        formData.services.includes(service._id)
                                    );

                                    return (
                                        <div key={category._id} className="category-section">
                                            <div className="category-header">
                                                <button
                                                    type="button"
                                                    className={`category-toggle ${isExpanded ? 'expanded' : ''}`}
                                                    onClick={() => toggleCategory(category._id)}
                                                >
                                                    <div className="category-name-section">
                                                        <span className="category-name">{category.name}</span>
                                                    </div>
                                                    <span className="toggle-icon">
                                                        {isExpanded ? '−' : '+'}
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`select-all-btn ${allSelected ? 'all-selected' : someSelected ? 'some-selected' : ''}`}
                                                    onClick={() => handleCategorySelectAll(categoryServices)}
                                                >
                                                    {allSelected ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>

                                            {isExpanded && (
                                                <div className="category-services">
                                                    {categoryServices.map(service => (
                                                        <div key={service._id} className="service-option">
                                                            <label className="checkbox-label">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.services.includes(service._id)}
                                                                    onChange={() => handleServiceChange(service._id)}
                                                                />
                                                                <span className="service-name">{service.name}</span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
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