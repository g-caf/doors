const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Data storage
let employees = [
  {
    id: "1",
    name: "Adrienne Caffarel",
    email: "adrienne@sourcegraph.com",
    department: "Engineering",
    position: "Software Engineer",
    photo_url: "/public/Adrienne%20Caffarel.png",
    createdAt: new Date().toISOString()
  },
  {
    id: "2", 
    name: "Beyang Liu",
    email: "beyang@sourcegraph.com",
    department: "Engineering",
    position: "CTO",
    photo_url: "/public/Beyang%20Liu.png",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Dan Adler", 
    email: "dan@sourcegraph.com",
    department: "Engineering",
    position: "VP of Engineering",
    photo_url: "/public/Dan%20Adler.png",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    name: "Madison Clark",
    email: "madison@sourcegraph.com", 
    department: "Engineering",
    position: "Software Engineer",
    photo_url: "/public/Madison%20Clark.png",
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    name: "Quinn Slack",
    email: "quinn@sourcegraph.com",
    department: "Executive",
    position: "CEO",
    photo_url: "/public/Quinn%20Slack.png", 
    createdAt: new Date().toISOString()
  }
];
let activityLogs = [];

// Load data from JSON files if they exist
try {
  if (fs.existsSync('./data/employees.json')) {
    employees = JSON.parse(fs.readFileSync('./data/employees.json', 'utf8'));
  }
  if (fs.existsSync('./data/activity.json')) {
    activityLogs = JSON.parse(fs.readFileSync('./data/activity.json', 'utf8'));
  }
} catch (error) {
  console.log('No existing data found, starting fresh');
}

// Ensure data directory exists
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true });
}

// Save data to JSON files
function saveData() {
  fs.writeFileSync('./data/employees.json', JSON.stringify(employees, null, 2));
  fs.writeFileSync('./data/activity.json', JSON.stringify(activityLogs, null, 2));
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Static files
app.use('/public', express.static('public'));

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.isAdmin) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Routes

// Serve main kiosk page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Serve admin login page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Serve admin dashboard
app.get('/admin/dashboard', (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect('/admin');
  }
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// API Routes

// Admin login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple auth - in production, use proper password hashing
  if (username === 'admin' && password === 'admin123') {
    req.session.isAdmin = true;
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Admin logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out' });
});

// Get all employees
app.get('/api/employees', (req, res) => {
  res.json(employees);
});

// Create employee (admin only)
app.post('/api/employees', requireAuth, upload.single('photo'), (req, res) => {
  const { name, department, position } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const employee = {
    id: Date.now().toString(),
    name,
    department: department || '',
    position: position || '',
    photo: req.file ? `/public/uploads/${req.file.filename}` : null,
    createdAt: new Date().toISOString()
  };

  employees.push(employee);
  saveData();
  
  res.status(201).json(employee);
});

// Update employee (admin only)
app.put('/api/employees/:id', requireAuth, upload.single('photo'), (req, res) => {
  const { id } = req.params;
  const { name, department, position } = req.body;
  
  const employeeIndex = employees.findIndex(emp => emp.id === id);
  if (employeeIndex === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const employee = employees[employeeIndex];
  employee.name = name || employee.name;
  employee.department = department || employee.department;
  employee.position = position || employee.position;
  
  if (req.file) {
    // Delete old photo if it exists
    if (employee.photo) {
      const oldPhotoPath = path.join(__dirname, employee.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }
    employee.photo = `/public/uploads/${req.file.filename}`;
  }

  employee.updatedAt = new Date().toISOString();
  saveData();
  
  res.json(employee);
});

// Delete employee (admin only)
app.delete('/api/employees/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  
  const employeeIndex = employees.findIndex(emp => emp.id === id);
  if (employeeIndex === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const employee = employees[employeeIndex];
  
  // Delete photo if it exists
  if (employee.photo) {
    const photoPath = path.join(__dirname, employee.photo);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
  }

  employees.splice(employeeIndex, 1);
  saveData();
  
  res.json({ success: true, message: 'Employee deleted' });
});

// Notify employee
app.post('/api/notify', (req, res) => {
  const { employeeId, guestName, guestMessage } = req.body;
  
  const employee = employees.find(emp => emp.id === employeeId);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  // Log the activity
  const activity = {
    id: Date.now().toString(),
    employeeId,
    employeeName: employee.name,
    guestName: guestName || 'Guest',
    message: guestMessage || 'You have a visitor',
    timestamp: new Date().toISOString()
  };

  activityLogs.push(activity);
  saveData();

  // In a real app, send email/SMS here
  console.log(`NOTIFICATION: ${activity.guestName} is here to see ${employee.name}`);
  console.log(`Message: ${activity.message}`);

  res.json({ 
    success: true, 
    message: `Notification sent to ${employee.name}`,
    activity 
  });
});

// Get activity logs (admin only)
app.get('/api/activity', requireAuth, (req, res) => {
  res.json(activityLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Guest check-in system running on port ${PORT}`);
  console.log(`Kiosk interface: http://localhost:${PORT}`);
  console.log(`Admin login: http://localhost:${PORT}/admin`);
});

module.exports = app;
