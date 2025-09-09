#!/usr/bin/env ts-node

import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createAdminUser() {
  console.log('🔧 Creating Admin User\n');

  try {
    // Check if admin already exists
    const existingAdmin = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      const overwrite = await question('Do you want to create another admin? (y/N): ');
      
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Admin creation cancelled.');
        rl.close();
        return;
      }
    }

    // Get admin details
    const username = await question('Enter admin username: ');
    
    if (!username.trim()) {
      console.log('❌ Username cannot be empty.');
      rl.close();
      return;
    }

    // Check if username exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      console.log('❌ Username already exists.');
      rl.close();
      return;
    }

    const password = await question('Enter admin password: ');
    
    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long.');
      rl.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const stmt = db.prepare(`
      INSERT INTO users (username, password, role)
      VALUES (?, ?, 'admin')
    `);

    const result = stmt.run(username, hashedPassword);
    
    console.log(`\n✅ Admin user created successfully!`);
    console.log(`👤 Username: ${username}`);
    console.log(`🆔 User ID: ${result.lastInsertRowid}`);
    console.log(`🔑 Role: admin\n`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Auto-create admin from environment variable if available
async function autoCreateAdmin() {
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;
  
  if (defaultPassword) {
    try {
      // Check if admin already exists
      const existingAdmin = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        
        const stmt = db.prepare(`
          INSERT INTO users (username, password, role)
          VALUES (?, ?, 'admin')
        `);

        const result = stmt.run('admin', hashedPassword);
        
        console.log('✅ Default admin user created automatically');
        console.log(`👤 Username: admin`);
        console.log(`🆔 User ID: ${result.lastInsertRowid}`);
        console.log('🔐 Password: From DEFAULT_ADMIN_PASSWORD environment variable\n');
      }
    } catch (error) {
      console.error('❌ Error creating default admin:', error);
    }
  }
}

// Check if running in auto mode (from environment) or interactive mode
if (process.env.NODE_ENV === 'production' || process.env.AUTO_CREATE_ADMIN) {
  autoCreateAdmin();
} else {
  createAdminUser();
}
