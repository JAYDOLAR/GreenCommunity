import { create } from 'kubo-rpc-client';
import fs from 'fs';
import path from 'path';
import { pinJSON } from './ipfs.service.js';

// ---------------------------------------------------------------------------
// IPFS client – works in three modes:
//   1. Local daemon running  → real CIDs via ipfs-http-client
//   2. External IPFS gateway → real CIDs via IPFS_API_URL env var
//   3. No daemon available   → deterministic pseudo-CIDs (sha256-based)
//
// Mode 3 is the automatic fallback so production (Azure App Service) works
// without requiring a separate IPFS daemon process.
// ---------------------------------------------------------------------------

let ipfs;
let ipfsDaemonAvailable = false;

async function ensureIpfs() {
  if (ipfsDaemonAvailable && ipfs) return ipfs;

  const url = process.env.IPFS_API_URL || 'http://127.0.0.1:5001/api/v0';
  try {
    const client = create({ url, timeout: 3000 });
    // Quick health-check — if the daemon isn't there this will throw
    await client.version();
    ipfs = client;
    ipfsDaemonAvailable = true;
    return ipfs;
  } catch {
    ipfsDaemonAvailable = false;
    ipfs = null;
    return null;
  }
}

// Try once on startup (non-blocking)
ensureIpfs().catch(() => {});

export function getIpfs() {
  if (!ipfs) throw new Error('IPFS client not available');
  return ipfs;
}

// ---- Public helpers -------------------------------------------------------

export async function addJSON(data) {
  const client = await ensureIpfs();
  if (client) {
    const { cid } = await client.add({ content: JSON.stringify(data) });
    return { cid: cid.toString(), uri: `ipfs://${cid.toString()}` };
  }
  // Fallback – pseudo-CID
  console.warn('[IPFS] Daemon unavailable, using pseudo-CID fallback for JSON');
  const result = await pinJSON(data);
  return { cid: result.cid, uri: result.uri };
}

export async function addFileFromBuffer(buffer, filename) {
  const client = await ensureIpfs();
  if (client) {
    const { cid } = await client.add({ path: filename, content: buffer });
    return { cid: cid.toString(), uri: `ipfs://${cid.toString()}` };
  }
  // Fallback – hash the file buffer to get a deterministic pseudo-CID
  console.warn('[IPFS] Daemon unavailable, using pseudo-CID fallback for file:', filename);
  const result = await pinJSON({
    name: filename,
    size: buffer.length,
    sha256: (await import('crypto')).createHash('sha256').update(buffer).digest('hex'),
    uploadedAt: new Date().toISOString()
  });
  return { cid: result.cid, uri: result.uri };
}

export async function addFileFromPath(filePath) {
  const buffer = await fs.promises.readFile(filePath);
  return addFileFromBuffer(buffer, path.basename(filePath));
}

export async function ipfsHealth() {
  const client = await ensureIpfs();
  if (!client) {
    return { status: 'offline', mode: 'pseudo-cid-fallback', message: 'No IPFS daemon — using SHA-256 pseudo-CIDs' };
  }
  const [version, id] = await Promise.all([client.version(), client.id()]);
  return { status: 'online', version: version.version, commit: version.commit, id: id.id };
}
