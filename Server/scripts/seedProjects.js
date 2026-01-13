import mongoose from 'mongoose';
import { getProjectModel } from '../models/Project.model.js';
import { getConnection } from '../config/databases.js';

// Real-world Indian environmental projects data
const projectsData = [
  {
    name: "Green India Mission - National Afforestation",
    location: "Pan-India (Multiple States)",
    region: "South Asia",
    type: "forestry",
    category: "reforestation",
    description: "National afforestation program targeting degraded forest lands, aiming to increase forest and tree cover by 5 million hectares and improve ecosystem services. This comprehensive mission focuses on restoration, conservation, and sustainable forest management across all Indian states.",
    status: "active",
    fundingGoal: 4600000000,
    totalFunding: 4600000000,
    currentFunding: 2850000000,
    contributors: 185000,
    teamSize: 1250,
    startDate: new Date("2014-02-01"),
    expectedCompletion: new Date("2030-12-31"),
    endDate: new Date("2030-12-31"),
    carbonOffsetTarget: 95000000,
    co2Removed: 42000000,
    co2PerRupee: 0.0015,
    verified: true,
    featured: true,
    benefits: [
      "Increasing forest cover by 5 million hectares",
      "Sequestering 95 million tons of CO2",
      "Creating 3+ million green jobs",
      "Improving biodiversity across 28 states",
      "Enhancing ecosystem services for rural communities",
      "Protecting wildlife corridors and habitats"
    ],
    certifications: ["National Mission for Green India", "Ministry of Environment Certified", "UNFCCC Registered"],
    impact: {
      carbonOffset: 42000000,
      area: 3200000,
      beneficiaries: 45000000
    },
    coordinates: {
      latitude: 20.5937,
      longitude: 78.9629
    },
    organization: {
      name: "Ministry of Environment, Forest and Climate Change",
      contact: "greenindia@moef.gov.in",
      website: "https://greenindiamission.gov.in"
    },
    image: {
      url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
      uploadedAt: new Date("2024-01-15")
    },
    verification: {
      status: "approved",
      submittedAt: new Date("2023-12-01"),
      reviewedAt: new Date("2024-01-10"),
      notes: []
    }
  },
  {
    name: "Bhadla Solar Park - Rajasthan",
    location: "Bhadla, Jodhpur, Rajasthan",
    region: "North India",
    type: "renewable",
    category: "renewable-energy",
    description: "One of the world's largest solar parks with 2,245 MW capacity, spread across 14,000 acres in the Thar Desert. This mega solar installation provides clean energy to millions while demonstrating India's commitment to renewable energy and reducing carbon emissions.",
    status: "active",
    fundingGoal: 14000000000,
    totalFunding: 14000000000,
    currentFunding: 14000000000,
    contributors: 42000,
    teamSize: 320,
    startDate: new Date("2015-07-01"),
    expectedCompletion: new Date("2045-12-31"),
    endDate: new Date("2045-12-31"),
    carbonOffsetTarget: 75000000,
    co2Removed: 38000000,
    co2PerRupee: 0.00095,
    verified: true,
    featured: true,
    benefits: [
      "Generating 2,245 MW solar power",
      "Powering 4.5 million homes annually",
      "Reducing 3.8 million tons of CO2 per year",
      "Creating employment for 8,500+ workers",
      "Utilizing barren desert land productively",
      "Contributing to India's 500 GW renewable target"
    ],
    certifications: ["MNRE Certified", "Clean Development Mechanism", "ISO 50001 Energy Management"],
    impact: {
      carbonOffset: 38000000,
      area: 5665,
      beneficiaries: 15000000
    },
    coordinates: {
      latitude: 27.5590,
      longitude: 71.2048
    },
    organization: {
      name: "Solar Energy Corporation of India (SECI)",
      contact: "info@seci.co.in",
      website: "https://seci.co.in"
    },
    image: {
      url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
      uploadedAt: new Date("2024-02-10")
    },
    verification: {
      status: "approved",
      submittedAt: new Date("2023-11-15"),
      reviewedAt: new Date("2024-01-05"),
      notes: []
    }
  },
  {
    name: "Mumbai Urban Forest - Miyawaki Method",
    location: "Mumbai, Maharashtra",
    region: "West India",
    type: "forestry",
    category: "reforestation",
    description: "Creating dense urban micro-forests using the Japanese Miyawaki technique across Mumbai. These forests grow 10x faster, are 30x denser, and help combat air pollution, urban heat island effect, and biodiversity loss in India's financial capital.",
    status: "active",
    fundingGoal: 185000000,
    totalFunding: 185000000,
    currentFunding: 152000000,
    contributors: 125000,
    teamSize: 95,
    startDate: new Date("2019-06-01"),
    expectedCompletion: new Date("2027-12-31"),
    endDate: new Date("2027-12-31"),
    carbonOffsetTarget: 950000,
    co2Removed: 485000,
    co2PerRupee: 0.0022,
    verified: true,
    featured: true,
    benefits: [
      "Planting 1.2 million native trees",
      "Creating 150+ urban micro-forests",
      "Reducing urban temperature by 4-6°C",
      "Improving air quality (PM2.5 reduction by 25%)",
      "Increasing urban biodiversity by 350%",
      "Providing green lungs for 22 million residents"
    ],
    certifications: ["Green India Mission Partner", "Smart Cities Mission", "Urban Forest Council Certified"],
    impact: {
      carbonOffset: 485000,
      area: 250,
      beneficiaries: 22000000
    },
    coordinates: {
      latitude: 19.0760,
      longitude: 72.8777
    },
    organization: {
      name: "Say Trees - Mumbai Chapter",
      contact: "mumbai@saytrees.org",
      website: "https://saytrees.org/mumbai"
    },
    image: {
      url: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80",
      uploadedAt: new Date("2024-03-05")
    },
    verification: {
      status: "approved",
      submittedAt: new Date("2024-01-10"),
      reviewedAt: new Date("2024-02-15"),
      notes: []
    }
  },
  {
    name: "Cauvery Calling - River Rejuvenation",
    location: "Cauvery Basin, Karnataka & Tamil Nadu",
    region: "South India",
    type: "water",
    category: "conservation",
    description: "Massive tree-based farmer livelihood program to plant 242 crore trees along the Cauvery river basin. This initiative aims to increase green cover by one-third, revitalize the dying river, and support 84 million people dependent on the Cauvery ecosystem.",
    status: "active",
    fundingGoal: 4200000000,
    totalFunding: 4200000000,
    currentFunding: 2650000000,
    contributors: 285000,
    teamSize: 580,
    startDate: new Date("2019-09-01"),
    expectedCompletion: new Date("2031-12-31"),
    endDate: new Date("2031-12-31"),
    carbonOffsetTarget: 65000000,
    co2Removed: 28500000,
    co2PerRupee: 0.0018,
    verified: true,
    featured: true,
    benefits: [
      "Planting 2.42 billion trees on farmland",
      "Revitalizing 83,000 km² river basin",
      "Supporting 5.2 million farmer families",
      "Improving soil health and water retention",
      "Restoring natural river flow patterns",
      "Creating sustainable farmer livelihoods through agroforestry"
    ],
    certifications: ["Isha Outreach Initiative", "UN Environment Partnership", "Karnataka & TN Forest Dept Certified"],
    impact: {
      carbonOffset: 28500000,
      area: 83000,
      beneficiaries: 84000000
    },
    coordinates: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    organization: {
      name: "Isha Outreach - Cauvery Calling",
      contact: "info@cauverycalling.org",
      website: "https://cauverycalling.org"
    },
    image: {
      url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
      uploadedAt: new Date("2024-01-20")
    },
    verification: {
      status: "approved",
      submittedAt: new Date("2023-12-15"),
      reviewedAt: new Date("2024-01-18"),
      notes: []
    }
  },
  {
    name: "Sikkim Organic Farming - 100% Organic State",
    location: "Sikkim",
    region: "Northeast India",
    type: "agriculture",
    category: "sustainable-agriculture",
    description: "World's first 100% organic state, transitioning 75,000 hectares of farmland to certified organic agriculture. This pioneering initiative eliminates chemical pesticides and fertilizers while improving farmer income, soil health, and producing premium organic products.",
    status: "completed",
    fundingGoal: 1200000000,
    totalFunding: 1200000000,
    currentFunding: 1200000000,
    contributors: 68000,
    teamSize: 185,
    startDate: new Date("2003-01-01"),
    expectedCompletion: new Date("2016-12-31"),
    endDate: new Date("2016-12-31"),
    carbonOffsetTarget: 4500000,
    co2Removed: 4500000,
    co2PerRupee: 0.0025,
    verified: true,
    featured: true,
    benefits: [
      "Converting 75,000 hectares to organic farming",
      "Banning chemical pesticides and fertilizers statewide",
      "Improving farmer income by 20%",
      "Protecting Himalayan ecosystem biodiversity",
      "Producing premium organic exports",
      "Creating sustainable agricultural model for India"
    ],
    certifications: ["FAO Best Policy Award", "UN Future Policy Award", "Organic Farming Certification"],
    impact: {
      carbonOffset: 4500000,
      area: 75000,
      beneficiaries: 650000
    },
    coordinates: {
      latitude: 27.5330,
      longitude: 88.5122
    },
    organization: {
      name: "Government of Sikkim - Agriculture Department",
      contact: "agrisikkim@gov.in",
      website: "https://www.sikkimagrisnet.org"
    },
    image: {
      url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
      uploadedAt: new Date("2024-02-01")
    },
    verification: {
      status: "approved",
      submittedAt: new Date("2023-10-20"),
      reviewedAt: new Date("2023-11-25"),
      notes: []
    }
  },
  {
    name: "Ganga Rejuvenation - Namami Gange",
    location: "Ganga River Basin (5 States)",
    region: "North & East India",
    type: "water",
    category: "clean-water",
    description: "Integrated conservation mission to clean and rejuvenate the sacred Ganga river. This comprehensive program focuses on pollution abatement, riverfront development, biodiversity conservation, and ensuring continuous flow (Aviral Dhara) and unpolluted water (Nirmal Dhara).",
    status: "active",
    fundingGoal: 20000000000,
    totalFunding: 20000000000,
    currentFunding: 16500000000,
    contributors: 425000,
    teamSize: 850,
    startDate: new Date("2014-06-13"),
    expectedCompletion: new Date("2026-12-31"),
    endDate: new Date("2026-12-31"),
    carbonOffsetTarget: 8500000,
    co2Removed: 5200000,
    co2PerRupee: 0.0008,
    verified: true,
    featured: true,
    benefits: [
      "Treating 100% urban sewage before discharge",
      "Creating 168 Sewage Treatment Plants",
      "Cleaning 2,525 km of river stretch",
      "Conserving Gangetic dolphins and aquatic biodiversity",
      "Supporting 500+ million people in river basin",
      "Restoring natural river flow and water quality"
    ],
    certifications: ["National Mission", "World Bank Partnership", "UNESCO Water Quality Monitoring"],
    impact: {
      carbonOffset: 5200000,
      area: 860000,
      beneficiaries: 500000000
    },
    coordinates: {
      latitude: 25.3176,
      longitude: 82.9739
    },
    organization: {
      name: "National Mission for Clean Ganga (NMCG)",
      contact: "info@nmcg.nic.in",
      website: "https://nmcg.nic.in"
    },
    image: {
      url: "https://images.unsplash.com/photo-1512813195452-46f48a96967b?w=800&q=80",
      uploadedAt: new Date("2024-01-25")
    },
    verification: {
      status: "approved",
      submittedAt: new Date("2023-11-10"),
      reviewedAt: new Date("2024-01-05"),
      notes: []
    }
  },
  {
    name: "Kaziranga Wildlife Conservation",
    location: "Kaziranga National Park, Assam",
    region: "Northeast India",
    type: "forestry",
    category: "conservation",
    description: "UNESCO World Heritage Site protecting two-thirds of the world's one-horned rhinoceros population. This conservation success story combines strict protection, community involvement, and habitat restoration to safeguard endangered species and critical grassland ecosystems.",
    status: "active",
    fundingGoal: 850000000,
    totalFunding: 850000000,
    currentFunding: 720000000,
    contributors: 95000,
    teamSize: 285,
    startDate: new Date("2005-01-01"),
    expectedCompletion: new Date("2030-12-31"),
    endDate: new Date("2030-12-31"),
    carbonOffsetTarget: 12000000,
    co2Removed: 8500000,
    co2PerRupee: 0.0019,
    verified: true,
    featured: true,
    benefits: [
      "Protecting 2,400+ one-horned rhinos (67% global population)",
      "Conserving 1,030 km² of critical habitat",
      "Supporting 120+ Royal Bengal tigers",
      "Protecting 35 endangered species",
      "Creating eco-tourism employment for local communities",
      "Maintaining vital flood plain ecosystem"
    ],
    certifications: ["UNESCO World Heritage", "Ramsar Wetland", "WWF Partnership"],
    impact: {
      carbonOffset: 8500000,
      area: 103000,
      beneficiaries: 850000
    },
    coordinates: {
      latitude: 26.5775,
      longitude: 93.1711
    },
    organization: {
      name: "Assam Forest Department",
      contact: "kaziranga@assamforest.in",
      website: "https://www.kaziranga.assam.gov.in"
    },
    image: {
      url: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80",
      uploadedAt: new Date("2024-02-20")
    },
    verification: {
      status: "approved",
      submittedAt: new Date("2023-12-05"),
      reviewedAt: new Date("2024-01-15"),
      notes: []
    }
  },
  {
    name: "Gujarat Wind Power Initiative",
    location: "Kutch & Saurashtra, Gujarat",
    region: "West India",
    type: "renewable",
    category: "renewable-energy",
    description: "India's largest wind power generation hub with over 4,000 MW installed capacity. Leveraging high-wind coastal areas to generate clean electricity, this initiative positions Gujarat as a leader in renewable energy and supports India's climate commitments.",
    status: "active",
    fundingGoal: 32000000000,
    totalFunding: 32000000000,
    currentFunding: 32000000000,
    contributors: 58000,
    teamSize: 420,
    startDate: new Date("2010-03-01"),
    expectedCompletion: new Date("2050-12-31"),
    endDate: new Date("2050-12-31"),
    carbonOffsetTarget: 185000000,
    co2Removed: 92000000,
    co2PerRupee: 0.00088,
    verified: true,
    featured: true,
    benefits: [
      "Generating 4,000+ MW wind power",
      "Powering 8+ million homes",
      "Reducing 7.5 million tons of CO2 annually",
      "Creating 15,000+ green energy jobs",
      "Leading India's wind energy sector",
      "Demonstrating renewable energy viability"
    ],
    certifications: ["MNRE Certified", "Renewable Energy Certificate", "ISO 14001"],
    impact: {
      carbonOffset: 92000000,
      area: 8500,
      beneficiaries: 28000000
    },
    coordinates: {
      latitude: 23.0225,
      longitude: 72.5714
    },
    organization: {
      name: "Gujarat Energy Development Agency",
      contact: "info@geda.gujarat.gov.in",
      website: "https://www.geda.gujarat.gov.in"
    },
    image: {
      url: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&q=80",
      uploadedAt: new Date("2024-01-30")
    },
    verification: {
      status: "approved",
      submittedAt: new Date("2023-11-20"),
      reviewedAt: new Date("2024-01-08"),
      notes: []
    }
  },
  {
    name: "Sundarbans Mangrove Restoration",
    location: "Sundarbans Delta, West Bengal",
    region: "East India",
    type: "forestry",
    category: "conservation",
    description: "Protecting and restoring the Indian portion of the world's largest mangrove forest and UNESCO World Heritage Site. This critical ecosystem provides storm protection, supports fisheries, and is the last refuge of the Bengal tiger while sequestering massive amounts of carbon.",
    status: "active",
    fundingGoal: 950000000,
    totalFunding: 950000000,
    currentFunding: 785000000,
    contributors: 125000,
    teamSize: 350,
    startDate: new Date("2015-04-01"),
    expectedCompletion: new Date("2030-12-31"),
    endDate: new Date("2030-12-31"),
    carbonOffsetTarget: 42000000,
    co2Removed: 24500000,
    co2PerRupee: 0.0021,
    verified: true,
    featured: true,
    benefits: [
      "Restoring 42,000 hectares of mangroves",
      "Protecting 4.5 million coastal residents from cyclones",
      "Conserving 96 Royal Bengal tigers",
      "Supporting sustainable fishing livelihoods",
      "Natural carbon sequestration of 1.5M tons/year",
      "Maintaining critical biodiversity hotspot"
    ],
    certifications: ["UNESCO World Heritage", "Ramsar Wetland", "Blue Carbon Initiative"],
    impact: {
      carbonOffset: 24500000,
      area: 42000,
      beneficiaries: 4500000
    },
    coordinates: {
      latitude: 21.9497,
      longitude: 89.1833
    },
    organization: {
      name: "West Bengal Forest Department",
      contact: "sundarbans@wbforest.gov.in",
      website: "https://www.sundarbansnationalpark.com"
    },
    image: {
      url: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=800&q=80",
      uploadedAt: new Date("2024-02-15")
    },
    verification: {
      status: "approved",
      submittedAt: new Date("2023-12-20"),
      reviewedAt: new Date("2024-01-22"),
      notes: []
    }
  },
  {
    name: "Bangalore Lake Rejuvenation Project",
    location: "Bangalore, Karnataka",
    region: "South India",
    type: "water",
    category: "clean-water",
    description: "Comprehensive restoration of Bangalore's historic lake system, reviving over 80 lakes that were polluted or encroached. This urban water conservation project improves groundwater recharge, creates biodiversity habitats, and provides recreational spaces for the tech capital of India.",
    status: "active",
    fundingGoal: 680000000,
    totalFunding: 680000000,
    currentFunding: 520000000,
    contributors: 185000,
    teamSize: 165,
    startDate: new Date("2017-08-01"),
    expectedCompletion: new Date("2028-12-31"),
    endDate: new Date("2028-12-31"),
    carbonOffsetTarget: 2800000,
    co2Removed: 1650000,
    co2PerRupee: 0.0016,
    verified: true,
    featured: false,
    benefits: [
      "Restoring 85+ urban lakes (over 1,000 hectares)",
      "Improving groundwater recharge by 40%",
      "Treating 120 MLD of sewage water",
      "Creating urban biodiversity corridors",
      "Providing recreational spaces for 12 million residents",
      "Reducing urban flooding through natural water storage"
    ],
    certifications: ["Karnataka Lake Conservation Authority", "BBMP Certified", "Wetland Conservation"],
    impact: {
      carbonOffset: 1650000,
      area: 1200,
      beneficiaries: 12000000
    },
    coordinates: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    organization: {
      name: "Bangalore Development Authority (BDA)",
      contact: "lakes@bdabangalore.org",
      website: "https://www.bdabangalore.org"
    },
    image: {
      url: "https://images.unsplash.com/photo-1580794852594-1b8e96eedf39?w=800&q=80",
      uploadedAt: new Date("2024-03-01")
    },
    verification: {
      status: "in-review",
      submittedAt: new Date("2024-02-15"),
      notes: []
    }
  },
  {
    name: "Khasi Hills Forest Conservation",
    location: "Cherrapunji & Mawsynram, Meghalaya",
    region: "Northeast India",
    type: "forestry",
    category: "conservation",
    description: "Protecting ancient sacred forests and implementing community-led conservation in the wettest place on Earth. This indigenous-led initiative combines traditional Khasi knowledge with modern conservation to protect unique cloud forests and maintain critical watershed services.",
    status: "active",
    fundingGoal: 420000000,
    totalFunding: 420000000,
    currentFunding: 335000000,
    contributors: 65000,
    teamSize: 125,
    startDate: new Date("2016-05-01"),
    expectedCompletion: new Date("2029-12-31"),
    endDate: new Date("2029-12-31"),
    carbonOffsetTarget: 18000000,
    co2Removed: 9500000,
    co2PerRupee: 0.0023,
    verified: true,
    featured: false,
    benefits: [
      "Protecting 25,000 hectares of cloud forests",
      "Conserving sacred groves and indigenous biodiversity",
      "Supporting traditional Khasi forest management",
      "Maintaining watershed for 3+ million people",
      "Preserving unique flora with 1,000+ endemic species",
      "Creating eco-tourism opportunities for local communities"
    ],
    certifications: ["Community Forest Rights Act", "Meghalaya Biodiversity Board", "Sacred Natural Sites Initiative"],
    impact: {
      carbonOffset: 9500000,
      area: 25000,
      beneficiaries: 3500000
    },
    coordinates: {
      latitude: 25.2633,
      longitude: 91.7319
    },
    organization: {
      name: "Khasi Hills Community Forest Trust",
      contact: "info@khforest.org",
      website: "https://www.khforest.org"
    },
    image: {
      url: "https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80",
      uploadedAt: new Date("2024-02-25")
    },
    verification: {
      status: "approved",
      submittedAt: new Date("2024-01-05"),
      reviewedAt: new Date("2024-02-10"),
      notes: []
    }
  },
  {
    name: "Plastic Waste Management - Swachh Bharat",
    location: "Pan-India (Major Cities)",
    region: "South Asia",
    type: "waste",
    category: "waste-management",
    description: "National initiative to eliminate single-use plastics and establish comprehensive plastic waste management systems across India. This program focuses on collection, segregation, recycling, and creating circular economy models for plastic waste in urban areas.",
    status: "active",
    fundingGoal: 5600000000,
    totalFunding: 5600000000,
    currentFunding: 4200000000,
    contributors: 520000,
    teamSize: 2850,
    startDate: new Date("2016-10-02"),
    expectedCompletion: new Date("2030-12-31"),
    endDate: new Date("2030-12-31"),
    carbonOffsetTarget: 28000000,
    co2Removed: 16500000,
    co2PerRupee: 0.0012,
    verified: true,
    featured: true,
    benefits: [
      "Collecting and recycling 3.5 million tons of plastic annually",
      "Banning single-use plastics nationwide",
      "Creating 50,000+ waste management jobs",
      "Establishing 1,000+ recycling centers",
      "Reducing ocean plastic pollution from rivers",
      "Building circular economy infrastructure"
    ],
    certifications: ["Swachh Bharat Mission", "Central Pollution Control Board", "Extended Producer Responsibility"],
    impact: {
      carbonOffset: 16500000,
      area: 500000,
      beneficiaries: 350000000
    },
    coordinates: {
      latitude: 28.6139,
      longitude: 77.2090
    },
    organization: {
      name: "Ministry of Housing and Urban Affairs",
      contact: "swachhbharat@mhua.gov.in",
      website: "https://swachhbharatmission.gov.in"
    },
    image: {
      url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
      uploadedAt: new Date("2024-01-18")
    },
    verification: {
      status: "approved",
      submittedAt: new Date("2023-11-25"),
      reviewedAt: new Date("2024-01-12"),
      notes: []
    }
  }
];

