# Dynamic Project Registration API Documentation

This document describes the new dynamic project registration system that allows admins to create projects and register them on the blockchain through API endpoints.

## Overview

The system has been updated to:
1. Remove hardcoded "Register Project On-Chain" functionality
2. Make project registration dynamic through admin interfaces
3. Automatically register projects on blockchain when admin provides blockchain details
4. Provide separate endpoints for managing blockchain registration

## API Endpoints

### 1. Create Project with Optional Blockchain Registration

**Endpoint:** `POST /api/admin/projects`
**Authentication:** Admin required
**Description:** Creates a new project and optionally registers it on the blockchain

#### Request Body:
```json
{
  // Basic project information (required)
  "name": "Renewable Energy Project",
  "location": "California, USA",
  "type": "renewable-energy",
  "region": "North America",
  "description": "Solar panel installation project",
  
  // Optional project details
  "category": "renewable-energy",
  "startDate": "2024-01-01",
  "expectedCompletion": "2024-12-31",
  "status": "active",
  "featured": true,
  "verified": false,
  "fundingGoal": 100000,
  "currentFunding": 25000,
  "image": "https://example.com/image.jpg",
  
  // Impact metrics
  "carbonOffset": 500,
  "area": 100,
  "beneficiaries": 1000,
  
  // Location coordinates
  "latitude": 37.7749,
  "longitude": -122.4194,
  
  // Organization details
  "organizationName": "Green Energy Corp",
  "organizationContact": "contact@greenenergy.com",
  "organizationWebsite": "https://greenenergy.com",
  
  // Blockchain registration (optional)
  "registerOnBlockchain": true,
  "totalCredits": 1000,
  "pricePerCreditWei": "1000000000000000000", // 1 ETH in wei
  "metadataURI": "https://ipfs.io/ipfs/QmHash...",
  "autoRetireBps": 1000 // 10% auto-retire rate (1000 basis points)
}
```

#### Response:
```json
{
  "success": true,
  "message": "Project created and registered on blockchain successfully",
  "project": {
    "_id": "project_mongo_id",
    "name": "Renewable Energy Project",
    // ... other project fields
    "blockchain": {
      "projectId": 1,
      "totalCredits": 1000,
      "soldCredits": 0,
      "pricePerCreditWei": "1000000000000000000",
      "certificateBaseURI": "https://ipfs.io/ipfs/QmHash...",
      "contractAddress": "0x...",
      "network": "localhost",
      "lastSyncAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "blockchain": {
    "projectId": 1,
    "totalCredits": 1000,
    "pricePerCreditWei": "1000000000000000000",
    "metadataURI": "https://ipfs.io/ipfs/QmHash...",
    "autoRetireBps": 1000
  }
}
```

### 2. Register Existing Project on Blockchain

**Endpoint:** `POST /api/admin/projects/:projectId/register-blockchain`
**Authentication:** Admin required
**Description:** Registers an existing project on the blockchain

#### Request Body:
```json
{
  "totalCredits": 1000,
  "pricePerCreditWei": "1000000000000000000",
  "metadataURI": "https://ipfs.io/ipfs/QmHash...",
  "autoRetireBps": 500 // Optional, 5% auto-retire rate
}
```

#### Response:
```json
{
  "success": true,
  "message": "Project registered on blockchain successfully",
  "data": {
    "projectId": "project_mongo_id",
    "blockchainProjectId": 2,
    "totalCredits": 1000,
    "pricePerCreditWei": "1000000000000000000",
    "metadataURI": "https://ipfs.io/ipfs/QmHash...",
    "autoRetireBps": 500
  }
}
```

### 3. Get Project Blockchain Status

**Endpoint:** `GET /api/admin/projects/:projectId/blockchain-status`
**Authentication:** Admin required
**Description:** Gets blockchain registration status and data for a project

