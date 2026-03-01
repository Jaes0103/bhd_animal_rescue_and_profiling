# Bantay Hayop Davao - Animal Profiling System

A comprehensive PERN (PostgreSQL, Express, React, Node.js) stack application for managing animal rescue, adoption, foster care, and donations for Bantay Hayop Davao - Animal Watch Philippines.

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run this application is using Docker. Everything (database, backend, frontend) will be set up automatically with sample data.

### Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- That's it! No need to install Node.js, PostgreSQL, or anything else.

### Setup and Run

```bash
# Clone the repository
git clone <repository-url>
cd bantay-hayop-davao

# Start everything with one command
docker compose up -d --build
```

That's it! The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **PostgreSQL**: localhost:5432

### Default Login Credentials

```
Username: admin
Password: admin123
```

⚠️ **IMPORTANT**: Change the default password after first login!

### Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Stop all services
docker compose down

# Stop and remove all data (fresh start)
docker compose down -v

# Restart a specific service
docker compose restart backend

# Rebuild after code changes
docker compose up -d --build
```

### What Gets Set Up Automatically?

✅ PostgreSQL database with all tables
✅ Default admin user (admin/admin123)
✅ Sample animals (3 animals with photos)
✅ Sample medical records
✅ Sample foster care record
✅ Sample donations
✅ Backend API server
✅ Frontend React application

---

## 📦 Manual Installation (Without Docker)

If you prefer to run without Docker, follow these steps:

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
npm run db:init

# Start backend
npm run dev
```

### Frontend Setup

```bash
cd client
npm install

# Start frontend
npm start
```

---

## Features

### Animal Management
- 📋 Complete animal profiles with photos, medical records, and behavior notes
- 🔍 Advanced search and filtering (by species, status, breed)
- 📊 Track animal status (Available, Adopted, Fostered, Medical Hold)
- 💉 Medical history tracking (vaccinations, treatments, checkups)
- 📸 Multiple photo uploads per animal

### Adoption System
- 📝 Public adoption application form
- ✅ Application review and approval workflow
- 📋 Track adoption history and contracts
- 💰 Adoption fee management

### Foster Care Management
- 🏠 Foster placement tracking
- 👥 Foster parent information
- ⏱️ Duration tracking (active, completed, returned)
- 📝 Notes and follow-up management

### Donations
- 💵 Cash and in-kind donation tracking
- 📊 Donation statistics and reporting
- 🧾 Receipt management
- 📈 Monthly donation trends

### Dashboard & Analytics
- 📊 Real-time statistics and metrics
- 📈 Animal intake and adoption trends
- ⚠️ Upcoming medical appointments
- 📝 Activity logs
- 🎯 Quick stats overview

### User Management
- 🔐 Secure authentication (JWT)
- 👥 Role-based access control (Admin, Volunteer, Public)
- 👤 User profiles and activity tracking

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Toastify** - Notifications

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

### Design
- Custom CSS with Bantay Hayop Davao brand colors:
  - Primary Purple: `#7c3aed`
  - Secondary Navy: `#1e3a8a`
  - Accent Red: `#dc2626`

## Project Structure

