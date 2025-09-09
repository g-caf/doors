# Deployment Guide - Guest Check-in System

This guide covers deploying the Guest Check-in System to Render.com and other platforms.

## 🚀 Quick Deploy to Render

### Prerequisites
- Render.com account
- GitHub repository with your code

### Automatic Deployment
1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Render will automatically detect and deploy using the `render.yaml` configuration

### Manual Setup

#### Backend Service
1. Create a new **Web Service** on Render
2. Configure:
   - **Name**: `guest-checkin-api`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter

#### Environment Variables
Set these in your Render dashboard:

```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-production
DEFAULT_ADMIN_PASSWORD=secure-admin-password
FRONTEND_URL=https://your-frontend-url.render.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Optional: SMS Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → App passwords
   - Create password for "Mail"
3. Use the generated password as `SMTP_PASS`

### Other Email Providers
- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`

## 📱 SMS Configuration (Optional)

### Twilio Setup
1. Create account at twilio.com
2. Get Account SID and Auth Token from dashboard
3. Purchase a phone number
4. Set environment variables:
   ```bash
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

## 🗄️ Database

The system uses SQLite, which is perfect for small to medium applications:
- **Development**: Local file `./data/app.db`
- **Production**: Persistent storage on Render

### Database Initialization
The database is automatically initialized on first run, including:
- Creating tables
- Setting up indexes
- Creating default admin user
- Adding sample employees (development only)

### Manual Database Initialization
```bash
npm run db:init
```

## 🔐 Security Setup

### 1. Change Default Credentials
After deployment, immediately:
1. Log in with default admin credentials
2. Change admin password
3. Create additional admin users if needed

### 2. Environment Variables
Ensure these are set securely:
- `JWT_SECRET`: Use a long, random string
- `DEFAULT_ADMIN_PASSWORD`: Strong password
- Email/SMS credentials: Keep secure

### 3. HTTPS
Render automatically provides HTTPS certificates.

## 📁 File Uploads

### Storage Configuration
- **Development**: Local `./public/uploads/` directory
- **Production**: Render's ephemeral file system

### Production Considerations
For production with persistent file storage, consider:
- AWS S3
- Cloudinary
- Other cloud storage solutions

## 🔧 Build Process

### Development
```bash
npm run dev          # Start both frontend and backend
npm run server:dev   # Backend only
```

### Production Build
```bash
npm run build        # Build both frontend and backend
npm run start        # Start production server
```

## 📊 Monitoring

### Health Checks
- Endpoint: `GET /health`
- Returns server status and environment info

### Logs
Check Render dashboard for:
- Build logs
- Runtime logs
- Error tracking

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection
- Check if `data` directory exists
- Verify write permissions
- Look for SQLite-related errors in logs

#### 2. Email Not Sending
- Verify SMTP credentials
- Check firewall/security settings
- Test with simple email first
- Use test endpoint: `POST /api/notify/test/email`

#### 3. File Uploads Failing
- Check upload directory permissions
- Verify file size limits
- Ensure correct MIME types

#### 4. CORS Issues
- Verify `FRONTEND_URL` environment variable
- Check allowed origins in server configuration

### Debug Commands
```bash
# Check database
npm run db:init

# Test email configuration
curl -X POST https://your-api.render.com/api/notify/test/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Health check
curl https://your-api.render.com/health
```

## 🔄 Updates and Maintenance

### Deployment Updates
1. Push changes to GitHub
2. Render automatically rebuilds and deploys
3. Zero-downtime deployment

### Database Migrations
For schema changes:
1. Update database initialization script
2. Create migration scripts if needed
3. Test thoroughly in development

## 🎯 Performance Optimization

### Production Optimizations
- Enable gzip compression
- Implement caching strategies
- Use CDN for static assets
- Monitor performance metrics

### Rate Limiting
Built-in rate limiting for:
- General API: 100 requests/15min
- Authentication: 5 attempts/15min
- File uploads: 10 uploads/hour
- Notifications: 10 requests/5min

## 🔐 Backup Strategy

### Database Backup
```bash
# Create backup
cp data/app.db backups/backup-$(date +%Y%m%d).db

# Restore backup
cp backups/backup-20231201.db data/app.db
```

### Automated Backups
Consider implementing:
- Daily database backups
- Configuration backups
- Upload file backups

## 📞 Support

For deployment issues:
1. Check Render build/runtime logs
2. Verify environment variables
3. Test endpoints individually
4. Review this deployment guide

## 🌟 Next Steps

After successful deployment:
1. Test all functionality
2. Set up monitoring
3. Configure backups
4. Train users
5. Plan scaling strategy
