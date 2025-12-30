export async function POST(request) {
  try {
    const body = await request.json();
    const { tempToken, token } = body;
    
    // Mock 2FA login verification (accept any 6-digit code)
    if (token && token.length === 6) {
      return Response.json({
        success: true,
        message: '2FA verification successful',
        token: 'mock-jwt-token-after-2fa'
      });
    }
    
    return Response.json(
      { error: 'Invalid 2FA code' },
      { status: 400 }
    );
  } catch (error) {
    console.error('2FA verify login API error:', error);
    return Response.json(
      { error: 'Failed to verify 2FA login' },
      { status: 500 }
    );
  }
} 