import { getMarketplace, getCertificate } from './blockchain.service.js';
import { getProjectModel } from '../models/Project.model.js';
import { getCertificateModel } from '../models/Certificate.model.js';
import { getSyncStateModel } from '../models/SyncState.model.js';
import { getProvider, getProjectOnChain } from './blockchain.service.js';

// Alchemy free tier caps eth_getLogs at 10-block range.
// Use env var to override for paid plans (e.g. SYNC_BATCH_SIZE=2000).
const BATCH_SIZE = parseInt(process.env.SYNC_BATCH_SIZE, 10) || 10;
const STATE_KEY = 'marketplace_sync';

export async function syncHistoricalEvents() {
  try {
    const provider = getProvider();
    const marketplace = getMarketplace();
    const certificate = getCertificate();
    const SyncState = await getSyncStateModel();
    const state = await SyncState.findOne({ key: STATE_KEY }) || new SyncState({ key: STATE_KEY, lastBlock: 0 });
    const latest = await provider.getBlockNumber();
    let from = state.lastBlock || (latest - 5000 > 0 ? latest - 5000 : 0); // initial window
    const toTarget = latest;

    console.log(`[blockchain.sync] Syncing blocks ${from} -> ${toTarget} (batch=${BATCH_SIZE})`);

    while (from < toTarget) {
      const to = Math.min(from + BATCH_SIZE - 1, toTarget); // -1: inclusive range
      // Purchase events
      const purchaseLogs = await provider.getLogs({ fromBlock: from, toBlock: to, address: marketplace.target });
      for (const log of purchaseLogs) {
        try {
          const parsed = marketplace.interface.parseLog(log);
          if (['CreditsPurchased','FiatCreditsGranted'].includes(parsed.name)) {
            await processPurchase(parsed, log.transactionHash);
          }
        } catch { /* ignore unrelated */ }
      }
      // Certificate events
      const certLogs = await provider.getLogs({ fromBlock: from, toBlock: to, address: certificate.target });
      const Certificate = await getCertificateModel();
      for (const log of certLogs) {
        try {
          const ev = certificate.interface.parseLog(log);
          if (ev.name === 'CertificateMinted') {
            const { tokenId, to: owner, projectId, amount, uri } = ev.args;
            await Certificate.updateOne({ tokenId: Number(tokenId) }, { $set: { tokenId: Number(tokenId), projectId: Number(projectId), owner: owner.toLowerCase(), amount: Number(amount), uri, txHash: log.transactionHash } }, { upsert: true });
          }
        } catch {}
      }
      state.lastBlock = to;
      state.updatedAt = new Date();
      await state.save();
      from = to + 1;
    }

    console.log('[blockchain.sync] Historical sync complete.');
  } catch (e) {
    console.warn('Historical sync failed:', e.message);
  }
}

async function processPurchase(parsed, txHash) {
  const { projectId } = parsed.args;
  const Project = await getProjectModel();
  const project = await Project.findOne({ 'blockchain.projectId': Number(projectId) });
  if (!project) return;
  try {
    const onChain = await getProjectOnChain(Number(projectId));
    project.blockchain.soldCredits = Number(onChain.soldCredits);
    project.blockchain.lastSyncAt = new Date();
  } catch {}
  project.blockchain.transactions = project.blockchain.transactions || [];
  if (!project.blockchain.transactions.find(t => t.txHash === txHash)) {
    project.blockchain.transactions.push({ txHash, user: undefined, at: new Date() });
  }
  await project.save();
}
