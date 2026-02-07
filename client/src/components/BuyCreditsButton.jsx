"use client";
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';

// Parse blockchain errors into user-friendly messages
const parseError = (err) => {
  const msg = err?.message || err?.toString() || 'Unknown error';
  const code = err?.code;

  if (code === 'ACTION_REJECTED' || msg.includes('user rejected'))
    return { type: 'warning', text: 'Transaction cancelled by user.' };

  if (code === 'INSUFFICIENT_FUNDS' || msg.includes('insufficient funds'))
    return {
      type: 'error',
      text: 'Insufficient ETH in your wallet. You need Sepolia testnet ETH to purchase credits.',
      link: 'https://sepoliafaucet.com',
      linkText: 'Get free Sepolia ETH →',
    };

  if (msg.includes('No wallet found') || msg.includes('install MetaMask'))
    return {
      type: 'error',
      text: 'No crypto wallet detected. Please install MetaMask to continue.',
      link: 'https://metamask.io/download/',
      linkText: 'Install MetaMask →',
    };

  if (msg.includes('wrong network') || msg.includes('chain'))
    return { type: 'warning', text: 'Please switch to Sepolia testnet in MetaMask.' };

  if (msg.includes('Marketplace address missing'))
    return { type: 'error', text: 'Smart contract address not configured. Please contact support.' };

  if (msg.includes('execution reverted'))
    return { type: 'error', text: 'Transaction reverted by the smart contract. The project may be sold out or paused.' };

  // Truncate any other long error
  return { type: 'error', text: msg.length > 150 ? msg.slice(0, 150) + '…' : msg };
};

export const BuyCreditsButton = ({ projectMongoId, projectIdOnChain, pricePerCreditWei }) => {
  const { provider, address, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(1);
  const [txHash, setTxHash] = useState();
  const [error, setError] = useState(); // { type, text, link?, linkText? }

  const totalCost = () => {
    try {
      const wei = BigInt(pricePerCreditWei || '10000000000000000') * BigInt(amount);
      return (Number(wei) / 1e18).toFixed(4);
    } catch {
      return '—';
    }
  };

  const handleBuy = async () => {
    setError(undefined);
    setTxHash(undefined);

    try {
      let activeProvider = provider;
      if (!activeProvider) {
        await connect();
        if (typeof window !== 'undefined' && window.ethereum) {
          activeProvider = new ethers.BrowserProvider(window.ethereum);
        } else {
          throw new Error('Please install MetaMask to buy credits');
        }
      }

      // Auto-switch to Sepolia if on wrong network
      const network = await activeProvider.getNetwork();
      if (Number(network.chainId) !== 11155111) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
          activeProvider = new ethers.BrowserProvider(window.ethereum);
        } catch {
          throw new Error('wrong network');
        }
      }

      const signer = await activeProvider.getSigner();
      const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
      if (!contractAddress) throw new Error('Marketplace address missing');

      const abi = [
        'function buyCredits(uint256 projectId, uint256 amount, string certificateURI) payable',
      ];

      setLoading(true);

      // Prepare certificate URI
      let certificateURI = '';
      try {
        const metaResp = await fetch('/api/blockchain/certificates/prepare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectMongoId, amount, reason: 'purchase' }),
        });
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

      // Record purchase on backend
      try {
        await fetch(`/api/blockchain/projects/${projectMongoId}/record-purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txHash: receipt.hash }),
        });
      } catch {}
    } catch (e) {
      console.error('Buy credits error:', e);
      setError(parseError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Amount selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={() => setAmount(Math.max(1, amount - 1))}
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold border-r transition-colors"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
            className="w-16 text-center py-2 border-0 focus:outline-none"
          />
          <button
            onClick={() => setAmount(amount + 1)}
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold border-l transition-colors"
          >
            +
          </button>
        </div>
        <span className="text-sm text-gray-500">
          × 0.01 ETH = <strong>{totalCost()} ETH</strong>
        </span>
      </div>

      {/* Buy button */}
      <button
        disabled={loading}
        onClick={handleBuy}
        className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing Transaction...
          </>
        ) : (
          <>🦊 {address ? `Buy ${amount} Credit${amount > 1 ? 's' : ''} with MetaMask` : 'Connect Wallet & Buy'}</>
        )}
      </button>

      {/* Success state */}
      {txHash && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-600 font-medium">✅ Purchase Successful!</span>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            {amount} carbon credit{amount > 1 ? 's' : ''} purchased. You&apos;ll receive an NFT certificate upon retirement.
          </p>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            View transaction on Etherscan ↗
          </a>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className={`p-3 rounded-lg border ${
            error.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
          }`}
        >
          <p className={`text-sm font-medium ${error.type === 'warning' ? 'text-yellow-800' : 'text-red-800'}`}>
            {error.type === 'warning' ? '⚠️' : '❌'} {error.text}
          </p>
          {error.link && (
            <a
              href={error.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
            >
              {error.linkText || 'Learn more →'}
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default BuyCreditsButton;
