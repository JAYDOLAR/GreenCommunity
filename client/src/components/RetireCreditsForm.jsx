"use client";
import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { blockchainApi } from '@/lib/blockchainApi';

const RetireCreditsForm = ({ projectMongoId, onRetired }) => {
  const { address, connect } = useWallet();
  const [amount, setAmount] = useState(1);
  const [certificateURI, setCertificateURI] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState();
  const [error, setError] = useState();

  const submit = async () => {
    if(!address) { await connect(); }
    setLoading(true); setError(undefined); setStatus(undefined);
    try {
      const res = await blockchainApi.retireCredits(projectMongoId, { amount, certificateURI: certificateURI || undefined });
      if(!res.success) throw new Error(res.message||'Failed');
      setStatus('Retirement submitted');
      onRetired?.(res);
    } catch(e){ setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-2 border rounded p-4">
      <h4 className="font-medium text-sm">Retire Credits</h4>
      <div className="flex gap-2 items-center">
        <input type="number" min={1} value={amount} onChange={e=>setAmount(Number(e.target.value))} className="border px-2 py-1 w-24 rounded bg-transparent" />
        <input type="text" placeholder="Optional certificate URI" value={certificateURI} onChange={e=>setCertificateURI(e.target.value)} className="border flex-1 px-2 py-1 rounded bg-transparent" />
        <button disabled={loading} onClick={submit} className="bg-emerald-600 text-white px-3 py-1 rounded disabled:opacity-50 text-sm">{loading? 'Processing...' : address? 'Retire' : 'Connect & Retire'}</button>
      </div>
      {status && <p className="text-xs text-green-600">{status}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-[10px] text-muted-foreground">Retiring credits permanently removes them and (optionally) mints a certificate.</p>
    </div>
  );
};

export default RetireCreditsForm;
