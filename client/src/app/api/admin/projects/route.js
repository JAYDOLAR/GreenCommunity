export async function GET() {
  try {
    // In a real application, this would fetch from your database
    const projects = [
      {
        id: 1,
        name: 'Amazon Rainforest Restoration',
        location: 'Brazil, South America',
        type: 'forestry',
        description: 'Large-scale reforestation project in the Amazon basin to restore degraded areas and create carbon sinks.',
        status: 'active',
        funding: 75,
        totalFunding: 207500000,
        currentFunding: 155625000,
        contributors: 15420,
        co2Removed: 125000,
        verified: true,
        featured: false,
        createdDate: '2024-01-10',
        image: '/tree1.jpg',
        expectedCompletion: '2025-06-15',
        teamSize: 45,
        carbonOffsetTarget: 150000
      },
      {
        id: 2,
        name: 'Wind Farm Development',
        location: 'Texas, USA',
        type: 'renewable',
        description: 'Construction of wind turbines to generate clean energy and reduce fossil fuel dependency.',
        status: 'pending',
        funding: 64,
        totalFunding: 415000000,
        currentFunding: 265600000,
        contributors: 8765,
        co2Removed: 75000,
        verified: false,
        featured: false,
        createdDate: '2024-01-15',
        image: '/tree2.jpg',
        expectedCompletion: '2025-12-20',
        teamSize: 32,
        carbonOffsetTarget: 100000
      },
      {
        id: 3,
        name: 'Ocean Kelp Forest Restoration',
        location: 'California, USA',
        type: 'water',
        description: 'Restoration of kelp forests to enhance marine biodiversity and carbon sequestration.',
        status: 'active',
        funding: 65,
        totalFunding: 66400000,
        currentFunding: 43160000,
        contributors: 3240,
        co2Removed: 45000,
        verified: true,
        featured: true,
        createdDate: '2024-01-08',
        image: '/tree3.jpg',
        expectedCompletion: '2024-11-30',
        teamSize: 28,
        carbonOffsetTarget: 60000
      },
      {
        id: 4,
        name: 'Solar Energy Cooperative',
        location: 'Kenya, Africa',
        type: 'renewable',
        description: 'Community-based solar energy project to provide clean electricity to rural areas.',
        status: 'rejected',
        funding: 63,
        totalFunding: 37350000,
        currentFunding: 23655000,
        contributors: 1890,
        co2Removed: 32000,
        verified: false,
        featured: false,
        createdDate: '2024-01-12',
        image: '/tree4.jpg',
        expectedCompletion: '2024-08-15',
        teamSize: 15,
        carbonOffsetTarget: 40000
      },
      {
        id: 5,
        name: 'Mangrove Conservation',
        location: 'Philippines, Asia',
        type: 'forestry',
        description: 'Protection and restoration of mangrove ecosystems for coastal protection and carbon storage.',
        status: 'active',
        funding: 75,
        totalFunding: 99600000,
        currentFunding: 74700000,
        contributors: 6750,
        co2Removed: 85000,
        verified: true,
        featured: true,
        createdDate: '2024-01-05',
        image: '/tree5.jpg',
        expectedCompletion: '2025-03-10',
        teamSize: 38,
        carbonOffsetTarget: 120000
      }
    ];

    return Response.json({ projects });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // In a real application, this would save to your database
    const newProject = {
      id: Date.now(),
      ...body,
      funding: 0,
      currentFunding: 0,
      contributors: 0,
      co2Removed: 0,
      createdDate: new Date().toISOString().split('T')[0],
      verified: body.verified || false,
      featured: body.featured || false
    };

    return Response.json({ project: newProject });
  } catch (error) {
    return Response.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // In a real application, this would update your database
    return Response.json({ project: body });
  } catch (error) {
    return Response.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // In a real application, this would delete from your database
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete project' }, { status: 500 });
  }
} 