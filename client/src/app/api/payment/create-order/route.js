import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json();

    // For now, return a mock order ID
    // In production, you would create actual Razorpay order here
    const mockOrder = {
      id: `order_${Date.now()}`,
      entity: 'order',
      amount: amount * 100, // Convert to paise
      amount_paid: 0,
      amount_due: amount * 100,
      currency: currency,
      receipt: receipt,
      status: 'created',
      attempts: 0,
      notes: {},
      created_at: Math.floor(Date.now() / 1000)
    };

    return NextResponse.json({
      success: true,
      order: mockOrder
    });

  } catch (error) {
    console.error('Payment order creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create payment order' 
      },
      { status: 500 }
    );
  }
}

// Example of actual Razorpay integration (commented out)
/*
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json();

    const options = {
      amount: amount * 100, // amount in paise
      currency: currency,
      receipt: receipt,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create Razorpay order' 
      },
      { status: 500 }
    );
  }
}
*/
