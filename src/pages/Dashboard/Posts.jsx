import React, { useState } from 'react';
import axios from '../../utils/axiosInstance';
import './Posts.css';

const Posts = () => {
    const [images, setImages] = useState([]);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        const urls = files.map(file => URL.createObjectURL(file));
        setImages(urls);
        setCaption('');
        setSuccessMessage('');
        setError('');
    };

    const generateCaption = async () => {
        if (!images[0]) return;

        try {
            setLoading(true);
            const res = await axios.post('/api/caption', { imageUrl: images[0] });
            setCaption(res.data.caption);
        } catch (err) {
            setError('Failed to generate caption.');
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async () => {
        if (!images[0] || !caption) {
            setError('Image and caption required.');
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post('/api/socialmedia', {
                caption,
                imageUrl: images[0]
            });
            setSuccessMessage('Posted successfully!');
        } catch (err) {
            setError('Failed to post to Facebook.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="posts-container">
            <h2>Social Media Post</h2>
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
            />

            {images.length > 0 && (
                <div className="image-preview">
                    {images.map((img, i) => (
                        <img key={i} src={img} alt={`upload-${i}`} />
                    ))}
                </div>
            )}

            <button onClick={generateCaption} disabled={loading}>
                Generate Caption
            </button>

            {caption && (
                <div className="caption-box">
                    <p>{caption}</p>
                </div>
            )}

            <button onClick={handlePost} disabled={loading || !caption}>
                Post to Facebook
            </button>

            {successMessage && <p className="success">{successMessage}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default Posts;
