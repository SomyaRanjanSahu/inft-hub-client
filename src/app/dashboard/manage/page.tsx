"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function TrainINFTPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [traits, setTraits] = useState([{ key: "", value: "" }]);
  const [description, setDescription] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const addTrait = () => {
    if (traits.length < 5) setTraits([...traits, { key: "", value: "" }]);
  };

  const removeTrait = (index: number) => {
    if (traits.length > 1) {
      const newTraits = [...traits];
      newTraits.splice(index, 1);
      setTraits(newTraits);
    }
  };

  const updateTrait = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newTraits = [...traits];
    newTraits[index][field] = value;
    setTraits(newTraits);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    // Simulate API update
    setTimeout(() => {
      setIsUpdating(false);
      setUpdateSuccess(Math.random() > 0.2); // random success/failure
      setShowPopup(true);
    }, 2000);
  };

  return (
    <main className="flex flex-col min-h-screen items-center bg-gray-900 text-white py-10 px-4 relative">
      {/* Back to Dashboard */}
      <button
        onClick={() => router.push("/dashboard")}
        className="absolute top-4 left-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
      >
        ← Back to Dashboard
      </button>

      {/* Wallet Address */}
      <div className="mb-6 text-center">
        <p className="text-xl">Connected Wallet:</p>
        <p className="text-violet-400 font-mono mt-1">
          {address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : "Not connected"}
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Train Your iNFT Model</h2>
      <p className="mb-6 text-center text-gray-300 text-lg">
        Update description, traits, and improve your iNFT
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl flex flex-col gap-6 bg-gray-800 p-6 rounded-lg shadow-md"
      >
        {/* Description */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Update your iNFT description (20-500 chars)"
            minLength={20}
            maxLength={500}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white resize-none h-32 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Traits */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium">
            Traits (1-5) <span className="text-red-500">*</span>
          </label>
          {traits.map((trait, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Trait name (e.g., Hobbies)"
                value={trait.key}
                onChange={(e) => updateTrait(index, "key", e.target.value)}
                className="p-2 rounded bg-gray-700 text-white flex-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="text"
                placeholder="Describe trait (100-300 chars)"
                value={trait.value}
                onChange={(e) => updateTrait(index, "value", e.target.value)}
                className="p-2 rounded bg-gray-700 text-white flex-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                minLength={100}
                maxLength={300}
              />
              {traits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTrait(index)}
                  className="px-2 bg-red-500 rounded hover:bg-red-600 cursor-pointer"
                >
                  X
                </button>
              )}
            </div>
          ))}
          {traits.length < 5 && (
            <button
              type="button"
              onClick={addTrait}
              className="mt-2 px-4 py-2 bg-violet-600 rounded hover:bg-violet-700 cursor-pointer"
            >
              + Add Trait
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          Update iNFT
        </button>
      </form>

      {/* Loader Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <p className="text-xl text-white animate-pulse">
            Updating your iNFT...
          </p>
        </div>
      )}

      {/* Success / Failure Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center w-96 shadow-lg">
            <h2
              className={`text-xl mb-4 ${
                updateSuccess ? "text-green-400" : "text-red-400"
              }`}
            >
              {updateSuccess
                ? "✅ iNFT Updated Successfully!"
                : "❌ Update Failed"}
            </h2>

            <button
              onClick={() => {
                setShowPopup(false);
                if (updateSuccess) router.push("/dashboard");
              }}
              className="mt-4 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              {updateSuccess ? "Continue" : "Close"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
