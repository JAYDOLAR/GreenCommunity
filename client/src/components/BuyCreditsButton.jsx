"use client";
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { blockchainApi } from '../lib/blockchainApi';
import { Wallet, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

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

export const BuyCreditsButton = ({ projectMongoId, projectIdOnChain, pricePerCreditWei, totalCredits, soldCredits }) => {
  const { provider, address, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(1);
  const [txHash, setTxHash] = useState();
  const [mintedTokenId, setMintedTokenId] = useState();
  const [isTestTx, setIsTestTx] = useState(false);
  const [error, setError] = useState(); // { type, text, link?, linkText? }

  const isDev = process.env.NODE_ENV === 'development';

  const availableCredits = (totalCredits || 0) - (soldCredits || 0);

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
    setMintedTokenId(undefined);
    setIsTestTx(false);

    // Pre-check: verify enough credits are available before sending tx
    if (availableCredits > 0 && amount > availableCredits) {
      setError({ type: 'warning', text: `Only ${availableCredits} credit${availableCredits > 1 ? 's' : ''} available. Please reduce your amount.` });
      return;
    }

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
        'event CertificateMinted(uint256 indexed tokenId, address indexed to, uint256 projectId, uint256 amount, string uri)',
      ];

      setLoading(true);

      // Prepare certificate URI
      let certificateURI = '';
      try {
        const metaResult = await blockchainApi.prepareCertificate(projectMongoId, amount);
        if (metaResult?.certificateURI) {
          certificateURI = metaResult.certificateURI;
        }
      } catch {}

      const contract = new ethers.Contract(contractAddress, abi, signer);
      const value = ethers.toBigInt(pricePerCreditWei) * BigInt(amount);
      const tx = await contract.buyCredits(projectIdOnChain, amount, certificateURI, { value });
      const receipt = await tx.wait(1);
      setTxHash(receipt.hash);

      // Parse CertificateMinted event from receipt logs
      try {
        const iface = new ethers.Interface(abi);
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog({ topics: log.topics, data: log.data });
            if (parsed?.name === 'CertificateMinted') {
              setMintedTokenId(parsed.args.tokenId.toString());
              break;
            }
          } catch {
            // log belongs to a different contract/event — skip
          }
        }
      } catch {}

      // Record purchase on backend (authenticated)
      try {
        await blockchainApi.recordPurchase(projectMongoId, receipt.hash);
      } catch {}
    } catch (e) {
      console.error('Buy credits error:', e);
      setError(parseError(e));
    } finally {
      setLoading(false);
    }
  };

  // Test-only: simulated purchase through backend (no ETH / MetaMask needed)
  const handleTestBuy = async () => {
    setError(undefined);
    setTxHash(undefined);
    setMintedTokenId(undefined);
    setIsTestTx(false);
    setLoading(true);
    try {
      const result = await blockchainApi.testPurchase(projectMongoId, amount);
      if (!result?.success) throw new Error(result?.message || 'Test purchase failed');
      setTxHash(result.txHash);
      setMintedTokenId(String(result.certificateTokenId));
      setIsTestTx(true);
    } catch (e) {
      console.error('Test purchase error:', e);
      setError({ type: 'error', text: e.message || 'Test purchase failed' });
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

      {/* Available credits info */}
      {availableCredits > 0 && (
        <p className="text-xs text-gray-500">
          {availableCredits} credit{availableCredits !== 1 ? 's' : ''} available
        </p>
      )}

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
          <><Wallet className="h-4 w-4" /> {address ? `Buy ${amount} Credit${amount > 1 ? 's' : ''} with MetaMask` : 'Connect Wallet & Buy'}</>
        )}
      </button>

      {/* Test Purchase button (development only) */}
      {isDev && (
        <button
          disabled={loading}
          onClick={handleTestBuy}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </>
          ) : (
            <>🧪 Test Purchase (No ETH needed)</>
          )}
        </button>
      )}

      {/* Success state */}
      {txHash && (
        <div className={`p-3 border rounded-lg ${isTestTx ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium flex items-center gap-1 ${isTestTx ? 'text-orange-600' : 'text-green-600'}`}>
              <CheckCircle className="h-4 w-4" />
              {isTestTx ? 'Test Purchase Successful!' : 'Purchase Successful!'}
            </span>
          </div>
          {isTestTx && (
            <p className="text-xs text-orange-500 font-medium mb-1">⚠ Simulated — no real blockchain transaction</p>
          )}
          <p className="text-xs text-gray-600 mb-2">
            {amount} carbon credit{amount > 1 ? 's' : ''} purchased and retired.
            {mintedTokenId
              ? ` NFT Certificate #${mintedTokenId} has been minted${isTestTx ? ' (simulated)' : ' to your wallet'}!`
              : ' Your offset is recorded on-chain.'}
          </p>
          <div className="flex flex-col gap-1">
            {!isTestTx && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                View transaction on Etherscan ↗
              </a>
            )}
            {mintedTokenId && !isTestTx && (
              <a
                href={`https://testnets.opensea.io/assets/sepolia/${process.env.NEXT_PUBLIC_CERTIFICATE_ADDRESS || ''}/${mintedTokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 hover:underline flex items-center gap-1"
              >
                View NFT Certificate on OpenSea ↗
              </a>
            )}
          </div>
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
            {error.type === 'warning' ? <AlertTriangle className="h-4 w-4 inline" /> : <XCircle className="h-4 w-4 inline" />} {error.text}
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
