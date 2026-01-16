# 🌍 Green Community — Carbon Footprint Tracker & Credit Marketplace

> **One-liner:** A platform that helps individuals track their carbon footprint, participate in sustainability challenges, and trade verified carbon credits on the blockchain.

[![SDG 13 - Climate Action](https://img.shields.io/badge/SDG%2013-Climate%20Action-green?style=flat-square)](https://sdgs.un.org/goals/goal13)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)

---

## 🎯 The Problem

**Who has this problem?** Meet Priya, a 28-year-old IT professional in Bangalore. She drives 45 minutes to work, runs AC 8 hours a day, and orders food delivery most nights. She *wants* to reduce her impact but has no idea if switching to an EV matters more than eating less meat. Or consider Arjun, a college student in Pune who joined his campus sustainability club—they want to run a carbon challenge but have no way to track if members actually reduced emissions.

**How do they cope today?** Most people have no idea how much CO₂ their lifestyle generates. Those who care resort to fragmented solutions—manual spreadsheets, generic carbon calculators that don't localize to Indian consumption patterns (most use US/EU emission factors), or donating to opaque offset programs with no verification. Priya tried three apps; none knew that her electricity comes from Maharashtra's coal-heavy grid (0.82 kgCO₂/kWh vs. Karnataka's 0.71).

**Why it's hard to solve:** Carbon accounting is complex. IPCC emission factors vary by region, activity type, and energy source. India's Central Electricity Authority publishes grid emission factors, but no consumer app uses them. Most offset markets lack transparency—you pay ₹500 but can't verify the credits were ever retired or if the project even exists.

**Why blockchain?** Traditional carbon registries are opaque databases controlled by single entities. Blockchain provides: (1) immutable proof that credits were actually retired, (2) public verification anyone can audit, (3) NFT certificates users can show as proof of offset. No more "trust us, we planted trees."

---

## ✅ Our Solution

**GreenCommunity** provides:

1. **Personal Carbon Footprint Tracking** — Log daily activities (transport, food, energy, purchases) and get IPCC-based emission calculations localized for India
2. **Community Challenges** — Gamified sustainability goals that reward participation with points and recognition
3. **Blockchain-Verified Carbon Marketplace** — Purchase carbon credits from verified projects; all transactions recorded on-chain with NFT retirement certificates
4. **AI-Powered Sustainability Coach** — Gemini Pro integration provides personalized tips and answers environmental questions

---

## 🌱 Key Features

| Feature | Description |
|---------|-------------|
| 🧮 **Carbon Calculator** | IPCC-compliant emission calculations with India-specific factors |
| 📊 **Analytics Dashboard** | Visualize your footprint trends over time |
| 🏆 **Challenges & Events** | Community sustainability challenges with leaderboards |
| 🛒 **Carbon Credit Marketplace** | Buy verified credits from registered projects |
| ⛓️ **Blockchain Integration** | On-chain credit registry + NFT retirement certificates |
| 🤖 **AI Coach** | Gemini Pro-powered sustainability assistant |
| 👥 **Community Groups** | Connect with like-minded environmentalists |
| 🔐 **Secure Auth** | JWT + 2FA + Google OAuth |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15, React, Tailwind CSS, Radix UI, Shadcn/ui, Three.js, Recharts, Leaflet |
| **Backend** | Node.js, Express.js, MongoDB/Mongoose, JWT, Passport.js, Cloudinary |
| **Blockchain** | Solidity, Hardhat 3, Ethers.js, ERC-721 (NFT Certificates), IPFS |
| **Payments** | Razorpay (fiat/UPI), ETH/MATIC (crypto) |
| **AI** | Google Gemini Pro API |
| **DevOps** | Docker, Docker Compose |

---

## 👥 Team

| Name | Role |
|------|------|
| Jay Dolar | Full-Stack Developer |
| Bhavaya Sonigra | Full-Stack Developer |
| Nemin Haria | Full-Stack Developer |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/products/docker-desktop) (optional, for containerized setup)
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/JAYDOLAR/GreenCommunity.git
cd GreenCommunity

# Create Server/.env (see Environment Variables section below)

# Run with Docker
./deploy.sh        # Linux/macOS
.\deploy.ps1       # Windows PowerShell
```

### Option 2: Manual Setup

```bash
# Clone and install
git clone https://github.com/JAYDOLAR/GreenCommunity.git
cd GreenCommunity

# Backend
cd Server && npm install && npm run dev

# Frontend (new terminal)
cd client && npm install && npm run dev
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📁 Project Structure

```
GreenCommunity/
├── client/                 # Next.js 15 Frontend
│   ├── src/app/           # App Router pages
│   ├── src/components/    # Reusable UI components
│   └── src/context/       # React Context (auth, wallet)
├── Server/                # Express.js Backend
│   ├── controllers/       # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── services/         # Business logic (blockchain, IPFS)
│   └── lib/              # IPCC emission calculator engine
├── blockchain/           # Smart Contracts
│   ├── contracts/        # Solidity (Marketplace, NFT)
│   └── scripts/          # Deploy scripts
└── docker-compose.yml    # Container orchestration
```

---

## 🔧 Environment Variables

Create `Server/.env`:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/greencommunity

# JWT Secrets
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Email (for password reset, notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Blockchain (optional - for marketplace)
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
MARKETPLACE_CONTRACT_ADDRESS=0x...
CERTIFICATE_CONTRACT_ADDRESS=0x...
```

Create `client/.env.local`:

```env
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
```

---

## 🧪 Testing

```bash
# API Tests (Postman)
# Import: GreenCommunity-Postman-Collection-Clean.json

# Smart Contract Tests
cd blockchain && npx hardhat test

# VS Code REST Client
# Open: Server/requests.http
```

---

## ✅ What's Already Built

These features are **fully functional** right now:

| Feature | Status | Notes |
|---------|--------|-------|
| User Registration/Login | ✅ Complete | JWT + Google OAuth + 2FA |
| Carbon Footprint Calculator | ✅ Complete | IPCC-based with India-specific CEA emission factors |
| Dashboard Analytics | ✅ Complete | Recharts visualizations, trends over time |
| Community Challenges | ✅ Complete | Create, join, track progress, leaderboards |
| Marketplace UI | ✅ Complete | Browse projects, filter, view details |
| AI Coach (Gemini) | ✅ Complete | Chat interface for sustainability tips |
| Events Management | ✅ Complete | Create events, RSVP, calendar view |
| Community Groups | ✅ Complete | Create/join groups, discussions |

---

## 🔧 What We'll Build in 48 Hours (Finals)

These features are **designed and partially implemented** — finals time will complete them:

| Feature | Current State | 48-Hour Goal |
|---------|---------------|---------------|
| **Blockchain Contracts** | Solidity written, tested on Hardhat local | Deploy to Sepolia testnet, verify on Etherscan |
| **Wallet Integration** | MetaMask detection works | Full connect → sign → confirm flow |
| **On-Chain Purchases** | Backend API ready | Frontend purchase flow with transaction receipts |
| **NFT Certificates** | Contract mints correctly | Auto-mint on credit retirement, display in UI |
| **IPFS Document Storage** | Local dev node works | Project docs & certificate metadata on IPFS |
| **Fiat Payments** | Razorpay integration planned | Pay with UPI/card → credits minted to wallet |
| **Admin Panel** | Basic UI scaffolded | User management, project approval, moderation tools |
| **Admin Analytics** | Endpoints exist | Dashboard with platform-wide stats, charts |

---

## 🗺️ 48-Hour Finals Sprint Plan

**Focus Areas:** Blockchain Integration + Admin Panel

### Day 1 (Hours 0-24): Blockchain + Payments

| Hour | Task | Owner | Done When |
|------|------|-------|----------|
| 0-4 | Deploy contracts to Sepolia | Nemin | Contracts live, verified on Etherscan |
| 4-8 | MetaMask wallet connect flow | Jay | User can connect wallet, see address |
| 8-12 | Purchase flow (frontend → contract) | Jay | Click "Buy" → MetaMask popup → TX confirmed |
| 12-16 | NFT certificate auto-minting | Bhavaya | On purchase, certificate minted to buyer |
| 16-18 | IPFS integration for certificates | Bhavaya | Certificate metadata stored on IPFS |
| 18-22 | Fiat payment with Razorpay | Jay | UPI/card payment → credits minted to user wallet |
| 22-24 | Test end-to-end (crypto + fiat) | All | 3 test purchases each method completed |

### Day 2 (Hours 24-48): Admin + Polish

| Hour | Task | Owner | Done When |
|------|------|-------|-----------|
| 24-28 | Admin user management | Nemin | View users, ban/unban, role assignment |
| 28-32 | Admin project approval flow | Nemin | Approve/reject marketplace projects |
| 32-36 | Admin analytics dashboard | Bhavaya | Platform stats: users, credits sold, challenges |
| 36-40 | Beta testing with 5 users | All | Collect feedback, fix critical bugs |
| 40-44 | Bug fixes from testing | All | Top 5 issues resolved |
| 44-48 | Demo video + final polish | All | 90-second video recorded |

**Out of scope for finals:** Mobile app, multi-chain support

---

## 📈 Success Metrics

How we'd measure if GreenCommunity is actually helping:

| Metric | Baseline | Target (3 months) |
|--------|----------|-------------------|
| Users tracking footprint weekly | 0 | 500 active users |
| Avg emissions logged per user | 0 | 10+ activities/month |
| Carbon credits purchased | 0 | 100 credits retired on-chain |
| Challenge participation rate | 0 | 30% of users join 1+ challenge |
| User-reported behavior change | N/A | 50% report trying 1 suggestion |

**Current status:** We've tested with 8 users during development. 5 logged activities for a full week. 2 said they changed commute habits after seeing their transport emissions.

---

## 🤖 AI Usage Declaration

We used the following AI tools during development:

| Tool | Usage |
|------|-------|
| **GitHub Copilot** | Autocomplete, boilerplate code, utility functions |
| **ChatGPT/Claude** | Debugging WebSocket issues, architecture discussions, documentation drafts |
| **Gemini Pro** | Integrated into the product as the sustainability coach feature |

**What WE brought:** All architecture decisions, database schema design, IPCC emission factor research, blockchain contract logic, and UI/UX design were done by the team. AI suggestions were reviewed, tested, and often modified.

---

## 📄 License

ISC License

---

## 📧 Contact

For questions or support, create an issue in this repository.

---

**Built with 💚 for climate action**

*Last Updated: January 16, 2026*