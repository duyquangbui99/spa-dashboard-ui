import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import StaffForm from '../Dashboard/Staff/StaffForm';
import StaffTable from '../Dashboard/Staff/StaffTable';
import '../Dashboard/Staff/Staff.css';

const Staffs = () => {
    const { role } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [services, setServices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        services: [],
        workingDays: [],
        workingHours: { start: '09:30', end: '19:30' },
        pin: ''
    });

    useEffect(() => {
        fetchWorkers();
        fetchServices();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await axios.get('/api/workers');
            setWorkers(res.data);
        } catch (err) {
            console.error('Error fetching workers:', err);
            setError('Failed to load workers');
        }
    };

    const fetchServices = async () => {
        try {
            const res = await axios.get('/api/services');
            setServices(res.data);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError('Failed to load services');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'start' || name === 'end') {
            setFormData(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/workers/${editingId}`, formData);
            } else {
                await axios.post('/api/workers/create', formData);
            }
            fetchWorkers();
            resetForm();
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving worker');
        }
    };

    const handleEdit = (worker) => {
        setFormData({
            name: worker.name,
            phone: worker.phone,
            services: worker.services.map(s => s._id),
            workingDays: worker.workingDays,
            workingHours: worker.workingHours,
            pin: ''
        });
        setEditingId(worker._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;
        try {
            await axios.delete(`/api/workers/${id}`);
            fetchWorkers();
            resetForm();
        } catch (err) {
            setError('Failed to delete worker');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            services: [],
            workingDays: [],
            workingHours: { start: '09:30', end: '19:30' },
            pin: ''
        });
        setEditingId(null);
        setError('');
    };

    const handleCreateClick = () => {
        resetForm();
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        resetForm();
    };

    return (
        <div className="staff-container">
            <h2>Staff Management</h2>

            {error && <div className="error-message">{error}</div>}

            {showForm && role === 'admin' && (
                <StaffForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    services={services}
                    editingId={editingId}
                    error={error}
                    onCancel={handleCancel}
                />
            )}

            <StaffTable
                workers={workers}
                role={role}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCreateClick={handleCreateClick}
            />
        </div>
    );
};

export default Staffs;