import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    // Remove spaces from Gmail App Password (they work better without spaces)
    const cleanPassword = process.env.EMAIL_PASS?.replace(/\s+/g, '') || '';
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: cleanPassword
      }
    });
  }

  /**
   * Verify email service configuration
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connected successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Send email verification (legacy link-based)
   * @param {string} email - Recipient email
   * @param {string} token - Verification token
   * @param {string} clientUrl - Client URL for verification link
   */
  async sendEmailVerification(email, token, clientUrl) {
    const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
    
    const mailOptions = {
      to: email,
      subject: 'Email Verification - GreenCommunity',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Welcome to GreenCommunity!</h2>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}" style="
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          ">Verify Email</a>
          <p style="color: #666;">This link will expire in 24 hours.</p>
          <p style="color: #666;">If you didn't create this account, please ignore this email.</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send email verification with 6-digit code
   * @param {string} email - Recipient email
   * @param {string} verificationCode - 6-digit verification code
   */
  async sendEmailVerificationCode(email, verificationCode) {
    const mailOptions = {
      to: email,
      subject: 'Email Verification - GreenCommunity',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50; text-align: center;">Welcome to GreenCommunity!</h2>
          
          <p>Hello,</p>
          
          <p>Thank you for registering with GreenCommunity! Please use the verification code below to verify your email address:</p>
          
          <div style="
            background-color: #f8f9fa;
            border: 2px dashed #4CAF50;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          ">
            <h3 style="color: #4CAF50; margin: 0 0 10px 0;">Verification Code</h3>
            <div style="
              font-size: 32px;
              font-weight: bold;
              color: #4CAF50;
              letter-spacing: 8px;
              font-family: monospace;
            ">${verificationCode}</div>
          </div>
          
          <p><strong>Instructions:</strong></p>
          <ol>
            <li>Enter this verification code in the app</li>
            <li>Complete your registration</li>
            <li>Start contributing to our green community!</li>
          </ol>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>Important:</strong> This code will expire in 24 hours for security reasons.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't create this account, please ignore this email.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from GreenCommunity. Please do not reply to this email.
          </p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send password reset email with verification code
   * @param {string} email - Recipient email
   * @param {string} resetCode - 6-digit verification code
   */
  async sendPasswordReset(email, resetCode) {
    const mailOptions = {
      to: email,
      subject: 'Password Reset - GreenCommunity',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f44336; text-align: center;">Password Reset Request</h2>
          
          <p>Hello,</p>
          
          <p>You requested a password reset for your GreenCommunity account. Please use the verification code below to reset your password:</p>
          
          <div style="
            background-color: #f8f9fa;
            border: 2px dashed #f44336;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          ">
            <h3 style="color: #f44336; margin: 0 0 10px 0;">Verification Code</h3>
            <div style="
              font-size: 32px;
              font-weight: bold;
              color: #f44336;
              letter-spacing: 8px;
              font-family: monospace;
            ">${resetCode}</div>
          </div>
          
          <p><strong>Instructions:</strong></p>
          <ol>
            <li>Go to the password reset page</li>
            <li>Enter this verification code</li>
            <li>Set your new password</li>
          </ol>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>Important:</strong> This code will expire in 10 minutes for security reasons.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from GreenCommunity. Please do not reply to this email.
          </p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send welcome email after successful registration
   * @param {string} email - Recipient email
   * @param {string} name - User's name
   */
  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      to: email,
      subject: 'Welcome to GreenCommunity!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Welcome to GreenCommunity, ${name}!</h2>
          <p>Thank you for joining our community of environmentally conscious individuals.</p>
          <p>You can now start exploring and contributing to our green initiatives.</p>
          <p style="color: #666;">Happy contributing!</p>
          <p style="color: #666;">The GreenCommunity Team</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send payment invoice email after successful payment
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.email - Recipient email
   * @param {string} paymentData.name - User's name
   * @param {string} paymentData.amount - Payment amount in INR
   * @param {string} paymentData.projectName - Project name
   * @param {string} paymentData.paymentId - Payment ID from Razorpay
   * @param {string} paymentData.orderId - Order ID
   * @param {string} paymentData.co2Impact - CO2 impact in tons/kg
   * @param {Date} paymentData.date - Payment date
   */
  async sendPaymentInvoice(paymentData) {
    const { email, name, amount, projectName, paymentId, orderId, co2Impact, date } = paymentData;
    const invoiceDate = date ? new Date(date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
    const invoiceNumber = `INV-${orderId || paymentId || Date.now()}`;
    
    const mailOptions = {
      to: email,
      subject: `Payment Invoice - GreenCommunity Contribution | ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <!-- Header -->
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Payment Invoice</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">GreenCommunity Climate Initiative</p>
          </div>
          
          <!-- Invoice Content -->
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Thank You Message -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #4CAF50; margin: 0 0 10px 0;">Thank You for Your Contribution!</h2>
              <p style="color: #666; margin: 0;">Your support helps us build a greener future together.</p>
            </div>
            
            <!-- Invoice Details -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Invoice Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 40%;">Invoice Number:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #333;">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Date:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #333;">${invoiceDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Payment ID:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #333;">${paymentId}</td>
                </tr>
                ${orderId ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">Order ID:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #333;">${orderId}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- Payment Information -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Payment Information</h3>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; color: #333;">Description</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd; color: #333;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd; color: #666;">
                      Climate Contribution to:<br>
                      <strong style="color: #333;">${projectName}</strong>
                    </td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd; font-weight: bold; color: #333;">
                      ₹${parseFloat(amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr style="background-color: #f8f9fa;">
                    <td style="padding: 12px; font-weight: bold; color: #333;">Total Amount Paid</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; color: #4CAF50; font-size: 18px;">
                      ₹${parseFloat(amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Environmental Impact -->
            ${co2Impact ? `
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 6px; margin-bottom: 25px; border-left: 4px solid #4CAF50;">
              <h3 style="color: #2e7d32; margin: 0 0 10px 0; font-size: 16px;">🌱 Your Environmental Impact</h3>
              <p style="margin: 0; color: #2e7d32; font-size: 18px; font-weight: bold;">${co2Impact} CO₂ offset</p>
              <p style="margin: 5px 0 0 0; color: #4caf50; font-size: 14px;">Thank you for making a positive impact on our planet!</p>
            </div>
            ` : ''}
            
            <!-- Billing Information -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Billing Information</h3>
              <p style="margin: 0; color: #666;">
                <strong style="color: #333;">${name || 'Valued Contributor'}</strong><br>
                ${email}
              </p>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                <strong>Payment Method:</strong> Razorpay (Secure Online Payment)
              </p>
              <p style="color: #666; font-size: 14px; margin: 0 0 20px 0;">
                This is a computer-generated invoice. No signature is required.
              </p>
              
              <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
                <p style="margin: 0; color: #666; font-size: 12px;">
                  For any queries regarding this invoice, please contact us at support@greencommunity.com
                </p>
                <p style="margin: 5px 0 0 0; color: #999; font-size: 11px;">
                  GreenCommunity - Building a Sustainable Future Together
                </p>
              </div>
            </div>
          </div>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send user data export email
   * @param {string} email - User email
   * @param {object} userData - Complete user data
   */
  async sendDataExport(email, userData) {
    try {
      // Convert user data to JSON for attachment
      const dataJson = JSON.stringify(userData, null, 2);
      
      const mailOptions = {
        to: email,
        subject: 'Your GreenCommunity Data Export',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4CAF50; margin: 0;">GreenCommunity</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Data Export</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0 0 15px 0;">Your Data Export is Ready</h2>
              <p style="color: #666; margin: 0 0 15px 0;">
                We've compiled all your data from GreenCommunity as requested. This includes:
              </p>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Profile information</li>
                <li>Carbon footprint logs</li>
                <li>Order history</li>
                <li>Challenge participation</li>
                <li>Points and achievements</li>
                <li>Chat sessions</li>
                <li>Settings and preferences</li>
              </ul>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Important:</strong> Your data is attached as a JSON file. Please store it securely as it contains personal information.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; margin: 0;">
                If you have any questions about your data export, please contact our support team.
              </p>
            </div>
            
            <div style="border-top: 1px solid #ddd; padding-top: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This email was sent because you requested a data export from your GreenCommunity account.
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                © ${new Date().getFullYear()} GreenCommunity. All rights reserved.
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `greencommunity-data-export-${new Date().toISOString().split('T')[0]}.json`,
            content: dataJson,
            contentType: 'application/json'
          }
        ]
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Data export email sent successfully' };
    } catch (error) {
      console.error('Error sending data export email:', error);
      return { success: false, message: error.message };
    }
  }
}

export default new EmailService();
