import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animalsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AddAnimalForm from '../components/animals/AddAnimalForm';
import './AnimalsPage.css';

const AnimalsPage = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    species: '',
    search: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const { hasRole } = useAuth();

  useEffect(() => {
    loadAnimals();
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [filters]);

  const loadAnimals = async () => {
    try {
      const response = await animalsAPI.getAll(filters);
      setAnimals(response.data);
    } catch (error) {
      toast.error('Error loading animals');
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAnimals = animals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(animals.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      quarantine: 'badge-warning',
      under_observation: 'badge-info',
      in_treatment: 'badge-danger',
      available: 'badge-success',
      pending_adoption: 'badge-purple',
      adopted: 'badge-success',
      fostered: 'badge-info',
      medical_hold: 'badge-danger',
      deceased: 'badge-dark'
    };
    return `badge ${classes[status] || 'badge-info'}`;
  };

  return (
    <div className="animals-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Animals</h1>
            <p>Manage animal profiles and information</p>
          </div>
          {hasRole('admin', 'volunteer', 'staff') && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <FaPlus /> Add Animal
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="card filters-card">
          <div className="filters-grid">
            <div className="filter-group">
              <FaSearch />
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
              <option value="">All Species</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="quarantine">Quarantine</option>
              <option value="under_observation">Under Observation</option>
              <option value="in_treatment">In Treatment</option>
              <option value="available">Available</option>
              <option value="pending_adoption">Pending Adoption</option>
              <option value="adopted">Adopted</option>
              <option value="fostered">Fostered</option>
              <option value="medical_hold">Medical Hold</option>
              <option value="deceased">Deceased</option>
            </select>

            <button
              onClick={() => setFilters({ status: '', species: '', search: '' })}
              className="btn btn-outline"
            >
              <FaFilter /> Clear
            </button>
          </div>
        </div>

        {/* Animals Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : animals.length === 0 ? (
          <div className="empty-state card">
            <p>No animals found</p>
          </div>
        ) : (
          <>
            <div className="animals-count">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, animals.length)} of {animals.length} animals
            </div>
            <div className="animals-grid">
              {currentAnimals.map((animal) => (
                <Link to={`/animals/${animal.id}`} key={animal.id} className="animal-card">
                  <div className="animal-image">
                    {animal.photos && animal.photos[0]?.photo_url ? (
                      <img src={animal.photos[0].photo_url} alt={animal.name} />
                    ) : (
                      <div className="placeholder-image">No Photo</div>
                    )}
                    <span className={getStatusBadgeClass(animal.status)}>
                      {animal.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="animal-content">
                    <h3>{animal.name}</h3>
                    <p className="animal-breed">
                      {animal.breed || animal.species} • {animal.gender}
                    </p>
                    <p className="animal-age">
                      {animal.age_years > 0 && `${animal.age_years}y `}
                      {animal.age_months > 0 && `${animal.age_months}m`}
                    </p>
                    <div className="animal-tags">
                      {animal.spayed_neutered && <span className="tag">Spayed/Neutered</span>}
                      {animal.vaccinated && <span className="tag">Vaccinated</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>

                <div className="pagination-numbers">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="pagination-dots">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Animal Form Modal */}
      {showForm && (
        <AddAnimalForm
          onClose={() => setShowForm(false)}
          onSuccess={() => loadAnimals()}
        />
      )}
    </div>
  );
};

export default AnimalsPage;
