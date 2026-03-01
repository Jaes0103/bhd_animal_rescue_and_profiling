# 🐾 Bantay Hayop Davao - Docker Quick Start Guide

## One Command Setup! 🚀

Get the entire application running with database, backend, and frontend in one command:

```bash
docker compose up -d --build
```

## What You Need

- Docker Desktop ([Download here](https://www.docker.com/products/docker-desktop))
- That's it! No Node.js, PostgreSQL, or other installations needed.

## Step-by-Step Guide

### 1. Install Docker Desktop

Download and install Docker Desktop for your operating system:
- **Mac**: https://docs.docker.com/desktop/install/mac-install/
- **Windows**: https://docs.docker.com/desktop/install/windows-install/
- **Linux**: https://docs.docker.com/desktop/install/linux-install/

### 2. Clone the Repository

```bash
git clone <repository-url>
cd bantay-hayop-davao
```

### 3. Start the Application

```bash
docker compose up -d --build
```

This will:
- Download all necessary Docker images
- Build the backend and frontend
- Create and initialize the PostgreSQL database
- Seed sample data (3 animals, medical records, etc.)
- Start all services

**Wait 30-60 seconds** for everything to initialize.

### 4. Access the Application

Open your browser and go to:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

### 5. Login

Use these default credentials:

```
Username: admin
Password: admin123
```

⚠️ **Change this password after first login!**

## Common Commands

### View Logs

See what's happening:

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Stop the Application

```bash
docker compose down
```

### Restart Everything

```bash
docker compose restart
```

### Fresh Start (Delete All Data)

```bash
# Stop and remove all containers and data
docker compose down -v

# Start fresh
docker compose up -d --build
```

### Check Status

```bash
docker compose ps
```

### Update After Code Changes

```bash
docker compose up -d --build
```

## Troubleshooting

### Port Already in Use?

If you see "port is already allocated":

```bash
# Check what's using the port
lsof -i :3000  # Frontend
lsof -i :5000  # Backend
lsof -i :5432  # Database

# Kill the process or change ports in docker-compose.yml
```

### Database Issues?

```bash
# Check database logs
docker compose logs postgres

# Restart database
docker compose restart postgres

# Fresh database
docker compose down -v
docker compose up -d --build
```

### Frontend Not Loading?

```bash
# Check if backend is responding
curl http://localhost:5000/api/health

# Should return: {"status":"ok","message":"Bantay Hayop Davao API is running"}

# Restart frontend
docker compose restart frontend
```

### "Cannot connect to Docker daemon"?

Make sure Docker Desktop is running on your computer.

## What Gets Installed?

✅ PostgreSQL 15 database
✅ Node.js 18 backend
✅ React 18 frontend
✅ All npm dependencies
✅ Database tables and schemas
✅ Admin user (admin/admin123)
✅ Sample data:
  - 3 animals (Brownie the dog, Whiskers the cat, Max the dog)
  - Medical records
  - Foster care record
  - Donation records

## File Structure in Docker

```
bantay-hayop-davao/
├── docker-compose.yml          ← Main orchestration file
├── backend/
│   ├── Dockerfile              ← Backend container config
│   └── ... (backend code)
├── client/
│   ├── Dockerfile              ← Frontend container config
│   ├── Dockerfile.prod         ← Production frontend
│   └── ... (frontend code)
└── database/
    └── init.sql                ← Database initialization
```

## Development Mode

The default docker-compose.yml runs in development mode with:
- Hot reload for frontend (changes reflect immediately)
- Auto-restart for backend (nodemon)
- Debug logging enabled
- Volume mounts for live code editing

## Production Mode

For production deployment:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This uses:
- Optimized React production build
- Nginx for serving frontend
- Production Node.js settings
- Port 80 instead of 3000

Access at: http://localhost

## Next Steps

1. ✅ Change the admin password
2. ✅ Explore the sample animals
3. ✅ Try creating new animal profiles
4. ✅ Test the adoption application flow
5. ✅ Review the dashboard statistics

## Need Help?

- Check the main README.md for detailed documentation
- View logs: `docker compose logs -f`
- Report issues on GitHub
- Email: admin@bantayhayop.ph

## Clean Up

When you're done and want to remove everything:

```bash
# Stop and remove containers, networks, volumes
docker compose down -v

# Remove downloaded images (optional)
docker rmi bantay-hayop-davao-backend
docker rmi bantay-hayop-davao-frontend
docker rmi postgres:15-alpine
```

---

**That's it! Your complete animal profiling system is now running! 🐾**
