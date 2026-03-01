import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaPaw, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 2000);
  };

  return (
    <>
      {/* Loading Screen Overlay for Logout */}
      {loggingOut && (
        <div className="loading-overlay">
          <div className="loading-content">
            <FaPaw className="loading-paw" />
            <h2>Logging you out...</h2>
            <p>See you soon!</p>
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="container navbar-container">
          <Link to="/dashboard" className="navbar-brand">
            <FaPaw className="navbar-logo" />
            <span>Bantay Hayop Davao</span>
          </Link>

        <ul className="navbar-menu">
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/animals">Animals</Link></li>
          {(user?.role === 'admin' || user?.role === 'volunteer') && (
            <>
              <li><Link to="/adoptions">Adoptions</Link></li>
              <li><Link to="/foster">Foster</Link></li>
              <li><Link to="/donations">Donations</Link></li>
            </>
          )}
        </ul>

        <div className="navbar-user">
          <span className="navbar-username">{user?.full_name || user?.username}</span>
          <span className={`navbar-role badge badge-${user?.role === 'admin' ? 'danger' : 'purple'}`}>
            {user?.role}
          </span>
          <button onClick={handleLogout} className="btn-logout" title="Logout">
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
