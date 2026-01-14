import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      amount,
      projectName,
      userEmail,
      userName,
      co2Impact
    } = await request.json();

    console.log('💳 Payment verification request:', {
      razorpay_payment_id,
      razorpay_order_id,
      amount,
      projectName,
      userEmail,
      userName,
      co2Impact
    });

    // For development, always return success
    // In production, verify the payment signature
    
    // Send invoice email after successful payment
    try {
      console.log('📧 Attempting to send invoice email...');
      
      // Use the backend server directly for sending emails
      const serverUrl = process.env.SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const invoiceResponse = await fetch(`${serverUrl}/api/email/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          amount,
          projectName,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          co2Impact
        })
      });

      if (invoiceResponse.ok) {
        console.log('✅ Invoice email sent successfully');
      } else {
        console.error('❌ Failed to send invoice email:', await invoiceResponse.text());
      }
    } catch (emailError) {
      console.error('❌ Invoice email error:', emailError);
      // Don't fail the payment verification if email fails
    }
    
    return NextResponse.json({
      success: true,
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: `Payment of ₹${amount} for ${projectName} completed successfully`
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment verification failed' 
      },
      { status: 500 }
    );
  }
}

// Example of actual signature verification (commented out)
/*
export async function POST(request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await request.json();

    // Create signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is verified
      // Save payment details to database
      
      return NextResponse.json({
        success: true,
        verified: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment verification failed' 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment verification failed' 
      },
      { status: 500 }
    );
  }
}
*/
