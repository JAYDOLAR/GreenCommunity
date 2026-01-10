import { getUserModel } from '../models/User.model.js';
import { getProjectModel } from '../models/Project.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getProjectOnChain, getCertificate, getProvider, grantFiatCredits } from '../services/blockchain.service.js';
import { buildAndPinCertificateMetadata } from '../services/certificateMetadata.service.js';
import { getFiatReceiptModel } from '../models/FiatReceipt.model.js';
import { getProjectModel as getProjectModelDup } from '../models/Project.model.js'; // duplicate import safeguard (legacy)
import { ethers } from 'ethers';
import crypto from 'crypto';

function cryptoRandomHex(bytes){
  return crypto.randomBytes(bytes).toString('hex');
}

// Issue a challenge (nonce + message) that user must sign to link wallet
export const walletChallenge = asyncHandler(async (req, res) => {
  const User = await getUserModel();
  const user = await User.findById(req.user._id);
  const nonce = cryptoRandomHex(16);
  const message = `Link wallet for GreenCommunity\nNonce: ${nonce}`;
  user.walletChallenge = { nonce, message, createdAt: new Date() };
  await user.save();
  res.json({ success: true, nonce, message });
});

// Link a wallet address using signed challenge
export const linkWallet = asyncHandler(async (req, res) => {
  const { address, signature, nonce, chain } = req.body;
  if (!address || !signature || !nonce) return res.status(400).json({ success:false, message:'address, signature, nonce required' });
  const User = await getUserModel();
  const user = await User.findById(req.user._id);
  if(!user.walletChallenge || user.walletChallenge.nonce !== nonce) {
    return res.status(400).json({ success:false, message:'Invalid nonce' });
  }
  // Expire after 10 minutes
  if(new Date() - new Date(user.walletChallenge.createdAt) > 10*60*1000) {
    return res.status(400).json({ success:false, message:'Challenge expired' });
  }
  const recovered = ethers.verifyMessage(user.walletChallenge.message, signature);
  if(recovered.toLowerCase() !== address.toLowerCase()) {
    return res.status(400).json({ success:false, message:'Signature does not match address' });
  }
  user.wallet = { address: address.toLowerCase(), chain, linkedAt: new Date() };
  user.walletChallenge = undefined; // clear challenge
  await user.save();
  res.json({ success:true, wallet: user.wallet });
});

