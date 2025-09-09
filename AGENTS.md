# Agent Instructions for Guest Check-in System

## Project Overview
This is a Node.js/Express backend with TypeScript for a guest check-in system with SQLite database, file uploads, authentication, and notification features.

## Common Commands
- **Build server**: `npm run server:build`
- **Start development**: `npm run dev`
- **Start production**: `npm start`
- **Database init**: `npm run db:init`
- **Create admin**: `npm run create-admin`
- **Test API**: `npm run test:api`
- **Lint**: `npm run lint`

## Project Structure
- `server/` - Backend TypeScript code
  - `config/` - Database configuration
  - `controllers/` - Request handlers
  - `middleware/` - Authentication, validation, security
  - `routes/` - API endpoints
  - `services/` - Email, SMS services
  - `scripts/` - Database initialization scripts
- `src/` - Frontend React code
- `public/` - Static files and uploads
- `data/` - SQLite database files

## Key Features
1. **Employee Management** - CRUD operations with photo upload
2. **Activity Logging** - Guest check-in/out tracking
3. **Notifications** - Email/SMS alerts to employees
4. **Authentication** - JWT-based admin auth
5. **Rate Limiting** - API protection
6. **File Uploads** - Employee photo management

## Database Schema
- `users` - Admin authentication
- `employees` - Employee directory
- `activity_logs` - Guest check-in records

## Environment Variables
- `JWT_SECRET` - Token signing key
- `SMTP_*` - Email configuration
- `TWILIO_*` - SMS configuration (optional)
- `NODE_ENV` - Environment mode

## API Endpoints
- `GET /health` - Health check
- `POST /api/auth/login` - Admin login
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee (admin)
- `POST /api/notify` - Send notification
- `GET /api/activity` - Activity logs (admin)

## Deployment
- Configured for Render.com deployment
- Uses `render.yaml` for configuration
- Automatic database initialization
- Environment-based configuration

## Known Issues
- SQLite native compilation may fail on some systems
- Workspace path with special characters can cause build issues
- Use npm scripts for consistent builds

## Development Notes
- TypeScript compilation target: ES2022
- Uses ES modules (import/export)
- Rate limiting on all endpoints
- File upload size limit: 5MB
- Supports CORS for frontend integration
