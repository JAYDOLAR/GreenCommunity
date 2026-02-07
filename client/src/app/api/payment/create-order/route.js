import { NextResponse } from 'next/server';

let razorpay;

async function getRazorpayInstance() {
  if (!razorpay) {
    const Razorpay = (await import('razorpay')).default;
    razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

export async function POST(request) {
  try {
    const { amount, currency = 'INR', receipt, projectName, projectId } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json(
        { success: false, error: 'Amount must be at least ₹1' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys not configured:', {
        keyId: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        secret: !!process.env.RAZORPAY_KEY_SECRET,
      });
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1, // Auto-capture
      notes: {
        projectName: projectName || '',
        projectId: projectId || '',
      },
    };

    const instance = await getRazorpayInstance();
    const order = await instance.orders.create(options);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.error?.description || error.message || 'Failed to create payment order',
      },
      { status: 500 }
    );
  }
}
