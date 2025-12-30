export async function GET(request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Access denied. No token provided.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // For demo purposes, we'll accept any token
    // In a real app, you would validate the JWT token here
    
    // Mock user settings data
    const userSettings = {
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
      },
      notifications: {
        emailUpdates: true,
        challengeReminders: true,
        weeklyReports: true,
        communityActivity: false,
        marketingEmails: false,
        mobilePush: true,
        socialActivity: true
      },
      preferences: {
        language: 'en',
        currency: 'usd',
        units: 'metric',
        theme: 'light',
        notifications: {
          emailUpdates: true,
          challengeReminders: true,
          weeklyReports: true,
          communityActivity: false,
          marketingEmails: false,
          mobilePush: true,
          socialActivity: true
        }
      }
    };

    return Response.json(userSettings);
  } catch (error) {
    console.error('Settings API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 