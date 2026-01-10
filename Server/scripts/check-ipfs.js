// Simple IPFS readiness check
import { ipfsHealth } from '../services/localIpfs.service.js';

try {
  const info = await ipfsHealth();
  console.log('IPFS OK', info);
  process.exit(0);
} catch (e) {
  console.error('IPFS NOT READY:', e.message);
  process.exit(1);
}