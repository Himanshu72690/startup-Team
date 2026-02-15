const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send verification email with OTP
exports.sendVerificationEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'StartupTeam <noreply@startupteam.com>',
      to: email,
      subject: 'Verify Your Email - StartupTeam',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6366f1; border: 2px dashed #6366f1; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Welcome to StartupTeam!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for signing up! Please verify your email address using the code below:</p>
              <div class="otp-box">${otp}</div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't create an account, please ignore this email.</p>
              <p>Best regards,<br>The StartupTeam Team</p>
            </div>
            <div class="footer">
              <p>© 2026 StartupTeam. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Send verification email error:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/pages/reset-password.html?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'StartupTeam <noreply@startupteam.com>',
      to: email,
      subject: 'Password Reset Request - StartupTeam',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>This link will expire in 30 minutes.</p>
              <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              <p>Best regards,<br>The StartupTeam Team</p>
            </div>
            <div class="footer">
              <p>© 2026 StartupTeam. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Send password reset email error:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send application status update email
exports.sendApplicationStatusEmail = async (email, memberName, startupName, roleTitle, status) => {
  try {
    const transporter = createTransporter();
    
    const statusMessages = {
      accepted: {
        subject: '🎉 Congratulations! Application Accepted',
        color: '#22c55e',
        message: 'Your application has been accepted! The founder will contact you soon.'
      },
      rejected: {
        subject: 'Application Update',
        color: '#ef4444',
        message: 'Thank you for your interest. Unfortunately, your application was not selected this time.'
      },
      interview: {
        subject: '📞 Interview Invitation',
        color: '#f59e0b',
        message: 'Great news! You\'ve been shortlisted for an interview.'
      }
    };

    const statusInfo = statusMessages[status] || statusMessages.rejected;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'StartupTeam <noreply@startupteam.com>',
      to: email,
      subject: statusInfo.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${statusInfo.color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusInfo.subject}</h1>
            </div>
            <div class="content">
              <p>Hi ${memberName},</p>
              <p><strong>Startup:</strong> ${startupName}</p>
              <p><strong>Role:</strong> ${roleTitle}</p>
              <p>${statusInfo.message}</p>
              <p>Best regards,<br>The StartupTeam Team</p>
            </div>
            <div class="footer">
              <p>© 2026 StartupTeam. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Application status email sent to:', email);
  } catch (error) {
    console.error('Send application status email error:', error);
    throw new Error('Failed to send application status email');
  }
};

// Send new application notification to founder
exports.sendNewApplicationEmail = async (founderEmail, founderName, memberName, roleTitle, startupName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'StartupTeam <noreply@startupteam.com>',
      to: founderEmail,
      subject: `🎯 New Application for ${roleTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Application Received!</h1>
            </div>
            <div class="content">
              <p>Hi ${founderName},</p>
              <p>Good news! You have a new application for your role at ${startupName}.</p>
              <p><strong>Applicant:</strong> ${memberName}</p>
              <p><strong>Role:</strong> ${roleTitle}</p>
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/pages/members-requests.html" class="button">View Application</a>
              </p>
              <p>Best regards,<br>The StartupTeam Team</p>
            </div>
            <div class="footer">
              <p>© 2026 StartupTeam. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('New application email sent to:', founderEmail);
  } catch (error) {
    console.error('Send new application email error:', error);
    // Don't throw error, just log it
  }
};
