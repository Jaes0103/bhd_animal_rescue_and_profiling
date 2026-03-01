import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animalsAPI } from '../services/api';
import { FaPaw, FaHeart, FaSearch, FaHandHoldingHeart, FaHome, FaDonate, FaDog, FaCat } from 'react-icons/fa';
import './PublicAnimalsPage.css';

const PublicAnimalsPage = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [filters, setFilters] = useState({ species: '', search: '' });

  useEffect(() => {
    loadAnimals();
  }, [filters]);

  const loadAnimals = async () => {
    try {
      const response = await animalsAPI.getAll({ ...filters, status: 'available_for_adoption' });
      setAnimals(response.data);
    } catch (error) {
      console.error('Error loading animals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-animals-page">
      {/* Loading Screen Overlay */}
      {navigating && (
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

            <h2>Redirecting to Staff Portal...</h2>
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

      {/* Floating Paw Prints Decoration */}
      <div className="paw-prints-decoration">
        <FaPaw className="floating-paw paw-1" />
        <FaPaw className="floating-paw paw-2" />
        <FaPaw className="floating-paw paw-3" />
        <FaPaw className="floating-paw paw-4" />
        <FaPaw className="floating-paw paw-5" />
        <FaPaw className="floating-paw paw-6" />
        <FaPaw className="floating-paw paw-7" />
        <FaPaw className="floating-paw paw-8" />
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="container hero-content">
          <div className="logo-container">
            <img
              src="/assets/bhd-logo.jpg"
              alt="Bantay Hayop Davao Logo"
              className="hero-logo-img"
            />
          </div>
          <h1 className="hero-title">Bantay Hayop Davao</h1>
          <p className="hero-subtitle">🐾 Animal Watch Philippines 🐾</p>
          <p className="hero-description">
            Every pet deserves a loving home. Find your perfect furry companion today!
          </p>
          <p className="hero-tagline">
            "Saving one animal won't change the world, but it will change the world for that one animal."
          </p>
          <div className="hero-buttons">
            <Link
              to="/login"
              className="btn btn-hero"
              onClick={(e) => {
                e.preventDefault();
                setNavigating(true);
                setTimeout(() => {
                  window.location.href = '/login';
                }, 1500);
              }}
            >
              <FaPaw /> Staff Login
            </Link>
          </div>
        </div>
      </div>

      {/* Paw Print Divider */}
      <div className="paw-divider">
        <FaPaw />
        <FaPaw />
        <FaPaw />
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="container">
          <h2 className="stats-title">
            <FaPaw className="title-paw" /> Our Impact <FaPaw className="title-paw" />
          </h2>
          <div className="stats-grid">
            <div className="stat-card">
              <FaHeart className="stat-icon" />
              <h3>{animals.length}</h3>
              <p>Looking for Homes</p>
              <div className="stat-emoji">🐕</div>
            </div>
            <div className="stat-card">
              <FaPaw className="stat-icon" />
              <h3>100+</h3>
              <p>Happy Adoptions</p>
              <div className="stat-emoji">❤️</div>
            </div>
            <div className="stat-card">
              <FaHome className="stat-icon" />
              <h3>24/7</h3>
              <p>Love & Care</p>
              <div className="stat-emoji">🏠</div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Animals Section */}
      <div className="container animals-section">
        {/* Corner Decorations */}
        <div className="corner-decoration corner-top-left">
          <FaPaw />
        </div>
        <div className="corner-decoration corner-top-right">
          <FaPaw />
        </div>
        <div className="section-header">
          <h2><FaHeart className="heart-icon" /> Meet Your New Best Friend</h2>
          <p className="section-description">
            These wonderful fur babies are waiting for their forever families.
            Could you be the one to give them a loving home?
          </p>
        </div>

        {/* Filters */}
        <div className="public-filters">
          <div className="filter-group">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or breed..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="filter-input"
            />
          </div>

          <select
            value={filters.species}
            onChange={(e) => setFilters({ ...filters, species: e.target.value })}
            className="filter-select"
          >
            <option value="">All Animals</option>
            <option value="dog">🐕 Dogs</option>
            <option value="cat">🐈 Cats</option>
            <option value="other">🐾 Other</option>
          </select>
        </div>

        {/* Animals Grid */}
        {loading ? (
          <div className="loading-container">
            <FaPaw className="spinner-paw" />
            <p>Loading our furry friends...</p>
          </div>
        ) : animals.length === 0 ? (
          <div className="empty-state">
            <FaPaw className="empty-icon" />
            <h3>No animals available right now</h3>
            <p>Check back soon! New friends arrive regularly.</p>
          </div>
        ) : (
          <div className="public-animals-grid">
            {animals.map((animal) => (
              <div key={animal.id} className="public-animal-card">
                <div className="card-badge">
                  <FaHeart /> Adopt Me!
                </div>
                <div className="public-animal-image">
                  {animal.photos && animal.photos[0]?.photo_url ? (
                    <img src={animal.photos[0].photo_url} alt={animal.name} />
                  ) : (
                    <div className="placeholder-image">
                      <FaPaw />
                      <p>No Photo Yet</p>
                    </div>
                  )}
                </div>
                <div className="public-animal-content">
                  <h3>{animal.name}</h3>
                  <p className="animal-info">
                    {animal.breed || animal.species} • {animal.gender}
                  </p>
                  <p className="animal-age">
                    {animal.age_years > 0 && `${animal.age_years} ${animal.age_years === 1 ? 'year' : 'years'} `}
                    {animal.age_months > 0 && `${animal.age_months} ${animal.age_months === 1 ? 'month' : 'months'}`}
                    {!animal.age_years && !animal.age_months && 'Age unknown'}
                  </p>
                  {animal.description && (
                    <p className="animal-description">
                      {animal.description.substring(0, 120)}
                      {animal.description.length > 120 && '...'}
                    </p>
                  )}
                  <div className="animal-features">
                    {animal.spayed_neutered && <span className="feature">✓ Spayed/Neutered</span>}
                    {animal.vaccinated && <span className="feature">✓ Vaccinated</span>}
                    {animal.microchipped && <span className="feature">✓ Microchipped</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How to Adopt Section */}
      <div className="how-to-adopt-section">
        <div className="container">
          <h2><FaHandHoldingHeart /> How to Adopt</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <FaSearch className="step-icon" />
              <h3>Find Your Match</h3>
              <p>Browse our available animals and find the perfect companion for your family</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <FaHeart className="step-icon" />
              <h3>Contact Us</h3>
              <p>Reach out to learn more about the adoption process and meet your new friend</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <FaHome className="step-icon" />
              <h3>Bring Them Home</h3>
              <p>Complete the adoption and welcome your new family member with love</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <FaPaw className="cta-icon" />
          <h2>Want to Help?</h2>
          <p>There are many ways to support our mission of saving animals</p>
          <div className="cta-buttons">
            <a href="mailto:contact@bantayhayopdavao.org" className="btn btn-cta">
              <FaHeart /> Adopt an Animal
            </a>
            <a href="mailto:volunteer@bantayhayopdavao.org" className="btn btn-cta-outline">
              <FaHandHoldingHeart /> Become a Volunteer
            </a>
            <a href="mailto:donate@bantayhayopdavao.org" className="btn btn-cta-outline">
              <FaDonate /> Make a Donation
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="public-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3><FaPaw /> Bantay Hayop Davao</h3>
              <p>Animal Watch Philippines</p>
              <p>Davao City, Philippines</p>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Email: info@bantayhayopdavao.org</p>
              <p>Follow us on social media</p>
            </div>
            <div className="footer-section">
              <h4>Get Involved</h4>
              <p>Adopt • Foster • Volunteer</p>
              <p>Donate • Share our mission</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Bantay Hayop Davao - Made with ❤️ for animals in need</p>
            <p className="developer-credit">
              Developed by <strong>Jessica Ramirez Bagolor</strong> | Full Stack Developer
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicAnimalsPage;
