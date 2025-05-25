import React, { useState, useEffect } from 'react';
import axios from '../../../utils/axiosInstance';
import './Staff.css';

const StaffTable = ({ workers, role, onEdit, onDelete, onCreateClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/service-categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const getWorkerCategories = (workerServices) => {
        if (!workerServices || !categories.length) return [];

        const categoryIds = workerServices.map(service => service.categoryId);
        const uniqueCategoryIds = [...new Set(categoryIds)];

        const categoryNames = uniqueCategoryIds
            .map(id => categories.find(cat => cat._id === id)?.name)
            .filter(name => name); // Remove undefined values

        return categoryNames;
    };

    const filteredWorkers = workers.filter(worker => {
        const workerCategories = getWorkerCategories(worker.services);
        return (
            worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            worker.phone.includes(searchTerm) ||
            worker.services.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            workerCategories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    return (
        <div className="table-section">
            <div className="table-header">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search staff by name, phone, service, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                {role === 'admin' && (
                    <button className="create-button" onClick={onCreateClick}>
                        Add New Staff
                    </button>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="table-container">
                <table className="staff-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Service Categories</th>
                            <th>Working Days</th>
                            <th>Hours</th>
                            {role === 'admin' && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWorkers.length === 0 ? (
                            <tr>
                                <td colSpan={role === 'admin' ? 6 : 5} className="no-results">
                                    No staff members found
                                </td>
                            </tr>
                        ) : (
                            filteredWorkers.map(worker => {
                                const workerCategories = getWorkerCategories(worker.services);
                                return (
                                    <tr key={worker._id}>
                                        <td>{worker.name}</td>
                                        <td>{worker.phone}</td>
                                        <td>{workerCategories.length > 0 ? workerCategories.join(', ') : 'No categories assigned'}</td>
                                        <td>{worker.workingDays.join(', ')}</td>
                                        <td>{worker.workingHours.start} - {worker.workingHours.end}</td>
                                        {role === 'admin' && (
                                            <td className="action-buttons">
                                                <div className="action-buttons">
                                                    <button
                                                        className="edit-button"
                                                        onClick={() => onEdit(worker)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="delete-button"
                                                        onClick={() => onDelete(worker._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-staff-cards">
                {filteredWorkers.length === 0 ? (
                    <div className="no-results">
                        No staff members found
                    </div>
                ) : (
                    filteredWorkers.map(worker => {
                        const workerCategories = getWorkerCategories(worker.services);
                        return (
                            <div key={worker._id} className="staff-card">
                                <div className="staff-card-header">
                                    <h3 className="staff-card-title">{worker.name}</h3>
                                </div>
                                <div className="staff-card-body">
                                    <div className="staff-card-row">
                                        <span className="staff-card-label">Phone</span>
                                        <span className="staff-card-value">{worker.phone}</span>
                                    </div>
                                    <div className="staff-card-row">
                                        <span className="staff-card-label">Categories</span>
                                        <span className="staff-card-value">
                                            {workerCategories.length > 0 ? workerCategories.join(', ') : 'No categories assigned'}
                                        </span>
                                    </div>
                                    <div className="staff-card-row">
                                        <span className="staff-card-label">Working Days</span>
                                        <span className="staff-card-value">
                                            {worker.workingDays.join(', ') || 'No days set'}
                                        </span>
                                    </div>
                                    <div className="staff-card-row">
                                        <span className="staff-card-label">Hours</span>
                                        <span className="staff-card-value">
                                            {worker.workingHours.start} - {worker.workingHours.end}
                                        </span>
                                    </div>
                                    {role === 'admin' && (
                                        <div className="staff-card-actions">
                                            <button
                                                className="edit-button"
                                                onClick={() => onEdit(worker)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => onDelete(worker._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default StaffTable; 