import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaPaw,
  FaTachometerAlt,
  FaDog,
  FaCat,
  FaHeart,
  FaHeartbeat,
  FaClipboardList,
  FaHandHoldingHeart,
  FaHome,
  FaDonate,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMapMarkerAlt,
  FaTh,
  FaMap
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleLogout = () => {
    setLoggingOut(true);
    setProgress(0);

    // Animate progress from 0 to 100 over 1.5 seconds
    const duration = 1500;
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(Math.floor(newProgress));

      if (newProgress < 100) {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);

    setTimeout(() => {
      logout();
      navigate('/login');
    }, duration);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <FaTachometerAlt />,
      roles: ['admin', 'staff', 'driver', 'volunteer']
    },
    {
      title: 'Animals',
      path: '/animals',
      icon: <FaDog />,
      roles: ['admin', 'staff', 'driver', 'volunteer']
    },
    {
      title: 'Area Management',
      path: '/areas',
      icon: <FaTh />,
      roles: ['admin', 'staff']
    },
    {
      title: 'Locations',
      path: '/locations',
      icon: <FaMapMarkerAlt />,
      roles: ['admin', 'staff']
    },
    {
      title: 'Rescue Map',
      path: '/rescue-map',
      icon: <FaMap />,
      roles: ['admin', 'volunteer']
    },
    {
      title: 'Adoptions',
      path: '/adoptions',
      icon: <FaHome />,
      roles: ['admin', 'volunteer']
    },
    {
      title: 'Foster Care',
      path: '/foster',
      icon: <FaHandHoldingHeart />,
      roles: ['admin', 'volunteer']
    },
    {
      title: 'Donations',
      path: '/donations',
      icon: <FaDonate />,
      roles: ['admin', 'volunteer']
    },
    {
      title: 'Users',
      path: '/users',
      icon: <FaUsers />,
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item =>
    hasRole(...item.roles)
  );

  return (
    <>
      {/* Loading Screen Overlay */}
      {loggingOut && (
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

            <h2>Logging you out...</h2>
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

      {/* Mobile Toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <FaBars /> : <FaTimes />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Logo/Brand */}
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-brand">
            {!collapsed ? (
              <>
                <img src="/assets/bhd-logo.jpg" alt="Bantay Hayop Davao" className="brand-logo" />
                <span className="brand-text">Bantay Hayop Davao</span>
              </>
            ) : (
              <FaPaw className="brand-icon" />
            )}
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              title={collapsed ? item.title : ''}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-text">{item.title}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="user-info">
                <div className="user-name">{user?.full_name || user?.username}</div>
                <div className={`user-role badge-${user?.role === 'admin' ? 'danger' : 'purple'}`}>
                  {user?.role}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-logout"
            title="Logout"
          >
            <FaSignOutAlt />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="sidebar-overlay"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;
