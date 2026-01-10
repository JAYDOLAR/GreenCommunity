"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Basic wallet context without TypeScript types
const WalletContext = createContext({
  address: undefined,
  chainId: undefined,
  provider: undefined,
  connect: async () => {},
  disconnect: () => {}
});

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState();
  const [chainId, setChainId] = useState();
  const [provider, setProvider] = useState();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const eth = window.ethereum;
      eth.on('accountsChanged', (accs) => setAddress(accs[0]?.toLowerCase()));
      eth.on('chainChanged', () => window.location.reload());
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) throw new Error('No wallet found');
    const prov = new ethers.BrowserProvider(window.ethereum);
    await prov.send('eth_requestAccounts', []);
    const signer = await prov.getSigner();
    const addr = (await signer.getAddress()).toLowerCase();
    const net = await prov.getNetwork();
    setProvider(prov);
    setAddress(addr);
    setChainId(Number(net.chainId));
    try {
      await fetch('/api/blockchain/wallet/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr, chain: `eip155:${net.chainId}` })
      });
    } catch {}
  };

  const disconnect = () => {
    setProvider(undefined);
    setAddress(undefined);
    setChainId(undefined);
  };

  return (
    <WalletContext.Provider value={{ address, chainId, provider, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
