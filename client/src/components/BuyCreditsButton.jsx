"use client";
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';

export const BuyCreditsButton = ({ projectMongoId, projectIdOnChain, pricePerCreditWei }) => {
  const { provider, address, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(1);
  const [txHash, setTxHash] = useState();
  const [error, setError] = useState();

  const handleBuy = async () => {
    setError(undefined);
    try {
      if (!provider) { await connect(); }
      const signer = await provider.getSigner();
      const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
      if (!contractAddress) throw new Error('Marketplace address missing');
      const abi = [
        'function buyCredits(uint256 projectId, uint256 amount, string certificateURI) payable'
      ];
      setLoading(true);
      let certificateURI = '';
      try {
        const metaResp = await fetch('/api/blockchain/certificates/prepare', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ projectMongoId, amount, reason:'purchase' })});
        if (metaResp.ok) {
          const meta = await metaResp.json();
          certificateURI = meta.certificateURI || '';
        }
      } catch {}
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const value = ethers.toBigInt(pricePerCreditWei) * BigInt(amount);
      const tx = await contract.buyCredits(projectIdOnChain, amount, certificateURI, { value });
      const receipt = await tx.wait(1);
      setTxHash(receipt.hash);
      await fetch(`/api/blockchain/projects/${projectMongoId}/record-purchase`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ txHash: receipt.hash })});
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input type="number" min={1} value={amount} onChange={e=>setAmount(Number(e.target.value))} className="border px-2 py-1 w-20" />
        <button disabled={loading} onClick={handleBuy} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {loading ? 'Processing...' : address ? 'Buy Credits' : 'Connect & Buy'}
        </button>
      </div>
      {txHash && <p className="text-xs break-all">Tx: {txHash}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default BuyCreditsButton;
