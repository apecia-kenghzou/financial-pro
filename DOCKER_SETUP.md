# Docker Setup Guide

## Quick Start

### Prerequisites
- Docker installed (https://docs.docker.com/get-docker/)
- Docker Compose installed (usually comes with Docker Desktop)

### Option 1: Start Without Google OAuth (UI Only)

Perfect for viewing the interface and taking screenshots!

```bash
# Navigate to project directory
cd /home/user/financial-pro

# Start all services
docker-compose up
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health
- MongoDB: localhost:27017

**What works:**
- ✅ Home page
- ✅ All UI components
- ✅ Canvas drag-and-drop
- ✅ Forms and navigation
- ⚠️ Login will fail (no OAuth configured)
- ⚠️ Can't save invitations (requires auth)

---

### Option 2: Full Setup With Google OAuth

For complete functionality including authentication and Google Sheets integration.

#### Step 1: Get Google OAuth Credentials

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/

2. **Create/Select Project:**
   - Create new project or select existing
   - Name: "Invitation Card Creator"

3. **Enable APIs:**
   - Go to "APIs & Services" → "Library"
   - Search and enable:
     - ✅ Google Sheets API
     - ✅ Google Drive API

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - If prompted, configure OAuth consent screen first:
     - User type: External
     - App name: Invitation Card Creator
     - Add your email as test user
   - Application type: **Web application**
   - Name: "Invitation Card Creator"

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:5000
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:5000/api/auth/google/callback
   ```

5. **Copy Credentials:**
   - You'll get a Client ID and Client Secret
   - Keep these safe!

#### Step 2: Configure Environment Variables

```bash
# Copy the template
cp .env.docker .env

# Edit .env and add your credentials
nano .env  # or use any text editor
```

Update these values in `.env`:
```
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-secret-here
```

#### Step 3: Start Docker Services

```bash
# Build and start all services
docker-compose up --build

# Or run in background (detached mode)
docker-compose up -d --build
```

#### Step 4: Access Application

Open your browser:
- **Frontend:** http://localhost:3000
- **Backend Health:** http://localhost:5000/api/health

---

## Docker Commands Cheat Sheet

### Basic Operations

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (deletes database)
docker-compose down -v

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb
```

### Troubleshooting

```bash
# Check service status
docker-compose ps

# Restart a specific service
docker-compose restart backend

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh

# View MongoDB data
docker-compose exec mongodb mongosh invitation-cards

# Clean everything and start fresh
docker-compose down -v
docker system prune -a
docker-compose up --build
```

---

## Service Details

### MongoDB (Port 27017)
- Database: `invitation-cards`
- Persistent storage via Docker volume
- Auto-initializes on first run
- Health check included

### Backend (Port 5000)
- Node.js Express API
- Auto-restarts on code changes (volume mounted)
- Logs saved to `backend/logs/`
- Health check at `/api/health`

### Frontend (Port 3000)
- React development server
- Hot reload enabled
- Auto-restarts on code changes
- Proxies API requests to backend

---

## Environment Variables

The application uses these environment variables (configured in docker-compose.yml):

```yaml
Backend:
  NODE_ENV: development
  PORT: 5000
  MONGODB_URI: mongodb://mongodb:27017/invitation-cards
  FRONTEND_URL: http://localhost:3000
  BACKEND_URL: http://localhost:5000
  SESSION_SECRET: dev-session-secret-change-in-production-12345
  GOOGLE_CLIENT_ID: (from .env file)
  GOOGLE_CLIENT_SECRET: (from .env file)

Frontend:
  REACT_APP_API_URL: http://localhost:5000/api
```

---

## Taking Screenshots

Once running, you can capture screenshots of:

1. **Home Page** - http://localhost:3000/
2. **Login Page** - http://localhost:3000/login
3. **Card Editor** - http://localhost:3000/create (requires login)
4. **Public Invitation** - http://localhost:3000/invitation/:cardId

See `SCREENSHOT_GUIDE.md` for detailed screenshot instructions.

---

## Common Issues

### Port Already in Use

If ports 3000, 5000, or 27017 are already in use:

```bash
# Stop conflicting services
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
lsof -ti:27017 | xargs kill -9

# Or change ports in docker-compose.yml
ports:
  - "3001:3000"  # Map to different external port
```

### Container Keeps Restarting

Check logs:
```bash
docker-compose logs backend
docker-compose logs frontend
```

Common causes:
- Missing dependencies: `docker-compose build --no-cache`
- MongoDB not ready: Wait for MongoDB healthcheck to pass
- Port conflicts: See above

### MongoDB Connection Refused

```bash
# Check MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Google OAuth Errors

- Verify CLIENT_ID and CLIENT_SECRET in `.env`
- Check redirect URI in Google Console matches exactly:
  `http://localhost:5000/api/auth/google/callback`
- Ensure your email is added as test user
- Clear browser cookies and try again

---

## Production Deployment

For production, update:

1. **Security:**
   ```yaml
   SESSION_SECRET: <use strong random string>
   NODE_ENV: production
   ```

2. **URLs:**
   ```yaml
   FRONTEND_URL: https://yourdomain.com
   BACKEND_URL: https://api.yourdomain.com
   ```

3. **OAuth Redirect:**
   Add production URL to Google Console:
   ```
   https://api.yourdomain.com/api/auth/google/callback
   ```

4. **Use production builds:**
   - Frontend: `npm run build` and serve with nginx
   - Backend: Use process manager like PM2
   - MongoDB: Use managed service (MongoDB Atlas)

---

## Data Persistence

Data is stored in Docker volumes:

```bash
# List volumes
docker volume ls

# Inspect MongoDB volume
docker volume inspect financial-pro_mongodb_data

# Backup database
docker-compose exec mongodb mongodump --out=/data/backup

# Restore database
docker-compose exec mongodb mongorestore /data/backup
```

---

## Development Workflow

1. **Start services:**
   ```bash
   docker-compose up
   ```

2. **Make code changes:**
   - Edit files in `frontend/` or `backend/`
   - Changes auto-reload (hot reload enabled)

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Test changes:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api/health

5. **Stop services:**
   ```bash
   docker-compose down
   ```

---

## Next Steps

1. ✅ Start Docker services: `docker-compose up`
2. ✅ Access frontend: http://localhost:3000
3. ✅ Take UI screenshots
4. 📝 Configure Google OAuth (optional, for full functionality)
5. 🧪 Test complete workflow
6. 📸 Take functional screenshots

---

## Support

For issues:
- Check logs: `docker-compose logs`
- Review first_review.md for architecture details
- See SETUP_INSTRUCTIONS.md for manual setup
- Check SCREENSHOT_GUIDE.md for screenshot tips
