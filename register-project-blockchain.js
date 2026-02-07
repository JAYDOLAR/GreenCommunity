#!/usr/bin/env node
/**
 * Script to register a MongoDB project on blockchain
 * This links your existing projects to the smart contracts
 */

const ADMIN_API_BASE = 'https://greencommunity-app.azurewebsites.net/api';

async function registerProjectOnBlockchain() {
  console.log('🔗 Registering existing project on blockchain...\n');
  
  // Step 1: Get existing projects  
  try {
    console.log('1. Fetching existing projects...');
    const projectsRes = await fetch(`${ADMIN_API_BASE}/projects?limit=5&page=1`);
    const projectsData = await projectsRes.json();
    
    if (!projectsData.success || !projectsData.data?.projects?.length) {
      console.log('❌ No projects found. Create a project first in the admin panel.');
      return;
    }
    
    const project = projectsData.data.projects[0]; // Use first project
    console.log(`✅ Found project: ${project.name} (${project._id})`);
    
    // Step 2: Register on blockchain (need admin auth)
    console.log('\n2. To register this project on blockchain, you need to:');
    console.log('   a) Login as admin to your app');
    console.log('   b) Go to Admin > Projects');
    console.log(`   c) Edit project "${project.name}"`);
    console.log('   d) Look for "Blockchain Integration" section');
    console.log('   e) Click "Register on Blockchain"');
    
    console.log('\n📋 Project Details:');
    console.log(`   Name: ${project.name}`);
    console.log(`   Description: ${project.description?.slice(0, 100)}...`);
    console.log(`   MongoDB ID: ${project._id}`);
    console.log(`   Location: ${project.location || 'Not specified'}`);
    
    console.log('\n🎯 Once registered on blockchain, the project will show:');
    console.log('   • "🌱 Blockchain Carbon Credits Available" section');
    console.log('   • "Buy Credits" button with MetaMask integration');
    console.log('   • Real-time credit availability and pricing');
    
    console.log('\n🔧 OR register via API (need admin JWT token):');
    console.log(`curl -X POST ${ADMIN_API_BASE}/blockchain/projects/register \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -H "Authorization: Bearer YOUR_ADMIN_JWT" \\`);
    console.log(`  -d '{`);
    console.log(`    "totalCredits": 1000,`);
    console.log(`    "pricePerCreditWei": "10000000000000000",`);
    console.log(`    "metadataURI": "ipfs://project-metadata-hash"`);
    console.log(`  }'`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

registerProjectOnBlockchain();