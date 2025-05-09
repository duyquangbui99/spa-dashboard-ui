import React, { useState } from 'react';
import './Staff.css';

const StaffTable = ({ workers, role, onEdit, onDelete, onCreateClick }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredWorkers = workers.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.phone.includes(searchTerm) ||
        worker.services.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="table-section">
            <div className="table-header">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search staff by name, phone, or service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                {role === 'admin' && (
                    <button className="create-button" onClick={onCreateClick}>
                        + Add New Staff
                    </button>
                )}
            </div>

            <div className="table-container">
                <table className="staff-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Services</th>
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
                            filteredWorkers.map(worker => (
                                <tr key={worker._id}>
                                    <td>{worker.name}</td>
                                    <td>{worker.phone}</td>
                                    <td>{worker.services.map(s => s.name).join(', ')}</td>
                                    <td>{worker.workingDays.join(', ')}</td>
                                    <td>{worker.workingHours.start} - {worker.workingHours.end}</td>
                                    {role === 'admin' && (
                                        <td className="action-buttons">
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
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffTable; 