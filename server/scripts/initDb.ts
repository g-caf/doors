import { initDatabase, db } from '../config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database...');
    
    // Initialize database structure
    initDatabase();
    
    // Create default admin user if it doesn't exist
    const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
    
    if (!adminExists) {
      console.log('👤 Creating default admin user...');
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);
      
      const stmt = db.prepare(`
        INSERT INTO users (username, password, role)
        VALUES (?, ?, ?)
      `);
      
      stmt.run('admin', hashedPassword, 'admin');
      
      console.log('✅ Default admin user created');
      console.log('   Username: admin');
      console.log(`   Password: ${defaultPassword}`);
      console.log('   ⚠️  Please change this password after first login!');
    } else {
      console.log('👤 Admin user already exists');
    }
    
    // Create sample employees if none exist
    const employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees').get();
    
    if (employeeCount.count === 0) {
      console.log('👥 Creating sample employees...');
      
      const employees = [
        {
          name: 'John Smith',
          department: 'Engineering',
          position: 'Senior Developer',
          email: 'john.smith@company.com',
          phone: '+1-555-0101'
        },
        {
          name: 'Sarah Johnson',
          department: 'Marketing',
          position: 'Marketing Manager',
          email: 'sarah.johnson@company.com',
          phone: '+1-555-0102'
        },
        {
          name: 'Mike Chen',
          department: 'Sales',
          position: 'Sales Representative',
          email: 'mike.chen@company.com',
          phone: '+1-555-0103'
        },
        {
          name: 'Emily Davis',
          department: 'HR',
          position: 'HR Specialist',
          email: 'emily.davis@company.com',
          phone: '+1-555-0104'
        },
        {
          name: 'David Wilson',
          department: 'Engineering',
          position: 'DevOps Engineer',
          email: 'david.wilson@company.com',
          phone: '+1-555-0105'
        }
      ];
      
      const stmt = db.prepare(`
        INSERT INTO employees (name, department, position, email, phone)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const employee of employees) {
        stmt.run(employee.name, employee.department, employee.position, employee.email, employee.phone);
      }
      
      console.log(`✅ Created ${employees.length} sample employees`);
    } else {
      console.log(`👥 Found ${employeeCount.count} existing employees`);
    }
    
    // Create uploads directory if it doesn't exist
    const fs = await import('fs');
    const path = await import('path');
    
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 Created uploads directory');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
