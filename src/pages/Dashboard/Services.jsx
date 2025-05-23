import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import './Services.css';
import { useAuth } from '../../context/AuthContext';

const Services = () => {
    const { role } = useAuth();
    const [view, setView] = useState('categories');
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '', price: '', duration: '', description: '', categoryId: '' });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await axios.get('/api/services');
            setServices(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/service-categories');
            setCategories(res.data);
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
            if (view === 'services') {
                if (editingId) {
                    await axios.put(`/api/services/${editingId}`, formData);
                } else {
                    await axios.post('/api/services/create', formData);
                }
                fetchServices();
            } else {
                if (editingId) {
                    await axios.put(`/api/service-categories/${editingId}`, { name: formData.name });
                } else {
                    await axios.post('/api/service-categories', { name: formData.name });
                }
                fetchCategories();
            }
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving');
        }
    };

    const handleEdit = (item) => {
        if (view === 'services') {
            setFormData({
                name: item.name,
                price: item.price,
                duration: item.duration,
                description: item.description,
                categoryId: item.categoryId
            });
        } else {
            setFormData({ name: item.name });
        }
        setEditingId(item._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            if (view === 'services') {
                await axios.delete(`/api/services/${id}`);
                fetchServices();
            } else {
                await axios.delete(`/api/service-categories/${id}`);
                fetchCategories();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', price: '', duration: '', description: '', categoryId: '' });
        setEditingId(null);
        setIsModalOpen(false);
        setError('');
    };

    return (
        <div className="services-container">
            <div className="services-toggle-buttons">
                <button className={view === 'categories' ? 'active' : ''} onClick={() => setView('categories')}>Categories</button>
                <button className={view === 'services' ? 'active' : ''} onClick={() => setView('services')}>Services</button>
            </div>

            {view === 'categories' && (
                <div>
                    <div className="services-header">
                        <h2>Service Categories</h2>
                        {role === 'admin' && <button onClick={() => { setFormData({ name: '' }); setEditingId(null); setIsModalOpen(true); }}>Add Category</button>}
                    </div>
                    <div className="category-view">
                        {categories.map(category => (
                            <div key={category._id} className="category-block">
                                <h3>{category.name}</h3>
                                <ul>
                                    {services.filter(s => s.categoryId === category._id).map(service => (
                                        <li key={service._id}>{service.name} — ${service.price} / {service.duration} min</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'services' && (
                <div className="services-view">
                    <div className="services-header">
                        <h2>All Services</h2>
                        {role === 'admin' && <button onClick={() => { setFormData({ name: '', price: '', duration: '', description: '', categoryId: '' }); setEditingId(null); setIsModalOpen(true); }}>Add Service</button>}
                    </div>
                    <table className="service-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Duration</th>
                                <th>Category</th>
                                {role === 'admin' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service._id}>
                                    <td>{service.name}</td>
                                    <td>${service.price}</td>
                                    <td>{service.duration} min</td>
                                    <td>{categories.find(c => c._id === service.categoryId)?.name || 'N/A'}</td>
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
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="services-modal-content">
                        <div className="modal-header">
                            <h3>{editingId ? 'Edit' : 'Create'} {view === 'services' ? 'Service' : 'Category'}</h3>
                            <button className="close-button" onClick={resetForm}>&times;</button>
                        </div>
                        <form className="service-form" onSubmit={handleSubmit}>
                            <input
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            {view === 'services' && (
                                <>
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
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </>
                            )}
                            {error && <p className="error">{error}</p>}
                            <div className="modal-actions">
                                <button type="button" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="submit-button">{editingId ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
