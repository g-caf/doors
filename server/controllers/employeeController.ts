import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { deletePhoto } from '../middleware/upload.js';

export const getAllEmployees = (req: Request, res: Response) => {
  try {
    const { department, active, search, page = 1, limit = 20 } = req.query;
    
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params: any[] = [];

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    if (active !== undefined) {
      query += ' AND is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR department LIKE ? OR position LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Get total count for pagination
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const totalResult = db.prepare(countQuery).get(...params);
    const total = totalResult.total;

    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    params.push(limitNum, (pageNum - 1) * limitNum);

    const employees = db.prepare(query).all(...params);

    // Convert database fields to camelCase
    const formattedEmployees = employees.map((emp: any) => ({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      position: emp.position,
      email: emp.email,
      phone: emp.phone,
      photo: emp.photo,
      isActive: emp.is_active === 1,
      createdAt: emp.created_at,
      updatedAt: emp.updated_at
    }));

    res.json({
      employees: formattedEmployees,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEmployeeById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Format response
    const formattedEmployee = {
      id: employee.id,
      name: employee.name,
      department: employee.department,
      position: employee.position,
      email: employee.email,
      phone: employee.phone,
      photo: employee.photo,
      isActive: employee.is_active === 1,
      createdAt: employee.created_at,
      updatedAt: employee.updated_at
    };

    res.json(formattedEmployee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createEmployee = (req: Request, res: Response) => {
  try {
    const { name, department, position, email, phone, isActive = true } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    // Check if email already exists
    const existingEmployee = db.prepare('SELECT id FROM employees WHERE email = ?').get(email);
    if (existingEmployee) {
      // Delete uploaded photo if employee creation fails
      if (req.file) {
        deletePhoto(req.file.filename);
      }
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }

    const stmt = db.prepare(`
      INSERT INTO employees (name, department, position, email, phone, photo, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, department, position, email, phone, photo, isActive ? 1 : 0);
    const employeeId = result.lastInsertRowid as number;

    // Get created employee
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(employeeId);
    
    const formattedEmployee = {
      id: employee.id,
      name: employee.name,
      department: employee.department,
      position: employee.position,
      email: employee.email,
      phone: employee.phone,
      photo: employee.photo,
      isActive: employee.is_active === 1,
      createdAt: employee.created_at,
      updatedAt: employee.updated_at
    };

    res.status(201).json({
      message: 'Employee created successfully',
      employee: formattedEmployee
    });
  } catch (error) {
    // Delete uploaded photo if employee creation fails
    if (req.file) {
      deletePhoto(req.file.filename);
    }
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEmployee = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, department, position, email, phone, isActive } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Check if employee exists
    const existingEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    if (!existingEmployee) {
      if (req.file) {
        deletePhoto(req.file.filename);
      }
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if email is taken by another employee
    if (email && email !== existingEmployee.email) {
      const emailTaken = db.prepare('SELECT id FROM employees WHERE email = ? AND id != ?').get(email, id);
      if (emailTaken) {
        if (req.file) {
          deletePhoto(req.file.filename);
        }
        return res.status(400).json({ error: 'Email is already taken by another employee' });
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (department !== undefined) {
      updates.push('department = ?');
      values.push(department);
    }
    if (position !== undefined) {
      updates.push('position = ?');
      values.push(position);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (photo !== undefined) {
      updates.push('photo = ?');
      values.push(photo);
      // Delete old photo if it exists
      if (existingEmployee.photo) {
        const oldPhotoFilename = existingEmployee.photo.split('/').pop();
        if (oldPhotoFilename) {
          deletePhoto(oldPhotoFilename);
        }
      }
    }
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      if (req.file) {
        deletePhoto(req.file.filename);
      }
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);

    // Get updated employee
    const updatedEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    
    const formattedEmployee = {
      id: updatedEmployee.id,
      name: updatedEmployee.name,
      department: updatedEmployee.department,
      position: updatedEmployee.position,
      email: updatedEmployee.email,
      phone: updatedEmployee.phone,
      photo: updatedEmployee.photo,
      isActive: updatedEmployee.is_active === 1,
      createdAt: updatedEmployee.created_at,
      updatedAt: updatedEmployee.updated_at
    };

    res.json({
      message: 'Employee updated successfully',
      employee: formattedEmployee
    });
  } catch (error) {
    if (req.file) {
      deletePhoto(req.file.filename);
    }
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEmployee = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const employee = db.prepare('SELECT photo FROM employees WHERE id = ?').get(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete employee (will cascade delete activity logs due to foreign key)
    const result = db.prepare('DELETE FROM employees WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete photo file if it exists
    if (employee.photo) {
      const photoFilename = employee.photo.split('/').pop();
      if (photoFilename) {
        deletePhoto(photoFilename);
      }
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDepartments = (req: Request, res: Response) => {
  try {
    const departments = db.prepare(`
      SELECT department, COUNT(*) as count 
      FROM employees 
      WHERE is_active = 1 
      GROUP BY department 
      ORDER BY department
    `).all();

    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
