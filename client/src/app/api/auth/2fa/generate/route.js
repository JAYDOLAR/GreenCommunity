export async function POST(request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    // Mock 2FA secret generation
    return Response.json({
      success: true,
      secret: 'JBSWY3DPEHPK3PXP',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    });
  } catch (error) {
    console.error('2FA generate API error:', error);
    return Response.json(
      { error: 'Failed to generate 2FA secret' },
      { status: 500 }
    );
  }
} 