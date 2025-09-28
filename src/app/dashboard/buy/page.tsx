"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import INFTCard from "../../component/INFTCard";

interface Trait {
  key: string;
  value: string;
  cost: number;
}

interface INFT {
  id: number;
  name: string;
  traits: Trait[];
  image?: File | null;
}

function BuyTraitsPageContent() {
  const searchParams = useSearchParams();
  const myId = Number(searchParams.get("my"));
  const otherId = Number(searchParams.get("other"));
  const router = useRouter();

  // Dummy iNFTs with personality traits
  const infts: INFT[] = [
    {
      id: 1,
      name: "Luna the Singer",
      traits: [
        { key: "Vocal Range", value: "🎵", cost: 0.01 },
        { key: "Songwriting", value: "✍️", cost: 0.02 },
        { key: "Stage Presence", value: "🎭", cost: 0.015 },
        { key: "Music Production", value: "🎛️", cost: 0.025 },
      ],
    },
    {
      id: 2,
      name: "Alex the Artist",
      traits: [
        { key: "Digital Art", value: "🖥️", cost: 0.01 },
        { key: "Color Theory", value: "🎨", cost: 0.015 },
        { key: "3D Modeling", value: "🏗️", cost: 0.02 },
        { key: "Animation", value: "🎬", cost: 0.03 },
      ],
    },
    {
      id: 3,
      name: "Jordan the Chef",
      traits: [
        { key: "Culinary Skills", value: "👨‍🍳", cost: 0.01 },
        { key: "Flavor Pairing", value: "🌶️", cost: 0.015 },
        { key: "Presentation", value: "🍽️", cost: 0.02 },
        { key: "Menu Planning", value: "📋", cost: 0.025 },
      ],
    },
  ];

  const myINFT = infts.find((n) => n.id === myId);
  const selectedINFT = infts.find((n) => n.id === otherId);

  const [loadingTrait, setLoadingTrait] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  if (!myINFT || !selectedINFT) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-xl">
        Loading...
      </div>
    );
  }

  const handleBuyTrait = (trait: Trait) => {
    setLoadingTrait(trait.key);

    setTimeout(() => {
      // Simulate adding trait to my iNFT
      myINFT.traits.push({ key: trait.key, value: trait.value, cost: 0 });
      setAlertMsg(`✅ Your iNFT has received the trait "${trait.key}"!`);
      setLoadingTrait(null);
    }, 1500);
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-900 text-white py-10 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Buy Traits for Your iNFT</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Selected & My iNFT */}
      <div className="flex gap-6 mb-6 justify-center items-center">
        <div className="flex flex-col items-center">
          <INFTCard
            name={selectedINFT.name}
            traits={selectedINFT.traits}
            image={selectedINFT.image}
          />
          <span className="mt-2 text-gray-300">{selectedINFT.name}</span>
        </div>

        {/* Connection Link */}
        <div className="text-gray-400 text-xl font-bold">↔️</div>

        <div className="flex flex-col items-center">
          <INFTCard
            name={myINFT.name}
            traits={myINFT.traits}
            image={myINFT.image}
          />
          <span className="mt-2 text-gray-300">{myINFT.name}</span>
        </div>
      </div>

      {/* Traits List */}
      <h2 className="text-xl font-bold mb-4">Available Traits</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {selectedINFT.traits.map((trait) => (
          <div
            key={trait.key}
            className="flex items-center justify-between p-4 bg-gray-800 rounded shadow"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{trait.value}</span>
              <span>{trait.key}</span>
            </div>
            <button
              onClick={() => handleBuyTrait(trait)}
              disabled={loadingTrait === trait.key}
              className={`px-3 py-1 rounded ${
                loadingTrait === trait.key
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loadingTrait === trait.key
                ? "Processing..."
                : `Buy ${trait.cost} ETH`}
            </button>
          </div>
        ))}
      </div>

      {/* Alert */}
      {alertMsg && (
        <div className="fixed top-20 right-4 bg-gray-800 p-4 rounded shadow z-50 text-white flex items-center gap-2">
          {alertMsg}
          <button
            onClick={() => setAlertMsg(null)}
            className="ml-2 px-2 py-1 bg-red-600 rounded hover:bg-red-700 transition"
          >
            Close
          </button>
        </div>
      )}
    </main>
  );
}

export default function BuyTraitsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-white text-xl">
          Loading iNFT traits...
        </div>
      }
    >
      <BuyTraitsPageContent />
    </Suspense>
  );
}
