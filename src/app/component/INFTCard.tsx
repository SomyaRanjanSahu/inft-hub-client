"use client";

import Image from "next/image";

interface Trait {
  key: string;
  value: string;
}

interface INFTCardProps {
  name: string;
  image?: File | null;
  traits: Trait[];
}

export default function INFTCard({ name, image, traits }: INFTCardProps) {
  const imageUrl = image ? URL.createObjectURL(image) : null;

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-violet-400 animate-[glow_2s_ease-in-out_infinite] bg-black">
      {/* Top: Image */}
      {imageUrl ? (
        <div className="w-full h-2/3 relative overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover rounded-t-2xl"
          />
        </div>
      ) : (
        <div className="w-full h-2/3 bg-gradient-to-br from-purple-700 via-violet-600 to-pink-500 rounded-t-2xl"></div>
      )}

      {/* Bottom: Name & Traits */}
      <div className="flex flex-col justify-center items-center h-1/3 bg-black/80 p-4">
        <h2 className="text-xl font-bold text-white drop-shadow-lg text-center mb-2">
          {name}
        </h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {traits
            .filter((t) => t.key.trim() !== "")
            .map((trait, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, hsl(${
                    (index * 70) % 360
                  }, 80%, 50%), hsl(${(index * 70 + 50) % 360}, 70%, 40%))`,
                  boxShadow: `0 0 8px hsl(${(index * 70) % 360}, 80%, 50%)`,
                }}
              >
                {trait.key}
              </span>
            ))}
        </div>
      </div>

      {/* Glowing Border */}
      <div className="absolute inset-0 rounded-2xl border-4 border-violet-400 pointer-events-none animate-[glow_2s_ease-in-out_infinite]"></div>

      <style jsx>{`
        @keyframes glow {
          0% {
            box-shadow: 0 0 10px #a855f7, 0 0 20px #8b5cf6, 0 0 30px #7c3aed;
          }
          50% {
            box-shadow: 0 0 20px #a855f7, 0 0 30px #8b5cf6, 0 0 40px #7c3aed;
          }
          100% {
            box-shadow: 0 0 10px #a855f7, 0 0 20px #8b5cf6, 0 0 30px #7c3aed;
          }
        }
      `}</style>
    </div>
  );
}
