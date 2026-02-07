import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
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
      co2Impact
    } = await request.json();

    console.log('💳 Payment verification request:', {
      razorpay_payment_id,
      razorpay_order_id,
      amount,
      projectName,
      userEmail,
    });

    // ─── Verify Razorpay signature ───────────────────────────────
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET not set');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error('❌ Signature mismatch – possible tampered payment');
      return NextResponse.json(
        { success: false, error: 'Payment verification failed – invalid signature' },
        { status: 400 }
      );
    }

    console.log('✅ Payment signature verified');

    // ─── Update project funding on the server ────────────────────
    const serverUrl = process.env.SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    if (projectId) {
      try {
        const fundingRes = await fetch(`${serverUrl}/api/projects/${projectId}/fund`, {
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

    // ─── Send invoice email ──────────────────────────────────────
    try {
      console.log('📧 Sending invoice email...');
      const invoiceResponse = await fetch(`${serverUrl}/api/email/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        console.log('✅ Invoice email sent');
      } else {
        console.error('⚠️ Invoice email failed:', await invoiceResponse.text());
      }
    } catch (emailError) {
      console.error('⚠️ Invoice email error:', emailError);
      // Don't fail the whole flow if email fails
    }

    return NextResponse.json({
      success: true,
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: `Payment of ₹${amount} for ${projectName} verified successfully`
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
