import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result?.user?.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-card">
        <div className="auth-form-side">
          <div className="auth-form-container">
            <h1 className="auth-title">Hello Again!</h1>
            <p className="auth-subtitle">Do you have a account? Login here..</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
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
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="auth-footer-text">
              Don't you have account?{' '}
              <Link to="/register" className="auth-link">Create an account</Link>
            </p>
          </div>
        </div>
        <div className="auth-image-side">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=557&h=696&fit=crop"
            alt="Luxury hotel"
            className="auth-image"
          />
        </div>
      </div>
    </div>
  );
}
