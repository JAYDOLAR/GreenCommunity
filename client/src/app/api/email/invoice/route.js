import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const invoiceData = await request.json();
    
    // Call the Server email service
    const emailResponse = await fetch(`${process.env.SERVER_URL || 'http://localhost:5000'}/api/email/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData)
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send invoice email');
    }

    const result = await emailResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Invoice email sent successfully'
    });

  } catch (error) {
    console.error('Invoice email error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send invoice email' 
      },
      { status: 500 }
    );
  }
}
