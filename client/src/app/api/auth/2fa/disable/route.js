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

    // Mock 2FA disable
    return Response.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable API error:', error);
    return Response.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
} 