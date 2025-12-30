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

    const formData = await request.formData();
    const file = formData.get('avatar');
    
    if (!file) {
      return Response.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Mock successful avatar upload
    return Response.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: {
        url: '/user-icon.png',
        filename: file.name
      }
    });
  } catch (error) {
    console.error('Avatar upload API error:', error);
    return Response.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
} 