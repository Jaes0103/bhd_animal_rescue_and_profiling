const express = require('express');
const cors = require('cors');
require('dotenv').config();
const seedDatabase = require('./config/seed');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/animals', require('./routes/animals'));
app.use('/api/medical', require('./routes/medical'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/observations', require('./routes/observations'));
app.use('/api/adoptions', require('./routes/adoptions'));
app.use('/api/foster', require('./routes/foster'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/users', require('./routes/users'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/rescue-markers', require('./routes/rescueMarkers'));
app.use('/api/disease-zones', require('./routes/diseaseZones'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bantay Hayop Davao API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

// Start server and seed database
const startServer = async () => {
  try {
    // Seed database on startup (only runs if no data exists)
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🐾 Bantay Hayop Davao server running on port ${PORT}`);
      console.log(`📍 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
