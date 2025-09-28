"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [storedAddress, setStoredAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Load stored address from localStorage on component mount
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setStoredAddress(savedAddress);
    }
  }, []);

  useEffect(() => {
    // Store address in localStorage when wallet connects
    if (isConnected && address) {
      setIsConnecting(true);
      localStorage.setItem("walletAddress", address);
      setStoredAddress(address);
      // Navigate immediately without waiting for state updates
      setTimeout(() => {
        router.push("/create-inft");
      }, 100); // Small delay to ensure state is updated
    } else if (!isConnected) {
      // Clear stored address when wallet disconnects
      localStorage.removeItem("walletAddress");
      setStoredAddress(null);
      setIsConnecting(false);
    }
  }, [isConnected, address, router]);

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gray-900">
      {isConnected || storedAddress ? (
        <div className="text-center">
          {isConnecting && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-400"></div>
              <p className="text-gray-300">Connecting to wallet...</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="text-white text-2xl mb-4">Welcome to iNFT hub</p>
          <ConnectButton />
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white"
            >
              Explore Marketplace
            </button>
          </div>
          <p className="text-gray-400 mt-3">Made with ❤️ by Team Compiler</p>
        </>
      )}
    </main>
  );
}