// Record a crypto purchase (client already sent tx, we store tx hash & sync on-chain soldCredits)
export const recordCryptoPurchase = asyncHandler(async (req, res) => {
  const { projectMongoId } = req.params;
  const { txHash } = req.body;
  if (!txHash) return res.status(400).json({ success: false, message: 'txHash required' });
  const Project = await getProjectModel();
  const project = await Project.findById(projectMongoId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  if (!project.blockchain?.projectId) return res.status(400).json({ success: false, message: 'Project not on chain' });

  // Verify transaction basic properties
  try {
    const provider = getProvider();
    const tx = await provider.getTransaction(txHash);
    if (!tx) return res.status(400).json({ success:false, message:'Transaction not found' });
    if (tx.to?.toLowerCase() !== (process.env.MARKETPLACE_CONTRACT_ADDRESS||'').toLowerCase()) {
      return res.status(400).json({ success:false, message:'Transaction not sent to marketplace contract' });
    }
    if (tx.from?.toLowerCase() !== req.user.wallet?.address?.toLowerCase()) {
      return res.status(400).json({ success:false, message:'Transaction sender does not match linked wallet' });
    }
    // Wait minimal confirmations (optional)
    const receipt = await tx.wait(1);
    if (receipt.status !== 1) return res.status(400).json({ success:false, message:'Transaction failed on-chain' });
    // Sync on-chain state
    const onChain = await getProjectOnChain(project.blockchain.projectId);
    project.blockchain.soldCredits = Number(onChain.soldCredits);
    project.blockchain.lastSyncAt = new Date();
    await project.save();
  } catch (e) {
    return res.status(400).json({ success:false, message:'Validation error', error: e.message });
  }
  // For now store tx hash in an array (create if missing)
  if (!project.blockchain.transactions) project.blockchain.transactions = [];
  project.blockchain.transactions.push({ txHash, user: req.user._id, at: new Date() });
  await project.save();
  res.json({ success: true, txHash, soldCredits: project.blockchain.soldCredits });
});

// Admin: sync a single project from chain
export const syncProject = asyncHandler(async (req, res) => {
  const { projectMongoId } = req.params;
  const Project = await getProjectModel();
  const project = await Project.findById(projectMongoId);
  if (!project) return res.status(404).json({ success:false, message:'Project not found' });
  if (!project.blockchain?.projectId) return res.status(400).json({ success:false, message:'Project not on chain' });
  const onChain = await getProjectOnChain(project.blockchain.projectId);
  project.blockchain.soldCredits = Number(onChain.soldCredits);
  project.blockchain.totalCredits = Number(onChain.totalCredits);
  project.blockchain.lastSyncAt = new Date();
  await project.save();
  res.json({ success:true, blockchain: project.blockchain });
});

// Fetch certificate metadata (tokenURI) for a given tokenId
export const getCertificateMetadata = asyncHandler(async (req, res) => {
  const { tokenId } = req.params;
  const cert = getCertificate();
  try {
    const uri = await cert.tokenURI(tokenId);
    // If URI is ipfs:// convert to a public gateway (basic convenience)
    const httpUri = uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://ipfs.io/ipfs/') : uri;
    res.json({ success:true, tokenId, uri: httpUri });
  } catch (e) {
    res.status(404).json({ success:false, message:'Certificate not found', error: e.message });
  }
});

// List certificates owned by current user (naive: iterate token IDs up to optional max)
export const listMyCertificates = asyncHandler(async (req, res) => {
  const owner = req.user.wallet?.address?.toLowerCase();
  if(!owner) return res.status(400).json({ success:false, message:'No linked wallet' });
  // Prefer DB model
  try {
    const { getCertificateModel } = await import('../models/Certificate.model.js');
    const Certificate = await getCertificateModel();
    const certs = await Certificate.find({ owner }).sort({ tokenId: 1 }).lean();
    return res.json({ success:true, certificates: certs });
  } catch (e) {
    // fallback to chain (original logic trimmed)
    const cert = getCertificate();
    const tokens = [];
    for (let id=1; id<=50; id++) {
      try { const tokenOwner = await cert.ownerOf(id); if (tokenOwner.toLowerCase()===owner) tokens.push({ tokenId:id }); } catch { break; }
    }
    return res.json({ success:true, certificates: tokens, fallback:true });
  }
});

// Prepare (pin) certificate metadata prior to on-chain call
export const prepareCertificateMetadata = asyncHandler( async (req, res) => {
  const { projectMongoId, amount, reason, retirePortion } = req.body;
  if (!projectMongoId || !amount) return res.status(400).json({ success:false, message:'projectMongoId and amount required' });
  const result = await buildAndPinCertificateMetadata({ projectMongoId, amount, reason: reason || 'purchase', retirePortion: !!retirePortion });
  res.json({ success:true, ...result });
});

// Admin (or payment webhook) fiat grant endpoint with idempotency
export const grantFiatOffset = asyncHandler( async (req, res) => {
  const { projectMongoId } = req.params;
  const { walletAddress, amount, receiptId, retireImmediately, reason } = req.body;
  if (!walletAddress || !amount || !receiptId) return res.status(400).json({ success:false, message:'walletAddress, amount, receiptId required' });
  const FiatReceipt = await getFiatReceiptModel();
  const existing = await FiatReceipt.findOne({ receiptId });
  if (existing) return res.json({ success:true, idempotent:true, receipt: existing });
  const Project = await getProjectModel();
  const project = await Project.findById(projectMongoId);
  if (!project) return res.status(404).json({ success:false, message:'Project not found' });
  if (!project.blockchain?.projectId) return res.status(400).json({ success:false, message:'Project not on chain' });
  // Build certificate metadata if retiring immediately
  let certificateURI = '';
  if (retireImmediately) {
    try { const meta = await buildAndPinCertificateMetadata({ projectMongoId, amount, reason: reason||'fiat-purchase', retirePortion:false }); certificateURI = meta.certificateURI; } catch {}
  }
  const receiptDoc = new FiatReceipt({ receiptId, projectId: project.blockchain.projectId, projectMongoId: project._id, walletAddress: walletAddress.toLowerCase(), amount, retireImmediately });
  await receiptDoc.save();
  try {
    const txReceipt = await grantFiatCredits({ projectId: project.blockchain.projectId, buyerAddress: walletAddress, amount, receiptId, retireImmediately: !!retireImmediately, certificateURI });
    receiptDoc.txHash = txReceipt.hash; receiptDoc.status='onchain'; await receiptDoc.save();
    return res.json({ success:true, receipt: receiptDoc });
  } catch (e) {
    receiptDoc.status='error'; receiptDoc.error = e.message; await receiptDoc.save();
    return res.status(500).json({ success:false, message:'On-chain fiat grant failed', error:e.message, receipt: receiptDoc });
  }
});


