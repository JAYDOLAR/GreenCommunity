export async function GET() {
  try {
    // In a real application, this would fetch from your database
    // For now, we'll simulate real user data
    const users = [
      {
        id: 1,
        name: 'Demo User',
                  email: 'demo@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2024-01-15',
        lastLogin: '2024-01-20',
        totalContributions: 5,
        carbonOffset: 1250,
        avatar: '/user-icon.png'
      },
      {
        id: 2,
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2024-01-10',
        lastLogin: '2024-01-19',
        totalContributions: 8,
        carbonOffset: 2100,
        avatar: '/user-icon.png'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        role: 'moderator',
        status: 'active',
        joinDate: '2024-01-05',
        lastLogin: '2024-01-20',
        totalContributions: 12,
        carbonOffset: 3500,
        avatar: '/user-icon.png'
      },
      {
        id: 4,
        name: 'Emily Brown',
        email: 'emily.brown@example.com',
        role: 'user',
        status: 'suspended',
        joinDate: '2024-01-12',
        lastLogin: '2024-01-18',
        totalContributions: 2,
        carbonOffset: 500,
        avatar: '/user-icon.png'
      },
      {
        id: 5,
        name: 'David Lee',
        email: 'david.lee@example.com',
        role: 'user',
        status: 'inactive',
        joinDate: '2024-01-08',
        lastLogin: '2024-01-15',
        totalContributions: 3,
        carbonOffset: 800,
        avatar: '/user-icon.png'
      }
    ];

    return Response.json({ users });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // In a real application, this would save to your database
    const newUser = {
      id: Date.now(), // Generate a unique ID
      ...body,
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
      totalContributions: 0,
      carbonOffset: 0,
      avatar: '/user-icon.png'
    };

    return Response.json({ user: newUser });
  } catch (error) {
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // In a real application, this would update your database
    return Response.json({ user: body });
  } catch (error) {
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // In a real application, this would delete from your database
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
} 