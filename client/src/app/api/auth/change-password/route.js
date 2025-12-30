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

    const body = await request.json();
    
    // Mock password validation
    if (body.current === 'wrongpassword') {
      return Response.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    if (body.new !== body.confirm) {
      return Response.json(
        { error: 'New passwords do not match' },
        { status: 400 }
      );
    }
    
    // Mock successful password change
    return Response.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 