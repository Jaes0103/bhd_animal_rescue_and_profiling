import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnimalsPage from './pages/AnimalsPage';
import AnimalDetailsPage from './pages/AnimalDetailsPage';
import AreaManagementPage from './pages/AreaManagementPage';
import AdoptionsPage from './pages/AdoptionsPage';
import FosterPage from './pages/FosterPage';
import DonationsPage from './pages/DonationsPage';
import UsersPage from './pages/UsersPage';
import LocationsPage from './pages/LocationsPage';
import PublicAnimalsPage from './pages/PublicAnimalsPage';
import RescueMarkersPage from './pages/RescueMarkersPage';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicAnimalsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Private routes with MainLayout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/animals"
        element={
          <PrivateRoute>
            <MainLayout>
              <AnimalsPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/animals/:id"
        element={
          <PrivateRoute>
            <MainLayout>
              <AnimalDetailsPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/adoptions"
        element={
          <PrivateRoute roles={['admin', 'volunteer']}>
            <MainLayout>
              <AdoptionsPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/foster"
        element={
          <PrivateRoute roles={['admin', 'volunteer']}>
            <MainLayout>
              <FosterPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/donations"
        element={
          <PrivateRoute roles={['admin', 'volunteer']}>
            <MainLayout>
              <DonationsPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/areas"
        element={
          <PrivateRoute roles={['admin', 'staff']}>
            <MainLayout>
              <AreaManagementPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute roles={['admin']}>
            <MainLayout>
              <UsersPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/locations"
        element={
          <PrivateRoute roles={['admin', 'staff']}>
            <MainLayout>
              <LocationsPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/rescue-map"
        element={
          <PrivateRoute roles={['admin', 'volunteer']}>
            <MainLayout>
              <RescueMarkersPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
