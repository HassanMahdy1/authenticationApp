import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define the HTML content
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eeeeee; border-radius: 12px; }
        .header { background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { padding: 30px; line-height: 1.6; color: #444444; }
        .button-container { text-align: center; margin: 35px 0; }
        .button { background-color: #2ecc71; color: #ffffff !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; }
        .footer { font-size: 13px; color: #999999; text-align: center; margin-top: 25px; border-top: 1px solid #eeeeee; padding-top: 20px; }
        .warning { font-size: 12px; color: #e74c3c; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="color: #2ecc71; margin: 0;">Password Reset Request</h2>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>We received a request to reset your password. No problem! Click the button below to choose a new one:</p>
          <div class="button-container">
            <a href="${options.resetURL}" class="button" target="_blank">Reset Your Password</a>
          </div>
          <p>This link is only valid for <strong>10 minutes</strong>. After that, you'll need to submit a new request.</p>
          <p class="warning">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br><strong>Your App Support Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  // 3) Email options
  const mailOptions = {
    from: `Support Team <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, // Plain text fallback
    html: html,
  };

  // 4) Send the email
  await transporter.sendMail(mailOptions);
};