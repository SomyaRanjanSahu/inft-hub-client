"use client";

import { useState } from "react";
import INFTCard from "../component/INFTCard";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { useNFTs, NFTData } from "@/contexts/NFTContext";

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { allNFTs, loading, refreshNFTs } = useNFTs();

  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [selectedINFT, setSelectedINFT] = useState<NFTData | null>(null);

  const sortedNFTs = [...allNFTs].sort((a, b) => {
    const aTokenId = parseInt(a.tokenId);
    const bTokenId = parseInt(b.tokenId);
    
    if (sortBy === "latest") {
      return bTokenId - aTokenId; // Higher token IDs are newer
    }
    return aTokenId - bTokenId; // Lower token IDs are older
  });

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem("walletAddress");
    router.push("/");
  };

  const handleRefresh = async () => {
    await refreshNFTs();
  };

  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-900 text-white relative">
      {/* Top Right Wallet Info */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
        {isConnected && (
          <>
            <p className="text-white font-mono text-sm">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
            </p>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm transition"
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {/* Banner */}
      <div className="relative h-64 w-full flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-400 to-orange-400 overflow-hidden">
        <h1 className="absolute text-[8rem] font-bold text-white/10 select-none pointer-events-none">
          iNFTs
        </h1>
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-4xl font-extrabold mb-4">
            Explore, Interact and Learn
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push("/dashboard/manage")}
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition"
            >
              Manage your iNFT
            </button>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 cursor-pointer transition"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Marketplace"}
            </button>
            <button
              onClick={() => router.push("/nft-demo")}
              className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 cursor-pointer transition"
            >
              NFT Utils Demo
            </button>
          </div>
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="flex justify-end items-center max-w-6xl mx-auto mt-6 px-4">
        <label className="mr-2 font-medium">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "latest" | "oldest")}
          className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* NFTs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4 mt-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-300">Loading NFTs...</p>
          </div>
        ) : sortedNFTs.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-300">No NFTs found. Create your first iNFT!</p>
            <button
              onClick={() => router.push("/create-inft")}
              className="mt-4 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Create iNFT
            </button>
          </div>
        ) : (
          sortedNFTs.map((nft: NFTData) => (
            <div
              key={nft.tokenId}
              onClick={() => setSelectedINFT(nft)}
              className="cursor-pointer"
            >
              <INFTCard name={nft.name} image={nft.image} traits={nft.traits} />
            </div>
          ))
        )}
      </div>

      {/* Modal Popup */}
      {selectedINFT && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 flex flex-col items-center gap-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white text-center">
              {selectedINFT.name}
            </h2>
            
            <INFTCard 
              name={selectedINFT.name} 
              image={selectedINFT.image} 
              traits={selectedINFT.traits} 
            />
            
            <div className="w-full text-sm">
              <div className="mb-3">
                <h3 className="text-lg font-semibold mb-1">Description:</h3>
                <p className="text-gray-300">{selectedINFT.description || "No description available"}</p>
              </div>
              
              <div className="mb-3">
                <h3 className="text-lg font-semibold mb-1">Token ID:</h3>
                <p className="text-gray-300">#{selectedINFT.tokenId}</p>
              </div>
              
              <div className="mb-3">
                <h3 className="text-lg font-semibold mb-1">Owner:</h3>
                <p className="text-gray-300 break-all text-xs">{selectedINFT.owner}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">Traits:</h3>
                <div className="space-y-1">
                  {selectedINFT.traits.length > 0 ? (
                    selectedINFT.traits.map((trait, index) => (
                      <div key={index} className="bg-gray-700 p-2 rounded text-xs">
                        <span className="font-medium">{trait.key}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-xs">No traits available</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <p className="text-gray-300 text-center text-sm">
                What would you like to do?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/ama?&other=${selectedINFT.tokenId}`
                    )
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  AMA
                </button>
                <button
                  onClick={() => alert(`Train functionality coming soon for ${selectedINFT.name}`)}
                  className="flex-1 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                >
                  Train
                </button>
              </div>
              <button
                onClick={() => setSelectedINFT(null)}
                className="mt-2 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
