import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authAPI, hotelsAPI } from '../utils/api';
import { hotelRegistrationSchema } from '../lib/validations';
import './HotelOwnerRegister.css';

const STAR_SVG = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 13.27l-4.77 2.51.91-5.32L2.27 7.62l5.34-.78L12 2z" stroke="#99A1AF" strokeWidth="1.33"/>
  </svg>
);

const STAR_SVG_FILLED = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FDC700">
    <path d="M12 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 13.27l-4.77 2.51.91-5.32L2.27 7.62l5.34-.78L12 2z"/>
  </svg>
);

export default function HotelOwnerRegister() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(hotelRegistrationSchema),
  });

  const onSubmit = async (data) => {
    setError('');
    try {
      await authAPI.register({
        name: data.hotelName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: 'owner',
      });

      await hotelsAPI.create({
        name: data.hotelName,
        description: data.description,
        location: data.city,
        address: data.address,
        city: data.city,
        country: data.country,
        rating,
      });

      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  const renderStars = () => (
    <div className="hor-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className="hor-star" onClick={() => setRating(i)}>
          {i <= rating ? STAR_SVG_FILLED : STAR_SVG}
        </span>
      ))}
    </div>
  );

  return (
    <div className="hor-page">
      <div className="hor-bg">
        <div className="hor-center">
          <div className="hor-content">
            <h1 className="hor-title">Register Your Hotel</h1>
            <p className="hor-subtitle">Join our platform and reach thousands of travelers</p>
            <p className="hor-login-text">
              Already registered? <Link to="/hotel-owner-login" className="hor-login-link">Login here</Link>
            </p>

            <div className="hor-card">
              <div className="hor-card-header">
                <div className="hor-card-title">Hotel Registration</div>
                <div className="hor-card-desc">Enter your hotel details to get started. You can manage events, destinations, and images later from your dashboard.</div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="hor-form-body">
                <div className="hor-row">
                  <div className="hor-field">
                    <label className="hor-label">Hotel Name *</label>
                    <input className="hor-input" placeholder="Grand Plaza Hotel" {...register('hotelName')} />
                    {errors.hotelName && <span className="hor-error">{errors.hotelName.message}</span>}
                  </div>
                  <div className="hor-field">
                    <label className="hor-label">Star Rating *</label>
                    {renderStars()}
                  </div>
                </div>
                <div className="hor-row">
                  <div className="hor-field">
                    <label className="hor-label">Email *</label>
                    <input className="hor-input" placeholder="contact@grandplaza.com" {...register('email')} />
                    {errors.email && <span className="hor-error">{errors.email.message}</span>}
                  </div>
                  <div className="hor-field">
                    <label className="hor-label">Password *</label>
                    <input type="password" className="hor-input" placeholder="Enter a password" {...register('password')} />
                    {errors.password && <span className="hor-error">{errors.password.message}</span>}
                  </div>
                </div>
                <div className="hor-row">
                  <div className="hor-field">
                    <label className="hor-label">Phone *</label>
                    <input className="hor-input" placeholder="+1 234 567 8900" {...register('phone')} />
                    {errors.phone && <span className="hor-error">{errors.phone.message}</span>}
                  </div>
                  <div className="hor-field" />
                </div>
                <div className="hor-field hor-field-full">
                  <label className="hor-label">Address *</label>
                  <input className="hor-input" placeholder="123 Main Street" {...register('address')} />
                  {errors.address && <span className="hor-error">{errors.address.message}</span>}
                </div>
                <div className="hor-row">
                  <div className="hor-field">
                    <label className="hor-label">City *</label>
                    <input className="hor-input" placeholder="New York" {...register('city')} />
                    {errors.city && <span className="hor-error">{errors.city.message}</span>}
                  </div>
                  <div className="hor-field">
                    <label className="hor-label">Country *</label>
                    <input className="hor-input" placeholder="United States" {...register('country')} />
                    {errors.country && <span className="hor-error">{errors.country.message}</span>}
                  </div>
                </div>
                <div className="hor-field hor-field-full">
                  <label className="hor-label">Description *</label>
                  <textarea className="hor-textarea" placeholder="Describe your hotel, its unique features, and what makes it special..." {...register('description')} />
                  {errors.description && <span className="hor-error">{errors.description.message}</span>}
                </div>
                {error && <div className="hor-error">{error}</div>}
                <div className="hor-actions">
                  <button type="submit" className="hor-btn hor-btn-complete" disabled={isSubmitting}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="4" y="1.33" width="8" height="13.33" rx="1.33" stroke="white" strokeWidth="1.33"/>
                      <rect x="1.33" y="8" width="2.67" height="6.67" rx="1.33" stroke="white" strokeWidth="1.33"/>
                      <rect x="12" y="6" width="2.67" height="8.67" rx="1.33" stroke="white" strokeWidth="1.33"/>
                    </svg>
                    {isSubmitting ? 'Registering...' : 'Complete Registration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="hor-overlay" onClick={() => setShowSuccess(false)}>
          <div className="hor-overlay-card" onClick={e => e.stopPropagation()}>
            <div className="hor-success-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="6.67" y="6.66" width="66.67" height="66.67" rx="33.33" stroke="#00A63E" strokeWidth="6.67"/>
                <rect x="30" y="13.33" width="43.33" height="33.33" rx="4" stroke="#00A63E" strokeWidth="6.67"/>
              </svg>
            </div>
            <h2 className="hor-success-title">Registration Successfully!</h2>
            <p className="hor-success-text">Your hotel has been registered. You can now manage events, destinations, and images from your dashboard.</p>
            <button className="hor-dashboard-btn" onClick={() => navigate('/hotel-owner-dashboard')}>Go to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}
