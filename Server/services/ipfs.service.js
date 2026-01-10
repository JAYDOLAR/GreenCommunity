import crypto from 'crypto';

/**
 * Minimal IPFS pinning abstraction. In offline / dev mode (no API keys),
 * returns a deterministic fake CID derived from sha256(json).
 * If real pinning service keys are present, you can extend to perform fetch() calls.
 */
export async function pinJSON(metadata) {
  const json = JSON.stringify(metadata);
  // Future: integrate real pinning (Pinata/web3.storage)
  // For now generate pseudo CID
  const hash = crypto.createHash('sha256').update(json).digest('hex').slice(0, 46); // shorten
  const fakeCid = 'bafy' + hash; // not real CID but stable
  return { uri: `ipfs://${fakeCid}`, cid: fakeCid, size: Buffer.byteLength(json), raw: json };
}
