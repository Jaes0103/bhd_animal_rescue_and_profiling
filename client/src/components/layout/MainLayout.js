import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content-wrapper">
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
