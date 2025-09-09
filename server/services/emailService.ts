import nodemailer from 'nodemailer';
import { NotificationRequest } from '../types/index.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendVisitorNotification = async (
  employeeEmail: string,
  notification: NotificationRequest
): Promise<boolean> => {
  try {
    const subject = `New Visitor: ${notification.guestName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Visitor Notification
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Visitor Information</h3>
          <p><strong>Name:</strong> ${notification.guestName}</p>
          ${notification.guestPhone ? `<p><strong>Phone:</strong> ${notification.guestPhone}</p>` : ''}
          ${notification.guestEmail ? `<p><strong>Email:</strong> ${notification.guestEmail}</p>` : ''}
          <p><strong>Purpose:</strong> ${notification.purpose}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        ${notification.message ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">Additional Message</h4>
            <p style="color: #856404; margin-bottom: 0;">${notification.message}</p>
          </div>
        ` : ''}
        
        <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
          This is an automated notification from the Guest Check-in System.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: employeeEmail,
      subject,
      html
    });

    console.log(`Email notification sent to ${employeeEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

export const sendTestEmail = async (to: string): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject: 'Email Configuration Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>If you received this email, your email configuration is working correctly!</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
};

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};
