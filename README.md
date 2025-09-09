# Guest Check-in System 🚪

A comprehensive Node.js/Express backend system for managing guest check-ins, employee directories, and real-time notifications. Built with TypeScript, SQLite, and modern security practices.

## 🌟 Features

### Core Functionality
- **Employee Management** - Complete CRUD operations with photo uploads
- **Guest Check-in System** - Track visitor activity and purpose of visit
- **Real-time Notifications** - Email and SMS alerts to employees
- **Admin Authentication** - JWT-based secure admin access
- **File Upload Management** - Employee photo handling with validation
- **Activity Logging** - Comprehensive visitor tracking and reporting

### Security & Performance
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Comprehensive request validation
- **Security Headers** - Helmet.js integration
- **File Upload Security** - Type and size validation
- **CORS Protection** - Configurable cross-origin policies

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd guest-checkin-system

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run db:init

# Create admin user
npm run create-admin

# Start development server
npm run dev
```

### Production Deployment
```bash
# Build the project
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
├── server/                 # Backend TypeScript code
│   ├── config/            # Database configuration
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Auth, validation, security
│   ├── routes/           # API endpoints
│   ├── services/         # Email/SMS services
│   ├── scripts/          # Database utilities
│   └── types/            # TypeScript definitions
├── src/                   # Frontend React code (optional)
├── public/               # Static files and uploads
├── data/                 # SQLite database
└── dist/                 # Compiled JavaScript
```

## 🔌 API Endpoints

### Public Endpoints
- `GET /health` - System health check
- `GET /api/employees` - List active employees
- `POST /api/notify` - Send visitor notifications
- `POST /api/activity` - Log guest check-in

### Admin Endpoints (Protected)
- `POST /api/auth/login` - Admin authentication
- `GET /api/auth/profile` - Get admin profile
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/activity` - Get activity logs
- `GET /api/activity/stats` - Get activity statistics

### Example API Usage

#### Employee Management
```javascript
// Create employee (Admin only)
POST /api/employees
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>

{
  "name": "John Doe",
  "department": "Engineering",
  "position": "Senior Developer",
  "email": "john@company.com",
  "phone": "+1-555-0123",
  "photo": <file>
}
```

#### Send Notification
```javascript
// Notify employee of visitor
POST /api/notify
Content-Type: application/json

{
  "type": "both",
  "employeeId": 1,
  "guestName": "Jane Smith",
  "guestPhone": "+1-555-0456",
  "purpose": "Business meeting",
  "message": "Visitor waiting in lobby"
}
```

## ⚙️ Configuration

### Environment Variables
```bash
# Server Configuration
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secure-jwt-secret
DEFAULT_ADMIN_PASSWORD=admin123

# Database
DB_PATH=./data/app.db

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# SMS Configuration (Optional - Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Security
FRONTEND_URL=https://your-frontend-domain.com
MAX_FILE_SIZE=5242880
RATE_LIMIT_MAX=100
```

### Email Setup
1. **Gmail**: Enable 2-factor auth and create app password
2. **Outlook**: Use smtp-mail.outlook.com:587
3. **SendGrid**: Use smtp.sendgrid.net:587

## 🗄️ Database Schema

### Tables
- **users** - Admin authentication
  - id, username, password, role, created_at
- **employees** - Employee directory
  - id, name, department, position, email, phone, photo, is_active
- **activity_logs** - Guest check-in records
  - id, employee_id, guest_name, purpose, check_in_time, etc.

### Sample Data
The system automatically creates sample employees in development mode.

## 🛡️ Security Features

### Rate Limiting
- **General API**: 100 requests/15min
- **Authentication**: 5 attempts/15min  
- **File Uploads**: 10 uploads/hour
- **Notifications**: 10 requests/5min

### File Upload Protection
- **Size Limit**: 5MB per file
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Validation**: MIME type and extension checking
- **Storage**: Secure file naming and directory structure

### Authentication
- **JWT Tokens**: 24-hour expiration
- **Password Hashing**: bcryptjs with salt rounds
- **Role-based Access**: Admin vs public endpoint separation

## 📊 Monitoring & Logging

### Health Checks
```bash
curl http://localhost:3001/health
```

### Logs
- Console logging in development
- Combined format in production
- Error tracking and stack traces

### Testing
```bash
# API testing
npm run test:api

# Manual testing endpoints
curl -X GET http://localhost:3001/api/employees
curl -X POST http://localhost:3001/health
```

## 🚀 Deployment

### Render.com (Recommended)
1. Connect GitHub repository
2. Use included `render.yaml` configuration
3. Set environment variables in dashboard
4. Automatic deployment on git push

### Manual Deployment
```bash
# Build for production
npm run build

# Set production environment
export NODE_ENV=production

# Start server
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
COPY public/ ./public/
EXPOSE 3001
CMD ["npm", "start"]
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev              # Start dev server with hot reload
npm run server:dev       # Backend only development
npm run server:build     # Compile TypeScript
npm run build           # Full production build
npm run start           # Start production server
npm run db:init         # Initialize database
npm run create-admin    # Create admin user
npm run test:api        # Test API endpoints
npm run lint           # Run ESLint
```

### Development Workflow
1. Make changes to TypeScript files
2. Server auto-restarts with nodemon
3. Test endpoints with provided test script
4. Build and deploy when ready

## 🔧 Troubleshooting

### Common Issues

**Database connection errors**
```bash
# Recreate database
rm data/app.db
npm run db:init
```

**Email not sending**
```bash
# Test email configuration
curl -X POST http://localhost:3001/api/notify/test/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Build failures**
```bash
# Clean and rebuild
rm -rf dist/
npm run server:build
```

**File upload issues**
- Check `public/uploads/` directory exists
- Verify file size under 5MB
- Ensure valid image format (JPEG, PNG, GIF, WebP)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions, issues, or feature requests:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue on GitHub
4. Contact the development team

## 🔄 Changelog

### v1.0.0
- Initial release
- Employee management system
- Guest check-in functionality
- Email/SMS notifications
- Admin authentication
- File upload support
- Rate limiting and security features
- Render.com deployment configuration

---

**Built with ❤️ using Node.js, Express, TypeScript, and SQLite**