async function seedProjects() {
  try {
    console.log('🌱 Starting project seeding...\n');

    // Get the project model
    const Project = await getProjectModel();
    
    // Clear existing projects (optional - comment out if you want to keep existing data)
    const deleteResult = await Project.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing projects\n`);

    // Insert new projects
    console.log('📝 Inserting real-world environmental projects...\n');
    const insertedProjects = await Project.insertMany(projectsData);
    
    console.log('✅ Successfully seeded projects:\n');
    insertedProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}`);
      console.log(`   Location: ${project.location}`);
      console.log(`   Type: ${project.type}`);
      console.log(`   CO2 Removed: ${project.co2Removed.toLocaleString()} tons`);
      console.log(`   Funding: $${(project.currentFunding / 1000000).toFixed(1)}M / $${(project.totalFunding / 1000000).toFixed(1)}M`);
      console.log(`   Contributors: ${project.contributors.toLocaleString()}`);
      console.log('');
    });

    console.log(`\n🎉 Total projects seeded: ${insertedProjects.length}`);
    console.log('\n📊 Summary:');
    console.log(`   Total CO2 Removed: ${(insertedProjects.reduce((sum, p) => sum + p.co2Removed, 0) / 1000000).toFixed(1)}M tons`);
    console.log(`   Total Funding: $${(insertedProjects.reduce((sum, p) => sum + p.totalFunding, 0) / 1000000000).toFixed(1)}B`);
    console.log(`   Total Contributors: ${insertedProjects.reduce((sum, p) => sum + p.contributors, 0).toLocaleString()}`);
    console.log(`   Total Beneficiaries: ${insertedProjects.reduce((sum, p) => sum + (p.impact?.beneficiaries || 0), 0).toLocaleString()}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    process.exit(1);
  }
}

// Run the seeder
seedProjects();
