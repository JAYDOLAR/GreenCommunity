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
  // Go up one directory from Server to find blockchain artifacts
  const artifactPath = path.join(process.cwd(), '..', 'blockchain', 'artifacts', 'contracts', `${name}.sol`, `${name}.json`);
  if (!fs.existsSync(artifactPath)) throw new Error(`Artifact not found: ${artifactPath}`);
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