#### Response:
```json
{
  "success": true,
  "data": {
    "registered": true,
    "database": {
      "projectId": 1,
      "totalCredits": 1000,
      "soldCredits": 0,
      "pricePerCreditWei": "1000000000000000000",
      "certificateBaseURI": "https://ipfs.io/ipfs/QmHash...",
      "contractAddress": "0x...",
      "network": "localhost",
      "lastSyncAt": "2024-01-01T00:00:00.000Z"
    },
    "blockchain": {
      "id": "1",
      "totalCredits": "1000",
      "soldCredits": "0",
      "pricePerCredit": "1000000000000000000",
      "metadataURI": "https://ipfs.io/ipfs/QmHash...",
      "active": true,
      "autoRetireBps": "500"
    }
  }
}
```

## Blockchain API Endpoints

The blockchain router (`/api/blockchain`) provides direct blockchain operations:

### 1. Register Project Directly on Blockchain

**Endpoint:** `POST /api/blockchain/projects/register`
**Authentication:** Admin required

```json
{
  "totalCredits": 1000,
  "pricePerCreditWei": "1000000000000000000",
  "metadataURI": "https://ipfs.io/ipfs/QmHash...",
  "projectId": 0 // Optional, 0 for auto-increment
}
```

### 2. Get Project from Blockchain

**Endpoint:** `GET /api/blockchain/projects/:projectId`

### 3. Grant Fiat Credits

**Endpoint:** `POST /api/blockchain/projects/:projectId/grant-fiat`
**Authentication:** Admin required

```json
{
  "buyerAddress": "0x...",
  "amount": 10,
  "receiptId": "fiat_receipt_123",
  "retireImmediately": false,
  "certificateURI": "https://ipfs.io/ipfs/QmCertHash..."
}
```

### 4. Set Auto-Retire Rates

**Global:** `PUT /api/blockchain/auto-retire/global`
**Project-specific:** `PUT /api/blockchain/projects/:projectId/auto-retire`

```json
{
  "bps": 1000 // 10% in basis points
}
```

## Environment Variables Required

Make sure these environment variables are set:

```env
MARKETPLACE_CONTRACT_ADDRESS=0x...
CERTIFICATE_CONTRACT_ADDRESS=0x...
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
MARKETPLACE_SIGNER_KEY=0x...
BLOCKCHAIN_NETWORK=localhost
```

## Usage Examples

### 1. Create a Simple Project (No Blockchain)
```javascript
const response = await fetch('/api/admin/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin_token'
  },
  body: JSON.stringify({
    name: "Forest Conservation",
    location: "Amazon Rainforest",
    type: "conservation",
    region: "South America",
    description: "Protecting 1000 hectares of rainforest"
  })
});
```

### 2. Create Project with Immediate Blockchain Registration
```javascript
const response = await fetch('/api/admin/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin_token'
  },
  body: JSON.stringify({
    name: "Solar Farm Project",
    location: "Nevada, USA",
    type: "renewable-energy",
    region: "North America",
    registerOnBlockchain: true,
    totalCredits: 5000,
    pricePerCreditWei: "500000000000000000", // 0.5 ETH
    metadataURI: "https://ipfs.io/ipfs/QmSolarProject...",
    autoRetireBps: 2000 // 20% auto-retire
  })
});
```

### 3. Register Existing Project on Blockchain Later
```javascript
// First, get the project ID from the database
const projectId = "65a1b2c3d4e5f6789";

const response = await fetch(`/api/admin/projects/${projectId}/register-blockchain`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin_token'
  },
  body: JSON.stringify({
    totalCredits: 2000,
    pricePerCreditWei: "750000000000000000", // 0.75 ETH
    metadataURI: "https://ipfs.io/ipfs/QmExistingProject...",
    autoRetireBps: 1500 // 15% auto-retire
  })
});
```

## Notes

1. **Automatic Verification**: Projects registered on blockchain are automatically marked as verified
2. **Error Handling**: If blockchain registration fails during project creation, the project is still created in the database with a warning
3. **Metadata URI**: Should point to a JSON metadata file following the standard format for carbon credit projects
4. **Price Format**: Prices should be provided in wei (smallest unit of ETH)
5. **Auto-Retire**: Basis points format (10000 = 100%, 1000 = 10%, etc.)

## Frontend Integration

For the admin dashboard, you can now:

1. Add blockchain fields to the project creation form
2. Show blockchain status for existing projects
3. Provide a "Register on Blockchain" button for non-blockchain projects
4. Display current blockchain data vs database data for verification
