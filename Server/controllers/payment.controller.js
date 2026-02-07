import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance;

function getRazorpay() {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

// POST /api/payment/create-order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, projectName, projectId } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, error: 'Amount must be at least ₹1' });
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys not configured:', {
        keyId: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        secret: !!process.env.RAZORPAY_KEY_SECRET,
      });
      return res.status(500).json({ success: false, error: 'Payment gateway not configured' });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        projectName: projectName || '',
        projectId: projectId || '',
      },
    };

    const order = await getRazorpay().orders.create(options);

    return res.json({ success: true, order });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return res.status(500).json({
      success: false,
      error: error.error?.description || error.message || 'Failed to create payment order',
    });
  }
};

// POST /api/payment/verify
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      projectId,
      projectName,
      userEmail,
      userName,
      co2Impact,
    } = req.body;

    console.log('💳 Payment verification request:', {
      razorpay_payment_id,
      razorpay_order_id,
      amount,
      projectName,
      userEmail,
    });

    // Verify Razorpay signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET not set');
      return res.status(500).json({ success: false, error: 'Payment gateway not configured' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Signature mismatch – possible tampered payment');
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed – invalid signature',
      });
    }

    console.log('✅ Payment signature verified');

    // Update project funding (call internal route directly via fetch)
    if (projectId) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 5000}`;
        const fundingRes = await fetch(`${baseUrl}/api/projects/${projectId}/fund`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
          }),
        });
        if (fundingRes.ok) {
          console.log('✅ Project funding updated');
        } else {
          console.error('⚠️ Failed to update project funding:', await fundingRes.text());
        }
      } catch (fundErr) {
        console.error('⚠️ Funding update error:', fundErr);
      }
    }

    // Send invoice email
    try {
      console.log('📧 Sending invoice email...');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 5000}`;
      const invoiceRes = await fetch(`${baseUrl}/api/email/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          amount,
          projectName,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          co2Impact,
        }),
      });
      if (invoiceRes.ok) {
        console.log('✅ Invoice email sent');
      } else {
        console.error('⚠️ Invoice email failed:', await invoiceRes.text());
      }
    } catch (emailError) {
      console.error('⚠️ Invoice email error:', emailError);
    }

    return res.json({
      success: true,
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: `Payment of ₹${amount} for ${projectName} verified successfully`,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
};
