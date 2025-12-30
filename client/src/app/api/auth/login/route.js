export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Mock login validation
    if (email === 'demo@example.com' && password === 'demo123') {
      return Response.json({
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token-for-demo',
        user: {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, USA',
          bio: 'Environmental enthusiast passionate about reducing carbon footprint.',
          joinDate: '2024-01-15',
          preferredUnits: 'metric',
          isGoogleAuth: false,
          avatar: {
            url: '/user-icon.png'
          },
          userInfo: {
            location: {
              city: 'New York',
              country: 'USA'
            },
            avatar: {
              url: '/user-icon.png'
            }
          }
        }
      });
    }
    
    // For any other credentials, return success (for demo purposes)
    return Response.json({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token-for-demo',
              user: {
          id: '1',
          name: 'Demo User',
          email: email,
        phone: '+1 (555) 123-4567',
        location: 'New York, USA',
        bio: 'Environmental enthusiast passionate about reducing carbon footprint.',
        joinDate: '2024-01-15',
        preferredUnits: 'metric',
        isGoogleAuth: false,
        avatar: {
          url: '/user-icon.png'
        },
        userInfo: {
          location: {
            city: 'New York',
            country: 'USA'
          },
          avatar: {
            url: '/user-icon.png'
          }
        }
      }
    });
  } catch (error) {
    console.error('Login API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 