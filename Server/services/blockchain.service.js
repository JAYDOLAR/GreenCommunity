import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getMarketplaceSigner } from './key.service.js';
dotenv.config();

// Simple singleton provider & contract cache
let provider;
let marketplaceContract;
let certificateContract;

// Load artifact helper
function loadArtifact(name) {
  // First try bundled ABIs in Server/abis/ (used in production deployment)
  const bundledPath = path.join(process.cwd(), 'abis', `${name}.json`);
  if (fs.existsSync(bundledPath)) {
    return JSON.parse(fs.readFileSync(bundledPath, 'utf-8'));
  }
  // Fallback: load from blockchain artifacts (local development)
  const artifactPath = path.join(process.cwd(), '..', 'blockchain', 'artifacts', 'contracts', `${name}.sol`, `${name}.json`);
  if (!fs.existsSync(artifactPath)) throw new Error(`Artifact not found. Checked: ${bundledPath} and ${artifactPath}`);
  return JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
}

export function getProvider() {
  if (!provider) {
    const rpc = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
    provider = new ethers.JsonRpcProvider(rpc);
  }
  return provider;
}

function getWallet() {
  return getMarketplaceSigner(getProvider());
}

export function getMarketplace(addressOverride) {
  if (addressOverride) marketplaceContract = undefined; // force refresh
  if (!marketplaceContract) {
    const address = addressOverride || process.env.MARKETPLACE_CONTRACT_ADDRESS;
    if (!address) throw new Error('Missing MARKETPLACE_CONTRACT_ADDRESS');
    const artifact = loadArtifact('CarbonCreditMarketplace');
    marketplaceContract = new ethers.Contract(address, artifact.abi, getWallet());
  }
  return marketplaceContract;
}

export function getCertificate(addressOverride) {
  if (addressOverride) certificateContract = undefined;
  if (!certificateContract) {
    const address = addressOverride || process.env.CERTIFICATE_CONTRACT_ADDRESS;
    if (!address) throw new Error('Missing CERTIFICATE_CONTRACT_ADDRESS');
    const artifact = loadArtifact('CertificateNFT');
    certificateContract = new ethers.Contract(address, artifact.abi, getWallet());
  }
  return certificateContract;
}

export async function registerProjectOnChain({ projectId = 0, totalCredits, pricePerCreditWei, metadataURI }) {
  const marketplace = getMarketplace();
  const tx = await marketplace.registerProject(projectId, totalCredits, pricePerCreditWei, metadataURI);
  const pendingHash = tx.hash;
  const receipt = await tx.wait();
  // Read event to capture final projectId
  const ev = receipt.logs.map(l => {
    try { return marketplace.interface.parseLog(l); } catch { return null; }
  }).filter(Boolean).find(e => e.name === 'ProjectRegistered');
  const finalProjectId = ev ? Number(ev.args.projectId) : projectId; // fallback
  return { projectId: finalProjectId, txHash: receipt.hash || pendingHash };
}

export async function grantFiatCredits({ projectId, buyerAddress, amount, receiptId, retireImmediately, certificateURI }) {
  const marketplace = getMarketplace();
  const tx = await marketplace.grantFiatPurchase(projectId, buyerAddress, amount, receiptId, retireImmediately, certificateURI || '');
  return await tx.wait();
}

export async function buyWithCrypto({ projectId, amount, certificateURI, valueWei, buyerPrivateKey }) {
  const artifact = loadArtifact('CarbonCreditMarketplace');
  const address = process.env.MARKETPLACE_CONTRACT_ADDRESS;
  if (!address) throw new Error('Missing MARKETPLACE_CONTRACT_ADDRESS');
  const wallet = new ethers.Wallet(buyerPrivateKey, getProvider());
  const marketplaceUser = new ethers.Contract(address, artifact.abi, wallet);
  const tx = await marketplaceUser.buyCredits(projectId, amount, certificateURI || '', { value: valueWei });
  return await tx.wait();
}

export async function getProjectOnChain(projectId) {
  const marketplace = getMarketplace();
  return await marketplace.projects(projectId);
}

export async function setAutoRetireBps(bps) {
  const marketplace = getMarketplace();
  const tx = await marketplace.setAutoRetireBps(bps);
  return await tx.wait();
}

export async function setProjectAutoRetireBps(projectId, bps) {
  const marketplace = getMarketplace();
  const tx = await marketplace.setProjectAutoRetireBps(projectId, bps);
  return await tx.wait();
}

/**
 * Ensure the marketplace contract is correctly linked to the CertificateNFT contract
 * and that autoRetireBps is set to 10000 (100%) so every credit purchase automatically
 * mints an NFT certificate to the buyer. Called once at server startup.
 */
export async function ensureCertificateLinked() {
  try {
    const certAddress = process.env.CERTIFICATE_CONTRACT_ADDRESS;
    if (!certAddress) {
      console.warn('[blockchain] CERTIFICATE_CONTRACT_ADDRESS not set — skipping auto-mint setup');
      return;
    }
    const marketplace = getMarketplace();

    // 1. Check if the marketplace already knows about the certificate contract
    const currentCert = await marketplace.certificate();
    if (currentCert === ethers.ZeroAddress || currentCert.toLowerCase() !== certAddress.toLowerCase()) {
      console.log('[blockchain] Linking CertificateNFT to marketplace...');
      const tx = await marketplace.setCertificateContract(certAddress);
      await tx.wait();
      console.log('[blockchain] CertificateNFT linked to marketplace ✓');
    } else {
      console.log('[blockchain] CertificateNFT already linked ✓');
    }

    // 2. Ensure autoRetireBps = 10000 (100% → every purchase auto-mints NFT)
    const currentBps = await marketplace.autoRetireBps();
    if (Number(currentBps) !== 10000) {
      console.log(`[blockchain] Setting autoRetireBps to 10000 (was ${currentBps})...`);
      const tx = await marketplace.setAutoRetireBps(10000);
      await tx.wait();
      console.log('[blockchain] autoRetireBps = 10000 (100% auto-mint) ✓');
    } else {
      console.log('[blockchain] autoRetireBps already 10000 ✓');
    }
  } catch (err) {
    console.error('[blockchain] ensureCertificateLinked failed (non-fatal):', err.message);
  }
}

