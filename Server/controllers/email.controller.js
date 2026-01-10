import emailService from '../services/email.service.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Send payment invoice email
 * @desc    Send payment invoice email after successful payment
 * @route   POST /api/email/invoice
 * @access  Public (called from payment verification)
 */
export const sendInvoiceEmail = asyncHandler(async (req, res) => {
  console.log('📧 Invoice email request received:', req.body);
  
  const { 
    email, 
    name, 
    amount, 
    projectName, 
    paymentId, 
    orderId, 
    co2Impact,
    userEmail // fallback email field
  } = req.body;

  // Validate required fields
  if (!email && !userEmail) {
    console.log('❌ Validation failed: Email is required');
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  if (!amount) {
    console.log('❌ Validation failed: Payment amount is required');
    return res.status(400).json({
      success: false,
      message: 'Payment amount is required'
    });
  }

  if (!projectName) {
    console.log('❌ Validation failed: Project name is required');
    return res.status(400).json({
      success: false,
      message: 'Project name is required'
    });
  }

  if (!paymentId) {
    console.log('❌ Validation failed: Payment ID is required');
    return res.status(400).json({
      success: false,
      message: 'Payment ID is required'
    });
  }

  try {
    const invoiceData = {
      email: email || userEmail,
      name: name || 'Valued Contributor',
      amount: amount.toString(),
      projectName,
      paymentId,
      orderId: orderId || null,
      co2Impact: co2Impact || null,
      date: new Date()
    };

    console.log('📧 Sending invoice email to:', invoiceData.email);
    console.log('💰 Payment details:', {
      amount: invoiceData.amount,
      project: invoiceData.projectName,
      paymentId: invoiceData.paymentId
    });

    await emailService.sendPaymentInvoice(invoiceData);

    console.log('✅ Invoice email sent successfully to:', invoiceData.email);
    
    res.status(200).json({
      success: true,
      message: 'Invoice email sent successfully'
    });

  } catch (error) {
    console.error('❌ Invoice email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invoice email',
      error: error.message
    });
  }
});
