import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { sendVisitorNotification, sendTestEmail } from '../services/emailService.js';
import { sendSMSNotification, sendTestSMS } from '../services/smsService.js';
import { NotificationRequest } from '../types/index.js';

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const notification: NotificationRequest = req.body;
    
    // Get employee details
    const employee = db.prepare('SELECT name, email, phone FROM employees WHERE id = ? AND is_active = 1').get(notification.employeeId);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found or inactive' });
    }

    const results = {
      email: { success: false, message: '' },
      sms: { success: false, message: '' }
    };

    // Send email notification
    if (notification.type === 'email' || notification.type === 'both') {
      if (!employee.email) {
        results.email = { success: false, message: 'Employee email not available' };
      } else {
        try {
          const emailSuccess = await sendVisitorNotification(employee.email, notification);
          results.email = {
            success: emailSuccess,
            message: emailSuccess ? 'Email sent successfully' : 'Failed to send email'
          };
        } catch (error) {
          results.email = { success: false, message: 'Email service error' };
        }
      }
    }

    // Send SMS notification
    if (notification.type === 'sms' || notification.type === 'both') {
      if (!employee.phone) {
        results.sms = { success: false, message: 'Employee phone number not available' };
      } else {
        try {
          const smsSuccess = await sendSMSNotification(employee.phone, notification);
          results.sms = {
            success: smsSuccess,
            message: smsSuccess ? 'SMS sent successfully' : 'Failed to send SMS'
          };
        } catch (error) {
          results.sms = { success: false, message: 'SMS service error' };
        }
      }
    }

    // Determine overall success
    const overallSuccess = (notification.type === 'email' && results.email.success) ||
                          (notification.type === 'sms' && results.sms.success) ||
                          (notification.type === 'both' && (results.email.success || results.sms.success));

    const statusCode = overallSuccess ? 200 : 500;

    res.status(statusCode).json({
      message: overallSuccess ? 'Notification sent successfully' : 'Failed to send notification',
      employee: {
        name: employee.name,
        email: employee.email,
        phone: employee.phone
      },
      results
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const testEmailConfiguration = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const success = await sendTestEmail(email);

    res.status(success ? 200 : 500).json({
      success,
      message: success ? 'Test email sent successfully' : 'Failed to send test email'
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const testSMSConfiguration = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const success = await sendTestSMS(phone);

    res.status(success ? 200 : 500).json({
      success,
      message: success ? 'Test SMS sent successfully' : 'Failed to send test SMS'
    });

  } catch (error) {
    console.error('Test SMS error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotificationSettings = (req: Request, res: Response) => {
  res.json({
    email: {
      enabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      host: process.env.SMTP_HOST || 'Not configured',
      port: process.env.SMTP_PORT || 'Not configured',
      secure: process.env.SMTP_SECURE === 'true',
      from: process.env.FROM_EMAIL || process.env.SMTP_USER || 'Not configured'
    },
    sms: {
      enabled: false, // Set to true when SMS service is configured
      provider: 'Mock SMS Service (replace with actual service)',
      note: 'SMS service is currently mocked. Configure Twilio or another SMS provider for production use.'
    }
  });
};

export const bulkNotify = async (req: Request, res: Response) => {
  try {
    const { employeeIds, type, guestName, guestPhone, guestEmail, purpose, message } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ error: 'Employee IDs array is required' });
    }

    // Get all employees
    const placeholders = employeeIds.map(() => '?').join(',');
    const employees = db.prepare(`
      SELECT id, name, email, phone 
      FROM employees 
      WHERE id IN (${placeholders}) AND is_active = 1
    `).all(...employeeIds);

    if (employees.length === 0) {
      return res.status(404).json({ error: 'No active employees found' });
    }

    const results = [];

    for (const employee of employees) {
      const notification: NotificationRequest = {
        type,
        employeeId: employee.id,
        guestName,
        guestPhone,
        guestEmail,
        purpose,
        message
      };

      const employeeResults = {
        employeeId: employee.id,
        employeeName: employee.name,
        email: { success: false, message: '' },
        sms: { success: false, message: '' }
      };

      // Send email
      if (type === 'email' || type === 'both') {
        if (!employee.email) {
          employeeResults.email = { success: false, message: 'No email address' };
        } else {
          try {
            const emailSuccess = await sendVisitorNotification(employee.email, notification);
            employeeResults.email = {
              success: emailSuccess,
              message: emailSuccess ? 'Sent' : 'Failed'
            };
          } catch (error) {
            employeeResults.email = { success: false, message: 'Service error' };
          }
        }
      }

      // Send SMS
      if (type === 'sms' || type === 'both') {
        if (!employee.phone) {
          employeeResults.sms = { success: false, message: 'No phone number' };
        } else {
          try {
            const smsSuccess = await sendSMSNotification(employee.phone, notification);
            employeeResults.sms = {
              success: smsSuccess,
              message: smsSuccess ? 'Sent' : 'Failed'
            };
          } catch (error) {
            employeeResults.sms = { success: false, message: 'Service error' };
          }
        }
      }

      results.push(employeeResults);
    }

    // Calculate summary
    const totalAttempts = results.length;
    const successfulEmails = results.filter(r => r.email.success).length;
    const successfulSMS = results.filter(r => r.sms.success).length;

    res.json({
      message: 'Bulk notification completed',
      summary: {
        totalEmployees: totalAttempts,
        successfulEmails,
        successfulSMS
      },
      results
    });

  } catch (error) {
    console.error('Bulk notify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
