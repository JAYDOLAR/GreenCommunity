import { create } from 'kubo-rpc-client';
import fs from 'fs';
import path from 'path';
import { pinJSON, pinFile, ipfsServiceHealth } from './ipfs.service.js';

// ---------------------------------------------------------------------------
// Unified IPFS service — production-ready
//
// Priority order for every operation:
//   1. Pinata cloud API   (if PINATA_JWT env var is set — production mode)
//   2. Local IPFS daemon  (if running at IPFS_API_URL — local dev)
//   3. Pseudo-CID offline (last resort — no keys, no daemon, dev only)
//
// In production (Azure App Service) you only need the PINATA_JWT secret.
// Locally, if you run `ipfs daemon` you get real local CIDs; otherwise
// set PINATA_JWT in .env for the same production behaviour.
// ---------------------------------------------------------------------------

let ipfs;
let daemonChecked = false;
let daemonAvailable = false;

async function ensureLocalDaemon() {
  // If Pinata is configured, skip the local daemon entirely
  if (process.env.PINATA_JWT) return null;

  if (daemonChecked) return daemonAvailable ? ipfs : null;

  const url = process.env.IPFS_API_URL || 'http://127.0.0.1:5001/api/v0';
  try {
    const client = create({ url, timeout: 3000 });
    await client.version();
    ipfs = client;
    daemonAvailable = true;
  } catch {
    daemonAvailable = false;
    ipfs = null;
  }
  daemonChecked = true;
  return ipfs;
}

// Probe once at startup (non-blocking)
ensureLocalDaemon().catch(() => {});

export function getIpfs() {
  if (!ipfs) throw new Error('IPFS client not available');
  return ipfs;
}

// ---- Public helpers -------------------------------------------------------

/**
 * Pin JSON data to IPFS.
 * Production → Pinata | Dev → local daemon | Fallback → pseudo-CID
 */
export async function addJSON(data) {
  // 1. Pinata (production)
  if (process.env.PINATA_JWT) {
    return pinJSON(data);
  }

  // 2. Local daemon (dev)
  const client = await ensureLocalDaemon();
  if (client) {
    const { cid } = await client.add({ content: JSON.stringify(data) });
    return { cid: cid.toString(), uri: `ipfs://${cid.toString()}` };
  }

  // 3. Pseudo-CID (offline dev)
  console.warn('[IPFS] No Pinata key and no local daemon — using offline pseudo-CID');
  return pinJSON(data);
}

/**
 * Pin a file buffer to IPFS.
 * Production → Pinata | Dev → local daemon | Fallback → pseudo-CID
 */
export async function addFileFromBuffer(buffer, filename) {
  // 1. Pinata (production)
  if (process.env.PINATA_JWT) {
    return pinFile(buffer, filename);
  }

  // 2. Local daemon (dev)
  const client = await ensureLocalDaemon();
  if (client) {
    const { cid } = await client.add({ path: filename, content: buffer });
    return { cid: cid.toString(), uri: `ipfs://${cid.toString()}` };
  }

  // 3. Pseudo-CID (offline dev)
  console.warn('[IPFS] No Pinata key and no local daemon — using offline pseudo-CID for file:', filename);
  return pinFile(buffer, filename);
}

/**
 * Pin a file from disk path.
 */
export async function addFileFromPath(filePath) {
  const buffer = await fs.promises.readFile(filePath);
  return addFileFromBuffer(buffer, path.basename(filePath));
}

/**
 * Health check — reports which IPFS mode is active.
 */
export async function ipfsHealth() {
  // Check Pinata first
  const pinataHealth = await ipfsServiceHealth();
  if (pinataHealth.status === 'online') {
    return { status: 'online', mode: 'pinata', ...pinataHealth };
  }

  // Check local daemon
  const client = await ensureLocalDaemon();
  if (client) {
    const [version, id] = await Promise.all([client.version(), client.id()]);
    return { status: 'online', mode: 'local-daemon', version: version.version, id: id.id };
  }

  // Offline
  return {
    status: 'degraded',
    mode: 'pseudo-cid',
    message: 'No Pinata key and no local IPFS daemon — using offline pseudo-CIDs (not production-ready)',
  };
}
