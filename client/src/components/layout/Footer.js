import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src="/assets/bhd-logo.jpg" alt="Bantay Hayop Davao" className="footer-logo-img" />
        </div>
        <div className="footer-text">
          <p>All Rights Reserved &middot; Bantay Hayop Davao &copy; 2026</p>
          <p className="footer-subtitle">Animal Watch Philippines</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
