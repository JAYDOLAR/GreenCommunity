"use client";
import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';

export const MyCertificates = () => {
  const { address, connect } = useWallet();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(()=>{
    if(!address) return;
    (async()=>{
      setLoading(true); setError(undefined);
      try {
        const res = await fetch('/api/blockchain/certificates');
        const json = await res.json();
        if(!json.success) throw new Error(json.message||'Failed');
        setCerts(json.certificates);
      } catch(e){ setError(e.message); } finally { setLoading(false); }
    })();
  },[address]);

  if(!address) return <button onClick={connect} className="bg-green-600 text-white px-4 py-2 rounded">Connect Wallet</button>;
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">My Certificates</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <ul className="space-y-2">
        {certs.map(c => (
          <li key={c.tokenId} className="border p-3 rounded">
            <div className="text-sm">Token ID: {c.tokenId}</div>
            {c.uri && (
              <a
                className="text-blue-600 underline break-all"
                target="_blank"
                rel="noopener noreferrer"
                href={c.uri.startsWith('ipfs://') ? c.uri.replace('ipfs://','https://ipfs.io/ipfs/') : c.uri}
              >
                {c.uri}
              </a>
            )}
          </li>
        ))}
        {!loading && certs.length===0 && <li className="text-sm text-gray-500">No certificates found.</li>}
      </ul>
    </div>
  );
};

export default MyCertificates;
