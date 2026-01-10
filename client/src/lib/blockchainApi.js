import { apiRequest } from './api';

// Helper service for blockchain-specific backend endpoints
// Provides thin wrappers around REST endpoints so UI can stay clean
export const blockchainApi = {
  // User: link wallet (already done implicitly in WalletContext, exposed for completeness)
  async linkWallet(address, chain) {
    return apiRequest('/api/blockchain/wallet/link', {
      method: 'POST',
      body: JSON.stringify({ address, chain })
    });
  },

  // User: record a crypto purchase after on-chain tx mined
  async recordPurchase(projectMongoId, txHash) {
    return apiRequest(`/api/blockchain/projects/${projectMongoId}/record-purchase`, {
      method: 'POST',
      body: JSON.stringify({ txHash })
    });
  },

  // Admin: sync project from chain
  async syncProject(projectMongoId) {
    return apiRequest(`/api/blockchain/projects/${projectMongoId}/sync`, { method: 'POST' });
  },

  // Admin: approve & register project on-chain
  async approveRegisterProject(projectMongoId, { totalCredits, pricePerCreditWei, metadataURI }) {
    return apiRequest(`/api/projects/${projectMongoId}/approve-register`, {
      method: 'POST',
      body: JSON.stringify({ totalCredits, pricePerCreditWei, metadataURI })
    });
  },

  // Admin: grant fiat purchase
  async grantFiatPurchase(projectMongoId, payload) {
    return apiRequest(`/api/projects/${projectMongoId}/grant-fiat`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Quote crypto purchase (public)
  async quotePurchase(projectMongoId, amount) {
    return apiRequest(`/api/projects/${projectMongoId}/quote?amount=${amount}`);
  },

  // Retrieve suggested calldata for retirement (admin-auth required per routes for retire-calldata)
  async getRetireCalldata(projectMongoId) {
    return apiRequest(`/api/projects/${projectMongoId}/retire-calldata`);
  },

  // User retire request (server will execute burn / issuance logic as implemented)
  async retireCredits(projectMongoId, { amount, certificateURI }) {
    return apiRequest(`/api/projects/${projectMongoId}/retire`, {
      method: 'POST',
      body: JSON.stringify({ amount, certificateURI })
    });
  },

  // Certificates
  async listCertificates() {
    return apiRequest('/api/blockchain/certificates');
  },
  async getCertificateMetadata(tokenId) {
    return apiRequest(`/api/blockchain/certificates/${tokenId}`);
  }
};

export default blockchainApi;