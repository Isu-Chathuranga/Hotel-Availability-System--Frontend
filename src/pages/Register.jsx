import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';
import './Register.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('traveler');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = { name, email, password, phone, role };
      await register(data);
      navigate(role === 'owner' ? '/owner/dashboard' : '/home');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-card register-card-layout">
        <div className="auth-image-side">
          <img
            src="https://images.unsplash.com/photo-1572307480816-4ae3267c8c0f?w=557&h=696&fit=crop"
            alt="Travel destination"
            className="auth-image"
          />
        </div>
        <div className="auth-form-side">
          <div className="auth-form-container">
            <h1 className="auth-title">Hello Again!</h1>
            <p className="auth-subtitle">Do you haven't a account? create a account here..</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                <span className="auth-label">Full Name</span>
                <input
                  type="text"
                  className="auth-input"
                  placeholder=""
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="auth-input-group">
                <span className="auth-label">E Mail</span>
                <input
                  type="email"
                  className="auth-input"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="auth-input-group">
                <span className="auth-label">Password</span>
                <input
                  type="password"
                  className="auth-input"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="auth-input-group">
                <span className="auth-label">Confirm Password</span>
                <input
                  type="password"
                  className="auth-input"
                  placeholder=""
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="auth-input-group">
                <span className="auth-label">Phone Number</span>
                <input
                  type="tel"
                  className="auth-input"
                  placeholder=""
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
              <div className="auth-input-group">
                <span className="auth-label">I am a</span>
                <select
                  className="auth-input auth-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="traveler">Traveler</option>
                  <option value="owner">Hotel Owner</option>
                </select>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Creating account...' : 'Create an Account'}
              </button>
            </form>

            <p className="auth-footer-text">
              Do you have account?{' '}
              <Link to="/login" className="auth-link">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
