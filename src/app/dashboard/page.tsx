"use client";

import { useState } from "react";
import INFTCard from "../component/INFTCard";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";

interface INFT {
  id: number;
  name: string;
  image?: File | null;
  traits: { key: string; value: string }[];
  popularity: number;
  createdAt: Date;
}

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  const [infts] = useState<INFT[]>([
    {
      id: 1,
      name: "AI Dragon",
      image: null,
      traits: [
        { key: "Fire", value: "🔥" },
        { key: "Flight", value: "✈️" },
      ],
      popularity: 10,
      createdAt: new Date("2025-09-25"),
    },
    {
      id: 2,
      name: "Cyber Pikachu",
      image: null,
      traits: [{ key: "Electric", value: "⚡" }],
      popularity: 30,
      createdAt: new Date("2025-09-27"),
    },
    {
      id: 3,
      name: "Quantum Cat",
      image: null,
      traits: [{ key: "Stealth", value: "🕶️" }],
      popularity: 20,
      createdAt: new Date("2025-09-26"),
    },
  ]);

  const sortedInfts = [...infts].sort((a, b) => {
    if (sortBy === "latest")
      return b.createdAt.getTime() - a.createdAt.getTime();
    return b.popularity - a.popularity;
  });

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem("walletAddress");
    router.push("/");
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
        {/* Overlay Text */}
        <h1 className="absolute text-[8rem] font-bold text-white/10 select-none pointer-events-none">
          iNFTs
        </h1>
        {/* Banner Content */}
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-4xl font-extrabold mb-4">
            Explore, Interact and Learn
          </h2>
          <button
            onClick={() => alert("Manage your iNFT clicked")}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition"
          >
            Manage your iNFT
          </button>
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="flex justify-end items-center max-w-6xl mx-auto mt-6 px-4">
        <label className="mr-2 font-medium">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "latest" | "popular")}
          className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="latest">Latest</option>
          <option value="popular">Popular</option>
        </select>
      </div>

      {/* NFTs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4 mt-6">
        {sortedInfts.map((nft) => (
          <INFTCard
            key={nft.id}
            name={nft.name}
            image={nft.image}
            traits={nft.traits}
          />
        ))}
      </div>
    </main>
  );
}
