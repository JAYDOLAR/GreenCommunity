import crypto from 'crypto';
import { ethers } from 'ethers';

/**
 * Key management abstraction.
 * Supports:
 * 1. Plaintext key via MARKETPLACE_SIGNER_KEY.
 * 2. Encrypted key (AES-256-GCM JSON) via MARKETPLACE_SIGNER_KEY_ENC + MARKETPLACE_SIGNER_KEY_PASSPHRASE.
 * 3. External command (KMS / vault) via MARKETPLACE_SIGNER_KEY_CMD (sync shell command returning hex private key).
 * (External command not executed here for safety in restricted environment; placeholder provided.)
 */
let cachedWallet;

function decryptKeyGCM(encJson, passphrase) {
  try {
    const obj = JSON.parse(encJson);
    const key = crypto.createHash('sha256').update(passphrase).digest();
    const iv = Buffer.from(obj.iv, 'hex');
    const tag = Buffer.from(obj.tag, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(obj.data, 'hex')), decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    throw new Error('Failed to decrypt encrypted signer key: ' + e.message);
  }
}

export function getMarketplaceSigner(provider) {
  if (cachedWallet) return cachedWallet;
  let pk = process.env.MARKETPLACE_SIGNER_KEY;
  if (!pk && process.env.MARKETPLACE_SIGNER_KEY_ENC && process.env.MARKETPLACE_SIGNER_KEY_PASSPHRASE) {
    pk = decryptKeyGCM(process.env.MARKETPLACE_SIGNER_KEY_ENC, process.env.MARKETPLACE_SIGNER_KEY_PASSPHRASE);
  }
  // Placeholder for external KMS / vault command integration
  if (!pk && process.env.MARKETPLACE_SIGNER_KEY_CMD) {
    throw new Error('MARKETPLACE_SIGNER_KEY_CMD specified but external command execution disabled in this environment.');
  }
  if (!pk) throw new Error('No marketplace signer key configured');
  if (!pk.startsWith('0x')) pk = '0x' + pk;
  cachedWallet = new ethers.Wallet(pk, provider);
  return cachedWallet;
}
