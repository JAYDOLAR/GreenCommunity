import { create } from 'ipfs-http-client';
import fs from 'fs';
import path from 'path';

// Initialize a local IPFS client (assumes local IPFS daemon at 127.0.0.1:5001)
let ipfs;
try {
  ipfs = create({ url: process.env.IPFS_API_URL || 'http://127.0.0.1:5001/api/v0' });
} catch (e) {
  console.error('Failed to init IPFS client', e.message);
}

export function getIpfs() {
  if (!ipfs) throw new Error('IPFS client not available');
  return ipfs;
}

export async function addJSON(data) {
  if (!ipfs) throw new Error('IPFS client not available');
  const { cid } = await ipfs.add({ content: JSON.stringify(data) });
  return { cid: cid.toString(), uri: `ipfs://${cid.toString()}` };
}

export async function addFileFromBuffer(buffer, filename) {
  if (!ipfs) throw new Error('IPFS client not available');
  const { cid } = await ipfs.add({ path: filename, content: buffer });
  return { cid: cid.toString(), uri: `ipfs://${cid.toString()}` };
}

export async function addFileFromPath(filePath) {
  const buffer = await fs.promises.readFile(filePath);
  return addFileFromBuffer(buffer, path.basename(filePath));
}

export async function ipfsHealth() {
  const client = getIpfs();
  const [version, id] = await Promise.all([client.version(), client.id()]);
  return { version: version.version, commit: version.commit, id: id.id };
}
