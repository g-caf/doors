const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const { WebClient } = require('@slack/web-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Slack client
const slack = process.env.SLACK_BOT_TOKEN ? new WebClient(process.env.SLACK_BOT_TOKEN) : null;

// Data storage
let employees = [
  {
    id: "1",
    name: "Adrienne Caffarel",
    email: "adrienne.caffarel@sourcegraph.com",
    department: "Operations",
    position: "Office Manager",
    photo_url: "/public/Adrienne%20Caffarel.png",
    slackUserId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "2", 
    name: "Beyang Liu",
    email: "beyang@sourcegraph.com",
    department: "Engineering",
    position: "CTO",
    photo_url: "/public/Beyang%20Liu.png",
    slackUserId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Dan Adler", 
    email: "dan@sourcegraph.com",
    department: "Operations",
    position: "VP of Operations",
    photo_url: "/public/Dan%20Adler.png",
    slackUserId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    name: "Madison Clark",
    email: "madison.clark@sourcegraph.com", 
    department: "Communications",
    position: "Communications Director",
    photo_url: "/public/Madison%20Clark.png",
    slackUserId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    name: "Quinn Slack",
    email: "sqs@sourcegraph.com",
    department: "Executive",
    position: "CEO",
    photo_url: "/public/Quinn%20Slack.png",
    slackUserId: null, 
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

// Slack notification functions
async function sendSlackDirectMessage(userId, message) {
  if (!slack) {
    console.log('Slack not configured - would send DM:', message);
    return { success: false, error: 'Slack not configured' };
  }

  try {
    // First open a DM channel (required for bot tokens)
    const dmResult = await slack.conversations.open({ users: userId });
    const result = await slack.chat.postMessage({
      channel: dmResult.channel.id,
      text: message
    });

    console.log('Slack DM sent successfully:', result.ts);
    return { success: true, messageTs: result.ts };
  } catch (error) {
    console.error('Error sending Slack DM:', error);
    return { success: false, error: error.message };
  }
}

async function sendSlackChannelMessage(channelId, message) {
  if (!slack) {
    console.log('Slack not configured - would send channel message:', message);
    return { success: false, error: 'Slack not configured' };
  }

  try {
    const result = await slack.chat.postMessage({
      channel: channelId,
      text: message
    });

    console.log('Slack channel message sent successfully:', result.ts);
    return { success: true, messageTs: result.ts };
  } catch (error) {
    console.error('Error sending Slack channel message:', error);
    return { success: false, error: error.message };
  }
}

async function findSlackUserByEmail(email) {
  if (!slack) {
    return null;
  }

  try {
    const result = await slack.users.lookupByEmail({ email });
    return result.user.id;
  } catch (error) {
    console.error('Error finding Slack user by email:', error.message);
    return null;
  }
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

// Serve admin dashboard (no login required)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
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
  res.json({ employees });
});

// Create employee
app.post('/api/employees', upload.single('photo'), (req, res) => {
  const { name, email, department, position, slackUserId } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const employee = {
    id: Date.now().toString(),
    name,
    email: email || '',
    department: department || '',
    position: position || '',
    photo: req.file ? `/public/uploads/${req.file.filename}` : null,
    slackUserId: slackUserId || null,
    createdAt: new Date().toISOString()
  };

  employees.push(employee);
  saveData();
  
  res.status(201).json(employee);
});

// Update employee
app.put('/api/employees/:id', upload.single('photo'), (req, res) => {
  const { id } = req.params;
  const { name, email, department, position, slackUserId } = req.body;
  
  const employeeIndex = employees.findIndex(emp => emp.id === id);
  if (employeeIndex === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const employee = employees[employeeIndex];
  employee.name = name || employee.name;
  employee.email = email || employee.email;
  employee.department = department || employee.department;
  employee.position = position || employee.position;
  employee.slackUserId = slackUserId !== undefined ? slackUserId : employee.slackUserId;
  
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

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
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
app.post('/api/notify', async (req, res) => {
  const { employeeId, guestName, guestMessage, channelId } = req.body;
  
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

  // Create Slack message
  const slackMessage = `👋 Hi ${employee.name}! ${activity.guestName} is here to see you at the front desk.`;
  
  let slackResult = { success: false, error: 'No Slack configuration' };
  
  // Try to send Slack notification
  if (slack) {
    try {
      // If employee doesn't have slackUserId but has email, try to find Slack user
      if (!employee.slackUserId && employee.email) {
        const slackUserId = await findSlackUserByEmail(employee.email);
        if (slackUserId) {
          employee.slackUserId = slackUserId;
          saveData(); // Save the updated slackUserId for future use
        }
      }

      // Send to employee via DM if we have their Slack user ID
      if (employee.slackUserId) {
        slackResult = await sendSlackDirectMessage(employee.slackUserId, slackMessage);
      }
      // Otherwise, send to default channel
      else {
        const defaultChannel = process.env.SLACK_DEFAULT_CHANNEL || 'C07V5SGFTLD'; // fallback channel ID
        const channelMessage = `👋 ${activity.guestName} is here to see ${employee.name} at the front desk.`;
        slackResult = await sendSlackChannelMessage(channelId || defaultChannel, channelMessage);
      }
    } catch (error) {
      console.error('Error sending Slack notification:', error.message);
      slackResult = { success: false, error: error.message };
    }
  }

  // Console logging for debugging
  console.log(`NOTIFICATION: ${activity.guestName} is here to see ${employee.name}`);
  console.log(`Message: ${activity.message}`);
  console.log(`Slack notification: ${slackResult.success ? 'sent' : 'failed'}`);

  res.json({ 
    success: true, 
    message: `Notification sent to ${employee.name}`,
    activity,
    slack: slackResult
  });
});

// Get activity logs
app.get('/api/activity', (req, res) => {
  res.json(activityLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// Lookup Slack user by email
app.post('/api/slack/lookup-user', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!slack) {
    return res.status(503).json({ error: 'Slack not configured' });
  }

  try {
    const slackUserId = await findSlackUserByEmail(email);
    if (slackUserId) {
      res.json({ success: true, slackUserId });
    } else {
      res.status(404).json({ error: 'Slack user not found' });
    }
  } catch (error) {
    console.error('Error looking up Slack user:', error.message);
    res.status(500).json({ error: 'Failed to lookup Slack user' });
  }
});

// Test Slack connection
app.get('/api/slack/test', async (req, res) => {
  if (!slack) {
    return res.status(503).json({ error: 'Slack not configured' });
  }

  try {
    const result = await slack.auth.test();
    res.json({
      success: true,
      team: result.team,
      user: result.user,
      bot_id: result.bot_id
    });
  } catch (error) {
    console.error('Slack auth test failed:', error.message);
    res.status(500).json({ error: 'Slack connection failed', details: error.message });
  }
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
