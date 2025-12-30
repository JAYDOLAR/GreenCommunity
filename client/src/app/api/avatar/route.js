export async function DELETE(request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    // Mock successful avatar deletion
    return Response.json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    console.error('Avatar delete API error:', error);
    return Response.json(
      { error: 'Failed to delete avatar' },
      { status: 500 }
    );
  }
} 