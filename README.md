# Guest Check-in System

A simple guest check-in system built with Express.js and vanilla JavaScript. This application provides a kiosk interface for guests to notify employees of their arrival and an admin dashboard for managing employees.

## Features

- **Kiosk Interface**: Touch-friendly interface for guests to select employees and leave messages
- **Employee Management**: Admin dashboard to add, edit, and delete employees  
- **Photo Upload**: Support for employee profile photos
- **Activity Logging**: Track all guest check-ins with timestamps
- **Simple Authentication**: Session-based admin authentication
- **Rate Limiting**: API protection against abuse
- **Static HTML**: No build process required

## Tech Stack

- **Frontend**: Static HTML, Vanilla JavaScript, Tailwind CSS (CDN)
- **Backend**: Express.js, Node.js
- **Data Storage**: JSON files (in-memory with persistence)
- **Authentication**: Express sessions
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Environment Setup** (optional):
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the Application**:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Kiosk Interface: http://localhost:3000
   - Admin Login: http://localhost:3000/admin
   - Admin Credentials: username `admin`, password `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create employee (admin only)
- `PUT /api/employees/:id` - Update employee (admin only)
- `DELETE /api/employees/:id` - Delete employee (admin only)

### Notifications
- `POST /api/notify` - Send notification to employee (currently console logs)

### Activity
- `GET /api/activity` - Get activity logs (admin only)

### Health
- `GET /health` - Health check endpoint

## Configuration

### Environment Variables

```env
# Session configuration (optional)
SESSION_SECRET=your-secret-key-here-change-in-production

# Port (optional - defaults to 3000)
PORT=3000

# Node environment
NODE_ENV=production
```

### Admin Account

Default admin credentials:
- Username: `admin`
- Password: `admin123`

Change these in `app.js` for production use.

## Data Storage

The application uses simple JSON file storage:
- `data/employees.json` - Employee data
- `data/activity.json` - Activity logs
- `public/uploads/` - Employee photos

Data persists automatically and loads on server restart.

## Deployment

### Render.com

This application is configured for easy deployment on Render:

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables if needed
5. Deploy

### Other Platforms

The application works on any Node.js hosting platform:

1. Upload your code
2. Run `npm install`
3. Start with `npm start`
4. Ensure port is configured correctly

## Development

### Project Structure

```
├── views/                 # Static HTML pages
│   ├── index.html        # Kiosk interface
│   ├── admin.html        # Admin login
│   └── dashboard.html    # Admin dashboard
├── public/               # Static assets and uploads
├── data/                 # JSON data storage
├── app.js                # Main Express server
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run API tests

### Adding Features

Since this uses vanilla JavaScript and static HTML:

1. **Frontend**: Edit HTML files in `/views/` directory
2. **Backend**: Modify `app.js` for API endpoints
3. **Styling**: Uses Tailwind CSS via CDN - add classes directly in HTML
4. **JavaScript**: Add vanilla JS directly in HTML `<script>` tags

## Security Features

- Session-based authentication
- Rate limiting on API endpoints
- File upload validation (images only, 5MB limit)
- CORS protection
- Security headers with Helmet
- Input validation

## Customization

### Styling

The application uses Tailwind CSS via CDN. Modify classes directly in HTML files.

### Notifications

Currently logs notifications to console. Extend the `/api/notify` endpoint in `app.js` to add email/SMS functionality.

### Authentication

Simple username/password check in `app.js`. For production, implement proper password hashing and user management.

## Production Considerations

1. **Change Admin Credentials**: Update the hardcoded admin credentials in `app.js`
2. **Session Secret**: Set `SESSION_SECRET` environment variable
3. **File Storage**: Consider cloud storage for uploaded images
4. **Database**: For larger deployments, consider migrating to a proper database
5. **Security**: Add HTTPS and additional security measures

## License

This project is licensed under the MIT License.
