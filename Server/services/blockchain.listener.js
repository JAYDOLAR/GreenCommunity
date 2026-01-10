import { getMarketplace, getCertificate, getProjectOnChain } from './blockchain.service.js';
import { getProjectModel } from '../models/Project.model.js';
import { getCertificateModel } from '../models/Certificate.model.js';
import { getProvider } from './blockchain.service.js';
import { getUserModel } from '../models/User.model.js';

let started = false;

export function startBlockchainListeners() {
  if (started) return;
  try {
    const marketplace = getMarketplace();
    const certificate = getCertificate();

    // Credits purchased (crypto) - use contract.on() directly in ethers v6
    marketplace.on('CreditsPurchased', async (projectId, buyer, amount, valuePaid, event) => {
      await handlePurchaseEvent(marketplace, { projectId, buyer, amount, valuePaid, event }, 'crypto');
    });
    
    // Fiat credits granted
    marketplace.on('FiatCreditsGranted', async (projectId, buyer, amount, receiptId, event) => {
      await handlePurchaseEvent(marketplace, { projectId, buyer, amount, receiptId, event }, 'fiat');
    });
    
    // Certificate minted
    certificate.on('CertificateMinted', async (tokenId, to, projectId, amount, uri, event) => {
      try {
        const Certificate = await getCertificateModel();
        await Certificate.updateOne(
          { tokenId: Number(tokenId) },
          { $set: { tokenId: Number(tokenId), projectId: Number(projectId), owner: to.toLowerCase(), amount: Number(amount), uri, txHash: event.log.transactionHash } },
          { upsert: true }
        );
      } catch (e) {
        console.warn('[listener] CertificateMinted parse/store failed:', e.message);
      }
    });
    started = true;
    console.log('✅ Blockchain listeners started');
  } catch (e) {
    console.warn('⚠️ Skipping blockchain listeners (probably missing env vars or artifacts):', e.message);
  }
}

async function handlePurchaseEvent(marketplace, eventData, source) {
  try {
    const { projectId, buyer, amount, event } = eventData;
    const Project = await getProjectModel();
    const project = await Project.findOne({ 'blockchain.projectId': Number(projectId) });
    if (!project) return; // unknown project
    // Refresh soldCredits from chain for authoritative state
    try {
      const onChain = await getProjectOnChain(Number(projectId));
      project.blockchain.soldCredits = Number(onChain.soldCredits);
      project.blockchain.lastSyncAt = new Date();
    } catch {}
    project.blockchain.transactions = project.blockchain.transactions || [];
    // resolve user by wallet
    try {
      const User = await getUserModel();
      const u = await User.findOne({ 'wallet.address': buyer.toLowerCase() });
      project.blockchain.transactions.push({ txHash: event.log.transactionHash, user: u?._id, at: new Date() });
    } catch {
      project.blockchain.transactions.push({ txHash: event.log.transactionHash, user: undefined, at: new Date() });
    }
    await project.save();
  } catch (e) {
    console.warn('[listener] Purchase event parse failed:', e.message);
  }
}
