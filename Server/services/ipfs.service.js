import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Production-ready IPFS pinning service
//
// Priority:
//   1. Pinata  (PINATA_JWT set)         → real CIDs, globally accessible
//   2. Offline (no keys, no daemon)     → deterministic pseudo-CIDs (dev only)
//
// Every public function returns { cid, uri } at minimum.
// ---------------------------------------------------------------------------

const PINATA_BASE = 'https://api.pinata.cloud';
const PINATA_JWT  = () => process.env.PINATA_JWT || '';
const PINATA_GATEWAY = () => process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

function hasPinata() {
  return !!PINATA_JWT();
}

// ---- Pinata helpers -------------------------------------------------------

async function pinataRequest(endpoint, options = {}) {
  const url = `${PINATA_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${PINATA_JWT()}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Pinata ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

// ---- Public API -----------------------------------------------------------

/**
 * Pin a JSON object to IPFS.
 * Returns { uri, cid, size, raw, gateway }
 */
export async function pinJSON(metadata, options = {}) {
  const json = JSON.stringify(metadata);

  if (hasPinata()) {
    const body = {
      pinataContent: metadata,
      pinataMetadata: {
        name: options.name || `green-community-${Date.now()}`,
      },
    };
    if (options.groupId) {
      body.pinataOptions = { groupId: options.groupId };
    }
    const result = await pinataRequest('/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const cid = result.IpfsHash;
    return {
      uri: `ipfs://${cid}`,
      cid,
      size: result.PinSize,
      raw: json,
      gateway: `${PINATA_GATEWAY()}/${cid}`,
    };
  }

  // Offline dev fallback — deterministic pseudo-CID
  console.warn('[IPFS] No PINATA_JWT configured — using offline pseudo-CID');
  const hash = crypto.createHash('sha256').update(json).digest('hex').slice(0, 46);
  const fakeCid = 'bafy' + hash;
  return { uri: `ipfs://${fakeCid}`, cid: fakeCid, size: Buffer.byteLength(json), raw: json, gateway: null };
}

/**
 * Pin a file (Buffer) to IPFS.
 * Returns { uri, cid, size, gateway }
 */
export async function pinFile(buffer, filename, options = {}) {
  if (hasPinata()) {
    const { Blob } = await import('node:buffer');

    const form = new FormData();
    const blob = new Blob([buffer], { type: options.mimeType || 'application/octet-stream' });
    form.append('file', blob, filename);

    const pinataMetadata = JSON.stringify({
      name: options.name || filename,
    });
    form.append('pinataMetadata', pinataMetadata);

    if (options.groupId) {
      form.append('pinataOptions', JSON.stringify({ groupId: options.groupId }));
    }

    const result = await pinataRequest('/pinning/pinFileToIPFS', {
      method: 'POST',
      body: form,
      // Let fetch set Content-Type with boundary automatically
    });

    const cid = result.IpfsHash;
    return {
      uri: `ipfs://${cid}`,
      cid,
      size: result.PinSize,
      gateway: `${PINATA_GATEWAY()}/${cid}`,
    };
  }

  // Offline dev fallback
  console.warn('[IPFS] No PINATA_JWT configured — using offline pseudo-CID for file:', filename);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 46);
  const fakeCid = 'bafy' + hash;
  return { uri: `ipfs://${fakeCid}`, cid: fakeCid, size: buffer.length, gateway: null };
}

/**
 * Unpin content from Pinata (cleanup).
 */
export async function unpin(cid) {
  if (!hasPinata()) return;
  await pinataRequest(`/pinning/unpin/${cid}`, { method: 'DELETE' });
}

/**
 * Check IPFS service health and mode.
 */
export async function ipfsServiceHealth() {
  if (hasPinata()) {
    try {
      const result = await pinataRequest('/data/testAuthentication');
      return { status: 'online', provider: 'pinata', message: result.message || 'Authenticated' };
    } catch (e) {
      return { status: 'error', provider: 'pinata', message: e.message };
    }
  }
  return { status: 'offline', provider: 'none', message: 'No PINATA_JWT — using pseudo-CIDs (dev only)' };
}
