import ProjectView from '@/components/ProjectView';

const projects = [
    {
      id: 1,
      name: 'Sundarbans Mangrove Restoration',
      location: 'West Bengal, India',
      type: 'forestry',
      image: "/tree1.jpg",
      description: 'Large-scale mangrove restoration project in the Sundarbans, protecting vital ecosystems.',
      co2Removed: 142000,
      co2PerRupee: 0.0005,
      totalFunding: 165000000,
      currentFunding: 123750000,
      contributors: 15230,
      timeRemaining: '9 months',
      verified: true,
      certifications: ['Gold Standard', 'VCS'],
      featured: false,
      benefits: [
        'Biodiversity protection',
        'Community support',
        'Coastal protection',
        'Fisheries development'
      ]
    },
    {
      id: 2,
      name: 'Solar Power Expansion',
      location: 'Rajasthan, India',
      type: 'renewable',
      image: "/tree2.jpg",
      description: 'Installing solar panels for renewable energy generation across Rajasthan.',
      co2Removed: 98000,
      co2PerRupee: 0.00034,
      totalFunding: 430000000,
      currentFunding: 280000000,
      contributors: 9250,
      timeRemaining: '15 months',
      verified: true,
      certifications: ['MNRE', 'SECI'],
      featured: true,
      benefits: [
        'Clean energy',
        'Job creation',
        'Energy independence',
        'Infrastructure improvement'
      ]
    },
    {
      id: 3,
      name: 'Ganga Water Conservation',
      location: 'Uttar Pradesh, India',
      type: 'water',
      image: "/tree3.jpg",
      description: 'Conserving water resources and improving water quality in the Ganga basin.',
      co2Removed: 50000,
      co2PerRupee: 0.00042,
      totalFunding: 76000000,
      currentFunding: 48200000,
      contributors: 3400,
      timeRemaining: '7 months',
      verified: true,
      certifications: ['NMCG', 'CPCB'],
      featured: false,
      benefits: [
        'Water conservation',
        'Wildlife habitat',
        'Tourism development',
        'Pollution reduction'
      ]
    },
    {
      id: 4,
      name: 'Wind Energy Farms',
      location: 'Tamil Nadu, India',
      type: 'renewable',
      image: "/tree4.jpg",
      description: 'Developing wind farms to harness clean energy in Tamil Nadu.',
      co2Removed: 60000,
      co2PerRupee: 0.00031,
      totalFunding: 39000000,
      currentFunding: 25500000,
      contributors: 1990,
      timeRemaining: '5 months',
      verified: true,
      certifications: ['CEIG', 'MoEFCC'],
      featured: false,
      benefits: [
        'Energy production',
        'Employment opportunities',
        'Local business growth',
        'Environmental sustainability'
      ]
    },
    {
      id: 5,
      name: 'Tropical Savanna Conservation',
      location: 'Chhattisgarh, India',
      type: 'forestry',
      image: "/tree5.jpg",
      description: 'Protecting and restoring tropical savanna ecosystems in Chhattisgarh.',
      co2Removed: 85000,
      co2PerRupee: 0.00044,
      totalFunding: 102000000,
      currentFunding: 76500000,
      contributors: 6890,
      timeRemaining: '11 months',
      verified: true,
      certifications: ['WWF', 'Govt of India'],
      featured: true,
      benefits: [
        'Biodiversity conservation',
        'Carbon storage',
        'Community livelihoods',
        'Climate resilience'
      ]
    }
  ];

export async function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id.toString(),
  }));
}

const ProjectDetailPage = ({ params }) => {
  const projectId = parseInt(params.id);
  const project = projects.find(p => p.id === projectId);

  return <ProjectView project={project} allProjects={projects} />;
};

export default ProjectDetailPage;