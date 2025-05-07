import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose }) => {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const res = await axios.get('/api/workers');
                console.log('Fetched workers:', res.data);
                setWorkers(res.data);
            } catch (err) {
                console.error('Error fetching workers:', err);
            }
        };
        fetchWorkers();
    }, []);

    useEffect(() => {
        if (selectedWorker && selectedDate && selectedServices.length > 0) {
            const worker = workers.find(w => w._id === selectedWorker);
            const totalDuration = selectedServices.reduce((acc, id) => {
                const svc = worker.services.find(s => s._id === id);
                return acc + (svc?.duration || 0);
            }, 0);

            const takenSlots = worker.timeSlotsTaken[selectedDate] || [];
            const start = parseTime(worker.workingHours.start);
            const end = parseTime(worker.workingHours.end);

            const slots = [];
            for (let time = start; time + totalDuration <= end; time += 15) {
                let conflict = false;
                for (let i = 0; i < totalDuration; i += 15) {
                    const timeStr = formatTime(time + i);
                    if (takenSlots.includes(timeStr)) conflict = true;
                }
                if (!conflict) slots.push(formatTime(time));
            }
            setAvailableTimeSlots(slots);
        }
    }, [selectedWorker, selectedDate, selectedServices, workers]);

    const handleSubmit = async () => {
        try {
            const res = await axios.post('/api/bookings', {
                customerName: customer.name,
                customerPhone: customer.phone,
                customerEmail: customer.email,
                workerId: selectedWorker,
                serviceIds: selectedServices,
                startTime: `${selectedDate}T${selectedTime}`,
            });

            if (res.status === 201) {
                console.log('Booking created:', res.data.booking);
                onClose();
            }
        } catch (err) {
            console.error('Booking creation failed:', err.response?.data || err.message);
        }
    };

    return isOpen ? (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>Create Booking</h2>

                <label>Worker:</label>
                <select onChange={e => setSelectedWorker(e.target.value)}>
                    <option value=''>Select Worker</option>
                    {workers.map(w => (
                        <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                </select>

                {selectedWorker && (
                    <>
                        <label>Services:</label>
                        {workers.find(w => w._id === selectedWorker)?.services.map(svc => (
                            <div key={svc._id}>
                                <input type="checkbox" value={svc._id} onChange={e => {
                                    setSelectedServices(prev =>
                                        e.target.checked ? [...prev, svc._id] : prev.filter(id => id !== svc._id)
                                    );
                                }} /> {svc.name} ({svc.duration} mins)
                            </div>
                        ))}

                        <label>Date:</label>
                        <input type="date" onChange={e => setSelectedDate(e.target.value)} />

                        <label>Time Slot:</label>
                        <select onChange={e => setSelectedTime(e.target.value)}>
                            <option value=''>Select Time</option>
                            {availableTimeSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>

                        <label>Customer Info:</label>
                        <input placeholder="Name" onChange={e => setCustomer({ ...customer, name: e.target.value })} />
                        <input placeholder="Phone" onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
                        <input placeholder="Email" onChange={e => setCustomer({ ...customer, email: e.target.value })} />

                        <button onClick={handleSubmit}>Submit Booking</button>
                    </>
                )}
            </div>
        </div>
    ) : null;
};

export default BookingModal;

function parseTime(str) {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
}

function formatTime(mins) {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
} 
