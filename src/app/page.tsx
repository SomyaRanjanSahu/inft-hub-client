'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [storedAddress, setStoredAddress] = useState<string | null>(null);

  useEffect(() => {
    // Load stored address from localStorage on component mount
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setStoredAddress(savedAddress);
    }
  }, []);

  useEffect(() => {
    // Store address in localStorage when wallet connects
    if (isConnected && address) {
      localStorage.setItem('walletAddress', address);
      setStoredAddress(address);
    } else if (!isConnected) {
      // Clear stored address when wallet disconnects
      localStorage.removeItem('walletAddress');
      setStoredAddress(null);
    }
  }, [isConnected, address]);

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem('walletAddress');
    setStoredAddress(null);
  };

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gray-900">
      <p className="text-white text-2xl mb-4">Welcome to iNFT hub</p>
      
      {isConnected || storedAddress ? (
        <div className="text-center">
          <p className="text-green-400 text-lg mb-4">🎉 Welcome! Your wallet is connected.</p>
        </div>
      ) : (
        <ConnectButton />
      )}
      
      <p className="text-gray-400 mt-3">Made with ❤️ by Team Compiler</p>
    </main>
  );
}
