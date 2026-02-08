import { getMarketplace, getCertificate } from './blockchain.service.js';
import { getProjectModel } from '../models/Project.model.js';
import { getCertificateModel } from '../models/Certificate.model.js';
import { getSyncStateModel } from '../models/SyncState.model.js';
import { getProvider, getProjectOnChain } from './blockchain.service.js';

// Alchemy free tier caps eth_getLogs at 10-block range.
// Use env var to override for paid plans (e.g. SYNC_BATCH_SIZE=2000).
const BATCH_SIZE = parseInt(process.env.SYNC_BATCH_SIZE, 10) || 10;
const STATE_KEY = 'marketplace_sync';

// Retry config for Alchemy 429 / transient errors
const MAX_RETRIES = parseInt(process.env.SYNC_MAX_RETRIES, 10) || 5;
const BASE_DELAY_MS = parseInt(process.env.SYNC_BASE_DELAY_MS, 10) || 1200;
// Inter-batch delay to stay below Alchemy CU/s limit (default 350 ms)
const BATCH_DELAY_MS = parseInt(process.env.SYNC_BATCH_DELAY_MS, 10) || 350;

/**
 * Sleep helper
 */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Wrapper around provider.getLogs with exponential back-off on 429 / rate-limit errors.
 */
async function getLogsWithRetry(provider, filter) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await provider.getLogs(filter);
    } catch (err) {
      const is429 = err?.error?.code === 429
        || err?.code === 429
        || String(err?.message ?? '').includes('429')
        || String(err?.message ?? '').includes('exceeded')
        || String(err?.message ?? '').includes('compute units');
      if (is429 && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 200;
        console.warn(`[blockchain.sync] 429 rate-limited (attempt ${attempt}/${MAX_RETRIES}), retrying in ${Math.round(delay)} ms …`);
        await sleep(delay);
        continue;
      }
      throw err; // non-retryable or exhausted retries
    }
  }
}

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
      // Purchase events — with retry on 429
      const purchaseLogs = await getLogsWithRetry(provider, { fromBlock: from, toBlock: to, address: marketplace.target });
      for (const log of purchaseLogs) {
        try {
          const parsed = marketplace.interface.parseLog(log);
          if (['CreditsPurchased','FiatCreditsGranted'].includes(parsed.name)) {
            await processPurchase(parsed, log.transactionHash);
          }
        } catch { /* ignore unrelated */ }
      }
      // Certificate events — with retry on 429
      const certLogs = await getLogsWithRetry(provider, { fromBlock: from, toBlock: to, address: certificate.target });
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

      // Throttle between batches to avoid hitting Alchemy CU/s cap
      if (from < toTarget) await sleep(BATCH_DELAY_MS);
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
