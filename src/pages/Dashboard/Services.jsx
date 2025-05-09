import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import './Services.css';
import { useAuth } from '../../context/AuthContext';

const Services = () => {
    const { role } = useAuth();
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({ name: '', price: '', duration: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await axios.get('/api/services');
            setServices(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingId) {
                await axios.put(`/api/services/${editingId}`, formData);
            } else {
                await axios.post('/api/services/create', formData);
            }

            fetchServices();
            setFormData({ name: '', price: '', duration: '', description: '' });
            setEditingId(null);
            setIsModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving service');
        }
    };

    const handleEdit = (service) => {
        setFormData({
            name: service.name,
            price: service.price,
            duration: service.duration,
            description: service.description,
        });
        setEditingId(service._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await axios.delete(`/api/services/${id}`);
            fetchServices();
        } catch (err) {
            console.error(err);
        }
    };

    const openCreateModal = () => {
        setFormData({ name: '', price: '', duration: '', description: '' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', price: '', duration: '', description: '' });
        setEditingId(null);
        setError('');
    };

    return (
        <div className="services-container">
            <div className="services-header">
                <h2>Manage Services</h2>
                {role === 'admin' && (
                    <button className="create-button" onClick={openCreateModal}>
                        Create New Service
                    </button>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingId ? 'Edit Service' : 'Create New Service'}</h3>
                            <button className="close-button" onClick={closeModal}>&times;</button>
                        </div>
                        <form className="service-form" onSubmit={handleSubmit}>
                            <input
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="price"
                                type="number"
                                placeholder="Price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="duration"
                                type="number"
                                placeholder="Duration (minutes)"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                            />
                            <input
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                            {error && <p className="error">{error}</p>}
                            <div className="modal-actions">
                                <button type="button" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="submit-button">
                                    {editingId ? 'Update' : 'Create'} Service
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <table className="service-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Duration</th>
                        <th>Description</th>
                        {role === 'admin' && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {services.map(service => (
                        <tr key={service._id}>
                            <td>{service.name}</td>
                            <td>${service.price}</td>
                            <td>{service.duration} min</td>
                            <td>{service.description}</td>
                            {role === 'admin' && (
                                <td>
                                    <button onClick={() => handleEdit(service)}>Edit</button>
                                    <button onClick={() => handleDelete(service._id)}>Delete</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Services;
