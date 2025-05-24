import React, { useState } from 'react';
import axios from '../../utils/axiosInstance';
import './Posts.css';

const Posts = () => {
    const [imageFile, setImageFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [captionLoading, setCaptionLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setCaption('');
            setSuccessMessage('');
            setError('');
        }
    };

    const generateCaption = async () => {
        if (!imageFile) return setError('Upload an image first.');

        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            setCaptionLoading(true);
            const res = await axios.post('/api/gpt/caption', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const cleanedCaption = res.data.caption.replace(/^"(.*)"$/, '$1');
            setCaption(cleanedCaption);
        } catch (err) {
            setError('Failed to generate caption.');
        } finally {
            setCaptionLoading(false);
        }
    };

    const handlePost = async () => {
        if (!imageFile || !caption) {
            return setError('Both image and caption are required.');
        }

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('caption', caption);

        try {
            setLoading(true);
            await axios.post('/api/socialmedia', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
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
            <div className="posts-header">
                <h2>Social Media Manager</h2>
                <p className="posts-subtitle">Create engaging posts with AI-powered captions</p>
            </div>

            <div className="posts-content">
                <div className="posts-left-section">
                    <div className="posts-upload-section">
                        <div className="upload-icon">📸</div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <div className="upload-instructions">
                            Select an image to get started with your social media post
                        </div>
                    </div>

                    {previewUrl && (
                        <div className="image-preview">
                            <img src={previewUrl} alt="preview" />
                        </div>
                    )}
                </div>

                <div className="posts-right-section">
                    <div className="action-section">
                        <button
                            onClick={generateCaption}
                            disabled={captionLoading || !imageFile}
                            className={`generate-caption-btn ${captionLoading ? 'loading' : ''}`}
                        >
                            <span className="button-content">
                                {captionLoading && <span className="loading-spinner" />}
                                ✨ Generate Caption with AI
                            </span>
                        </button>

                        {captionLoading ? (
                            <div className="caption-loading" />
                        ) : (
                            <textarea
                                placeholder="Write your own caption or use AI to generate one..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                rows={3}
                            />
                        )}

                        <button
                            onClick={handlePost}
                            disabled={loading || !imageFile || !caption}
                            className={`post-btn ${loading ? 'loading' : ''}`}
                        >
                            <span className="button-content">
                                {loading && <span className="loading-spinner" />}
                                🚀 Post to Facebook
                            </span>
                        </button>

                        {successMessage && <p className="success">{successMessage}</p>}
                        {error && <p className="error">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Posts;
