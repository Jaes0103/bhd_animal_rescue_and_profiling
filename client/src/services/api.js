import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Only redirect if not already on login page (to handle session expiration)
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile')
};

// Animals API
export const animalsAPI = {
  getAll: (params) => api.get('/animals', { params }),
  getById: (id) => api.get(`/animals/${id}`),
  create: (data) => api.post('/animals', data),
  update: (id, data) => api.put(`/animals/${id}`, data),
  updateStatus: (id, data) => api.patch(`/animals/${id}/status`, data),
  getNeedingAttention: () => api.get('/animals/needing-attention'),
  delete: (id) => api.delete(`/animals/${id}`),
  addPhoto: (data) => api.post('/animals/photos', data)
};

// Medical API
export const medicalAPI = {
  getRecords: (animalId) => api.get(`/medical/${animalId}`),
  create: (data) => api.post('/medical', data),
  update: (id, data) => api.put(`/medical/${id}`, data),
  delete: (id) => api.delete(`/medical/${id}`)
};

// Observations API
export const observationsAPI = {
  getAll: (params) => api.get('/observations', { params }),
  getById: (id) => api.get(`/observations/${id}`),
  create: (data) => api.post('/observations', data),
  update: (id, data) => api.put(`/observations/${id}`, data),
  delete: (id) => api.delete(`/observations/${id}`)
};

// Medications API
export const medicationsAPI = {
  getAll: (params) => api.get('/medications', { params }),
  getDueToday: () => api.get('/medications/due-today'),
  getById: (id) => api.get(`/medications/${id}`),
  getAnimalHistory: (animalId) => api.get(`/medications/animal/${animalId}`),
  create: (data) => api.post('/medications', data),
  update: (id, data) => api.put(`/medications/${id}`, data),
  delete: (id) => api.delete(`/medications/${id}`),
  markAsGiven: (data) => api.post('/medications/mark-given', data)
};

// Adoptions API
export const adoptionsAPI = {
  getApplications: (params) => api.get('/adoptions/applications', { params }),
  createApplication: (data) => api.post('/adoptions/applications', data),
  reviewApplication: (id, data) => api.put(`/adoptions/applications/${id}/review`, data),
  getAdoptions: () => api.get('/adoptions'),
  createAdoption: (data) => api.post('/adoptions', data)
};

// Foster API
export const fosterAPI = {
  getRecords: (params) => api.get('/foster', { params }),
  getByAnimalId: (animalId) => api.get(`/foster/animal/${animalId}`),
  create: (data) => api.post('/foster', data),
  update: (id, data) => api.put(`/foster/${id}`, data),
  addUpdate: (fosterCareId, data) => api.post(`/foster/${fosterCareId}/updates`, data),
  getUpdates: (fosterCareId) => api.get(`/foster/${fosterCareId}/updates`)
};

// Donations API
export const donationsAPI = {
  getAll: (params) => api.get('/donations', { params }),
  create: (data) => api.post('/donations', data),
  getStats: () => api.get('/donations/stats')
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (userData) => api.post('/users', userData),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`)
};

// Locations API
export const locationsAPI = {
  getAll: (params) => api.get('/locations', { params }),
  getById: (id) => api.get(`/locations/${id}`),
  getAnimals: (id) => api.get(`/locations/${id}/animals`),
  getHistory: (id) => api.get(`/locations/${id}/history`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
  transfer: (data) => api.post('/locations/transfer', data)
};

// Rescue Markers API
export const rescueMarkersAPI = {
  getAll: (params) => api.get('/rescue-markers', { params }),
  getById: (id) => api.get(`/rescue-markers/${id}`),
  create: (data) => api.post('/rescue-markers', data),
  update: (id, data) => api.put(`/rescue-markers/${id}`, data),
  delete: (id) => api.delete(`/rescue-markers/${id}`)
};

// Disease Zones API
export const diseaseZonesAPI = {
  getAll: (params) => api.get('/disease-zones', { params }),
  getById: (id) => api.get(`/disease-zones/${id}`),
  create: (data) => api.post('/disease-zones', data),
  update: (id, data) => api.put(`/disease-zones/${id}`, data),
  delete: (id) => api.delete(`/disease-zones/${id}`)
};

export default api;
