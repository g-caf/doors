const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Simple in-memory storage for demo
let employees = [
  { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Engineering' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Design' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', department: 'Marketing' }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/employees', (req, res) => {
  res.json({ employees });
});

app.post('/api/employees', (req, res) => {
  const { name, email, department } = req.body;
  const newEmployee = {
    id: Date.now(),
    name,
    email,
    department
  };
  employees.push(newEmployee);
  res.json({ employee: newEmployee });
});

app.post('/api/notify', (req, res) => {
  const { employeeId, visitorName, message } = req.body;
  const employee = employees.find(e => e.id === employeeId);
  
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  
  console.log(`Notification: ${visitorName} is here to see ${employee.name}`);
  console.log(`Would send email to: ${employee.email}`);
  
  res.json({ 
    success: true, 
    message: `Notification sent to ${employee.name}` 
  });
});

// Admin login (simple demo)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ 
      success: true, 
      token: 'demo-token',
      user: { username: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
