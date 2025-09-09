import { Request, Response } from 'express';
import { db } from '../config/database.js';

export const getAllActivityLogs = (req: Request, res: Response) => {
  try {
    const { employeeId, date, status, page = 1, limit = 20 } = req.query;
    
    let query = `
      SELECT al.*, e.name as employee_name, e.department, e.position 
      FROM activity_logs al
      JOIN employees e ON al.employee_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      query += ' AND al.employee_id = ?';
      params.push(employeeId);
    }

    if (date) {
      query += ' AND DATE(al.check_in_time) = ?';
      params.push(date);
    }

    if (status === 'checked_in') {
      query += ' AND al.check_out_time IS NULL';
    } else if (status === 'checked_out') {
      query += ' AND al.check_out_time IS NOT NULL';
    }

    // Get total count for pagination
    const countQuery = query.replace(
      'SELECT al.*, e.name as employee_name, e.department, e.position',
      'SELECT COUNT(*) as total'
    );
    const totalResult = db.prepare(countQuery).get(...params);
    const total = totalResult.total;

    // Add pagination
    query += ' ORDER BY al.check_in_time DESC LIMIT ? OFFSET ?';
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    params.push(limitNum, (pageNum - 1) * limitNum);

    const logs = db.prepare(query).all(...params);

    // Format response
    const formattedLogs = logs.map((log: any) => ({
      id: log.id,
      employeeId: log.employee_id,
      employeeName: log.employee_name,
      department: log.department,
      position: log.position,
      guestName: log.guest_name,
      guestPhone: log.guest_phone,
      guestEmail: log.guest_email,
      purpose: log.purpose,
      checkInTime: log.check_in_time,
      checkOutTime: log.check_out_time,
      notes: log.notes,
      createdAt: log.created_at,
      status: log.check_out_time ? 'checked_out' : 'checked_in'
    }));

    res.json({
      logs: formattedLogs,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createActivityLog = (req: Request, res: Response) => {
  try {
    const { employeeId, guestName, guestPhone, guestEmail, purpose, notes } = req.body;

    // Verify employee exists and is active
    const employee = db.prepare('SELECT id, name FROM employees WHERE id = ? AND is_active = 1').get(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found or inactive' });
    }

    const stmt = db.prepare(`
      INSERT INTO activity_logs (employee_id, guest_name, guest_phone, guest_email, purpose, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(employeeId, guestName, guestPhone, guestEmail, purpose, notes);
    const logId = result.lastInsertRowid as number;

    // Get created log with employee info
    const log = db.prepare(`
      SELECT al.*, e.name as employee_name, e.department, e.position 
      FROM activity_logs al
      JOIN employees e ON al.employee_id = e.id
      WHERE al.id = ?
    `).get(logId);

    const formattedLog = {
      id: log.id,
      employeeId: log.employee_id,
      employeeName: log.employee_name,
      department: log.department,
      position: log.position,
      guestName: log.guest_name,
      guestPhone: log.guest_phone,
      guestEmail: log.guest_email,
      purpose: log.purpose,
      checkInTime: log.check_in_time,
      checkOutTime: log.check_out_time,
      notes: log.notes,
      createdAt: log.created_at,
      status: 'checked_in'
    };

    res.status(201).json({
      message: 'Check-in recorded successfully',
      log: formattedLog
    });
  } catch (error) {
    console.error('Create activity log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkOut = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if log exists and is not already checked out
    const existingLog = db.prepare('SELECT * FROM activity_logs WHERE id = ? AND check_out_time IS NULL').get(id);
    if (!existingLog) {
      return res.status(404).json({ error: 'Active check-in record not found' });
    }

    // Update with check-out time
    const stmt = db.prepare(`
      UPDATE activity_logs 
      SET check_out_time = CURRENT_TIMESTAMP, notes = COALESCE(?, notes)
      WHERE id = ?
    `);

    stmt.run(notes, id);

    // Get updated log with employee info
    const log = db.prepare(`
      SELECT al.*, e.name as employee_name, e.department, e.position 
      FROM activity_logs al
      JOIN employees e ON al.employee_id = e.id
      WHERE al.id = ?
    `).get(id);

    const formattedLog = {
      id: log.id,
      employeeId: log.employee_id,
      employeeName: log.employee_name,
      department: log.department,
      position: log.position,
      guestName: log.guest_name,
      guestPhone: log.guest_phone,
      guestEmail: log.guest_email,
      purpose: log.purpose,
      checkInTime: log.check_in_time,
      checkOutTime: log.check_out_time,
      notes: log.notes,
      createdAt: log.created_at,
      status: 'checked_out'
    };

    res.json({
      message: 'Check-out recorded successfully',
      log: formattedLog
    });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActivityStats = (req: Request, res: Response) => {
  try {
    const { period = '7' } = req.query; // days
    
    // Total visitors today
    const todayVisitors = db.prepare(`
      SELECT COUNT(*) as count 
      FROM activity_logs 
      WHERE DATE(check_in_time) = DATE('now')
    `).get();

    // Active visitors (checked in but not out)
    const activeVisitors = db.prepare(`
      SELECT COUNT(*) as count 
      FROM activity_logs 
      WHERE check_out_time IS NULL
    `).get();

    // Visitors in the last N days
    const periodVisitors = db.prepare(`
      SELECT COUNT(*) as count 
      FROM activity_logs 
      WHERE check_in_time >= datetime('now', '-${period} days')
    `).get();

    // Daily stats for the period
    const dailyStats = db.prepare(`
      SELECT 
        DATE(check_in_time) as date,
        COUNT(*) as visitors,
        COUNT(CASE WHEN check_out_time IS NOT NULL THEN 1 END) as completed_visits
      FROM activity_logs 
      WHERE check_in_time >= datetime('now', '-${period} days')
      GROUP BY DATE(check_in_time)
      ORDER BY date DESC
    `).all();

    // Top departments by visitor count
    const departmentStats = db.prepare(`
      SELECT 
        e.department,
        COUNT(al.id) as visitor_count
      FROM activity_logs al
      JOIN employees e ON al.employee_id = e.id
      WHERE al.check_in_time >= datetime('now', '-${period} days')
      GROUP BY e.department
      ORDER BY visitor_count DESC
      LIMIT 10
    `).all();

    // Average visit duration (for completed visits)
    const avgDuration = db.prepare(`
      SELECT 
        AVG(
          (strftime('%s', check_out_time) - strftime('%s', check_in_time)) / 60.0
        ) as avg_minutes
      FROM activity_logs 
      WHERE check_out_time IS NOT NULL 
        AND check_in_time >= datetime('now', '-${period} days')
    `).get();

    res.json({
      summary: {
        todayVisitors: todayVisitors.count,
        activeVisitors: activeVisitors.count,
        periodVisitors: periodVisitors.count,
        averageVisitMinutes: Math.round(avgDuration.avg_minutes || 0)
      },
      dailyStats,
      departmentStats,
      period: parseInt(period as string)
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEmployeeVisitors = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    // Verify employee exists
    const employee = db.prepare('SELECT name FROM employees WHERE id = ?').get(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    let query = 'SELECT * FROM activity_logs WHERE employee_id = ?';
    const params: any[] = [id];

    if (status === 'active') {
      query += ' AND check_out_time IS NULL';
    } else if (status === 'completed') {
      query += ' AND check_out_time IS NOT NULL';
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const totalResult = db.prepare(countQuery).get(...params);
    const total = totalResult.total;

    // Add pagination
    query += ' ORDER BY check_in_time DESC LIMIT ? OFFSET ?';
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    params.push(limitNum, (pageNum - 1) * limitNum);

    const logs = db.prepare(query).all(...params);

    const formattedLogs = logs.map((log: any) => ({
      id: log.id,
      guestName: log.guest_name,
      guestPhone: log.guest_phone,
      guestEmail: log.guest_email,
      purpose: log.purpose,
      checkInTime: log.check_in_time,
      checkOutTime: log.check_out_time,
      notes: log.notes,
      status: log.check_out_time ? 'checked_out' : 'checked_in'
    }));

    res.json({
      employee: employee.name,
      logs: formattedLogs,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });
  } catch (error) {
    console.error('Get employee visitors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