```
bantay-hayop-davao/
├── backend/                 # Backend API
│   ├── config/             # Configuration files
│   │   ├── db.js          # Database connection
│   │   ├── initDb.js      # Database initialization
│   │   └── seed.js        # Data seeding
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Authentication & validation
│   ├── routes/            # API routes
│   ├── Dockerfile         # Backend Docker config
│   └── server.js          # Express app entry point
├── client/                 # Frontend React app
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── styles/        # CSS files
│   ├── Dockerfile         # Frontend Docker config (dev)
│   └── Dockerfile.prod    # Frontend Docker config (prod)
├── database/              # Database scripts
│   └── init.sql          # Initial schema creation
├── docker-compose.yml     # Development compose file
├── docker-compose.prod.yml # Production compose file
└── README.md             # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Animals
- `GET /api/animals` - Get all animals (with filters)
- `GET /api/animals/:id` - Get animal by ID
- `POST /api/animals` - Create new animal
- `PUT /api/animals/:id` - Update animal
- `DELETE /api/animals/:id` - Delete animal
- `POST /api/animals/photos` - Add photo to animal

### Medical Records
- `GET /api/medical/:animal_id` - Get medical records for animal
- `POST /api/medical` - Create medical record
- `PUT /api/medical/:id` - Update medical record
- `DELETE /api/medical/:id` - Delete medical record

### Adoptions
- `GET /api/adoptions/applications` - Get adoption applications
- `POST /api/adoptions/applications` - Submit adoption application
- `PUT /api/adoptions/applications/:id/review` - Review application
- `GET /api/adoptions` - Get completed adoptions
- `POST /api/adoptions` - Create adoption record

### Foster Care
- `GET /api/foster` - Get foster records
- `POST /api/foster` - Create foster record
- `PUT /api/foster/:id` - Update foster record

### Donations
- `GET /api/donations` - Get donations
- `POST /api/donations` - Record donation
- `GET /api/donations/stats` - Get donation statistics

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Users
- `GET /api/users` - Get all users (Admin only)
- `PUT /api/users/:id/role` - Update user role (Admin only)

## User Roles

### Admin
- Full access to all features
- User management
- Delete animals and records
- System configuration

### Volunteer
- Manage animals and profiles
- Review adoption applications
- Track foster placements
- Record donations
- View all data

### Public
- View available animals
- Submit adoption applications
- Limited access

## Environment Variables

### Backend (.env)

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/bantay_hayop_davao
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development

# Optional: Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Production Deployment

For production deployment with Nginx and optimized builds:

```bash
# Use production docker-compose file
docker compose -f docker-compose.prod.yml up -d --build
```

This will:
- Build optimized production React build
- Serve frontend through Nginx
- Run backend in production mode
- Use production-ready configurations

Access the application at http://localhost (port 80)

## Database Schema

The application uses the following main tables:

- **users** - User accounts and authentication
- **animals** - Animal profiles and information
- **animal_photos** - Photo gallery for each animal
- **medical_records** - Medical history and vaccinations
- **adoption_applications** - Adoption applications from public
- **adoptions** - Completed adoption records
- **foster_care** - Foster placement tracking
- **donations** - Donation records
- **activity_logs** - System activity tracking

## Troubleshooting

### Docker Issues

**Problem**: Port already in use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5000
lsof -i :5432

# Stop conflicting services or change ports in docker-compose.yml
```

**Problem**: Database connection failed
```bash
# Check database logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

**Problem**: Frontend not loading
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Restart frontend
docker compose restart frontend
```

**Problem**: Changes not reflecting
```bash
# Rebuild the containers
docker compose up -d --build

# Or rebuild specific service
docker compose up -d --build backend
```

### Manual Installation Issues

**Problem**: Database connection error
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

**Problem**: npm install fails
- Clear node_modules: `rm -rf node_modules`
- Clear npm cache: `npm cache clean --force`
- Try again: `npm install`

## Development

### Hot Reload

Both frontend and backend support hot reload in Docker:
- Frontend: Changes to `/client/src` automatically reload
- Backend: Changes to `/backend` automatically restart with nodemon

### Adding New Features

1. Create feature branch
2. Develop and test locally
3. Update documentation
4. Submit pull request

### Database Migrations

To modify the database schema:

1. Update `database/init.sql` for new installations
2. Create migration script in `backend/migrations/`
3. Run migration on existing databases

## Sample Data

The system comes with sample data including:
- 3 sample animals (dogs and cats)
- Medical records
- Foster care record
- Donation records

This helps you explore the system immediately after setup.

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication (7-day expiry)
- Role-based access control
- SQL injection prevention (parameterized queries)
- CORS protection
- Environment variable configuration
- Docker secrets support for production

## Performance Optimizations

- Database indexes on frequently queried fields
- Connection pooling for PostgreSQL
- React lazy loading for routes
- Optimized Docker builds with multi-stage builds (production)
- Nginx caching for static assets (production)

## Future Enhancements

- [ ] Image upload to Cloudinary
- [ ] PDF report generation
- [ ] Email notifications
- [ ] SMS reminders for appointments
- [ ] Advanced analytics and charts
- [ ] Export data to CSV/Excel
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] QR code for animal profiles
- [ ] Volunteer scheduling
- [ ] Inventory management for supplies

## Contributing

This project was created for Bantay Hayop Davao. For contributions or issues, please contact the organization.

## License

MIT License - See LICENSE file for details

## Support

For support or questions:
- Email: admin@bantayhayop.ph
- Create an issue in this repository

## Acknowledgments

- Bantay Hayop Davao team and volunteers
- Animal Watch Philippines
- All supporters and donors
- Open source community

---

**Built with ❤️ for animals in need 🐾**

### Star History

If you find this project useful, please give it a ⭐️

### Screenshots

[Add screenshots of your application here]

---

## Quick Reference

### Essential Commands

```bash
# Start everything
docker compose up -d --build

# Stop everything
docker compose down

# Fresh start (removes all data)
docker compose down -v && docker compose up -d --build

# View all logs
docker compose logs -f

# Access database
docker compose exec postgres psql -U bantay_user -d bantay_hayop_davao
```

### Default URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health
- Database: localhost:5432

### Default Credentials

- Username: `admin`
- Password: `admin123`

**Remember to change this password!**
