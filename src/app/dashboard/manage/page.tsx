"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useNFTs, NFTData } from "@/contexts/NFTContext";
import INFTCard from "../../component/INFTCard";

export default function ManageINFTPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const { userNFTs, loading, refreshNFTs } = useNFTs();

  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");

  // Removed wallet connection check - page will always show

  const sortedUserNFTs = [...userNFTs].sort((a, b) => {
    const aTokenId = parseInt(a.tokenId);
    const bTokenId = parseInt(b.tokenId);

    if (sortBy === "latest") {
      return bTokenId - aTokenId;
    }
    return aTokenId - bTokenId;
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
      <div className="flex justify-between items-center p-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm"
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-col items-end gap-2">
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
      </div>

      <div className="relative h-48 w-full flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
        <h1 className="absolute text-[6rem] font-bold text-white/10 select-none pointer-events-none">
          My iNFTs
        </h1>
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-3xl font-extrabold mb-4">
            Manage Your iNFT Collection
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push("/create-inft")}
              className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 cursor-pointer transition"
            >
              Create New iNFT
            </button>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh NFTs"}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4 mt-6 mb-8">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-300">Loading your NFTs...</p>
          </div>
        ) : sortedUserNFTs.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-300 mb-4">
              You don&apos;t have any iNFTs yet.
            </p>
            <button
              onClick={() => router.push("/create-inft")}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Create Your First iNFT
            </button>
          </div>
        ) : (
          sortedUserNFTs.map((nft: NFTData) => (
            <div
              key={nft.tokenId}
              onClick={() => setSelectedNFT(nft)}
              className="cursor-pointer transform hover:scale-105 transition-transform"
            >
              <INFTCard name={nft.name} image={nft.image} traits={nft.traits} />
            </div>
          ))
        )}
      </div>

      {selectedNFT && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 flex flex-col items-center gap-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white text-center">
              {selectedNFT.name}
            </h2>

            <INFTCard
              name={selectedNFT.name}
              image={selectedNFT.image}
              traits={selectedNFT.traits}
            />

            <div className="w-full">
              <h3 className="text-lg font-semibold mb-2">Description:</h3>
              <p className="text-gray-300 text-sm mb-4">
                {selectedNFT.description || "No description available"}
              </p>

              <h3 className="text-lg font-semibold mb-2">Token ID:</h3>
              <p className="text-gray-300 text-sm mb-4">
                #{selectedNFT.tokenId}
              </p>

              <h3 className="text-lg font-semibold mb-2">Owner:</h3>
              <p className="text-gray-300 text-sm mb-4 break-all">
                {selectedNFT.owner}
              </p>

              <h3 className="text-lg font-semibold mb-2">Metadata URI:</h3>
              <p className="text-gray-300 text-xs mb-4 break-all">
                {selectedNFT.metadataUri}
              </p>

              {selectedNFT.encryptedUri && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Encrypted URI:</h3>
                  <p className="text-gray-300 text-xs mb-4 break-all">
                    {selectedNFT.encryptedUri}
                  </p>
                </>
              )}

              {selectedNFT.metadataHash && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Metadata Hash:</h3>
                  <p className="text-gray-300 text-xs mb-4 break-all">
                    {selectedNFT.metadataHash}
                  </p>
                </>
              )}

              <h3 className="text-lg font-semibold mb-2">Traits:</h3>
              <div className="space-y-2 mb-4">
                {selectedNFT.traits.length > 0 ? (
                  selectedNFT.traits.map((trait, index) => (
                    <div key={index} className="bg-gray-700 p-2 rounded">
                      <span className="font-medium">{trait.key}:</span>
                      <span className="ml-2 text-gray-300">{trait.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No traits available</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => setSelectedNFT(null)}
                className="flex-1 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (selectedNFT.metadataUri.startsWith("ipfs://")) {
                    const ipfsUrl = selectedNFT.metadataUri.replace(
                      "ipfs://",
                      "https://gateway.pinata.cloud/ipfs/"
                    );
                    window.open(ipfsUrl, "_blank");
                  } else {
                    window.open(selectedNFT.metadataUri, "_blank");
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                View Metadata
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
