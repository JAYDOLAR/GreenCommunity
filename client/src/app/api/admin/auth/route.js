export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // In a real application, this would validate against your database
    // For demo purposes, we'll use hardcoded admin credentials
    const validCredentials = {
      email: 'admin@greencommunity.com',
      password: 'admin123'
    };

    if (email === validCredentials.email && password === validCredentials.password) {
      // In a real app, you would generate a JWT token here
      return Response.json({
        success: true,
        message: 'Login successful',
        user: {
          email: email,
          role: 'admin',
          name: 'Admin User'
        }
      });
    } else {
      return Response.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        }, 
        { status: 401 }
      );
    }
  } catch (error) {
    return Response.json(
      { 
        success: false, 
        message: 'An error occurred during authentication' 
      }, 
      { status: 500 }
    );
  }
} 