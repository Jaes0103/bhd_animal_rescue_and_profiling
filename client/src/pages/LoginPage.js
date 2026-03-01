import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaPaw, FaDove, FaCat, FaDog, FaEye, FaEyeSlash, FaHeart } from 'react-icons/fa';
import './AuthPages.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check if already logged in on mount only
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setLoading(true);
    setError(''); // Clear previous errors

    try {
      await login(credentials);
      toast.success('Welcome back!');
      // Keep loading screen visible for 1.5 seconds before navigating
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);

      // Force re-render to ensure error is displayed
      setTimeout(() => {
        console.log('Error should be visible:', errorMessage);
      }, 100);
    }
  };

  return (
    <div className="auth-page">
      {/* Loading Screen Overlay */}
      {loading && (
        <div className="loading-overlay">
          {/* Floating Animal Icons Background */}
          <div className="animal-icons-bg">
            <FaDog className="float-icon float-dog-1" />
            <FaCat className="float-icon float-cat-1" />
            <FaPaw className="float-icon float-paw-1" />
            <FaHeart className="float-icon float-heart-1" />
            <FaDog className="float-icon float-dog-2" />
            <FaCat className="float-icon float-cat-2" />
            <FaPaw className="float-icon float-paw-2" />
            <FaHeart className="float-icon float-heart-2" />
          </div>

          <div className="loading-content">
            {/* Main Loading Circle */}
            <div className="paw-container">
              <div className="paw-circle-orbit">
                <FaPaw className="orbit-paw orbit-1" />
                <FaPaw className="orbit-paw orbit-2" />
                <FaPaw className="orbit-paw orbit-3" />
              </div>
              <div className="paw-glow"></div>
              <FaPaw className="loading-paw" />
            </div>

            {/* Logo */}
            <div className="loading-logo">
              <img src="/assets/bhd-logo.jpg" alt="BHD" className="logo-img" />
            </div>

            <h2>Logging you in...</h2>
            <p className="loading-subtitle">Bantay Hayop Davao</p>

            <div className="loading-dots-container">
              <span className="loading-dot"></span>
              <span className="loading-dot"></span>
              <span className="loading-dot"></span>
            </div>

            <p className="loading-tagline">🐾 Every paw matters 🐾</p>
          </div>
        </div>
      )}

      {/* Floating Animal Decorations */}
      <div className="auth-decorations">
        <FaPaw className="floating-animal animal-1" />
        <FaDove className="floating-animal animal-2" />
        <FaCat className="floating-animal animal-3" />
        <FaDog className="floating-animal animal-4" />
        <FaPaw className="floating-animal animal-5" />
        <FaDove className="floating-animal animal-6" />
      </div>

      <div className="auth-container">
        <div className="auth-header">
          <img
            src="/assets/bhd-logo.jpg"
            alt="Bantay Hayop Davao Logo"
            className="auth-logo-img"
          />
          <h1>Bantay Hayop Davao</h1>
          <p>Animal Profiling System</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={credentials.username}
              onChange={(e) => {
                setCredentials({ ...credentials, username: e.target.value });
                if (error) setError(''); // Clear error on input change
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={credentials.password}
                onChange={(e) => {
                  setCredentials({ ...credentials, password: e.target.value });
                  if (error) setError(''); // Clear error on input change
                }}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

        <p className="auth-footer">
          <Link to="/">View Available Animals</Link>
        </p>
      </div>

      {/* Copyright Footer */}
      <div className="auth-copyright">
        <div className="footer-logo">
          <img src="/assets/bhd-logo.jpg" alt="BHD Logo" />
        </div>
        <div className="footer-text">
          <p>All Rights Reserved · Bantay Hayop Davao © 2026</p>
          <p className="auth-tagline">Animal Watch Philippines</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
