"use client";

import { useState } from "react";

export default function CreateWalletPage() {
  const [traits, setTraits] = useState([{ key: "", value: "" }]);
  const [image, setImage] = useState<File | null>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
  };

  const removeImage = () => setImage(null);

  return (
    <main className="flex flex-col min-h-screen items-center bg-gray-900 text-white py-10 px-4">
      {/* Wallet Address */}
      <div className="mb-6 text-center">
        <p className="text-xl">Connected Wallet:</p>
        <p className="text-violet-400 font-mono mt-1">0x1234...abcd</p>
      </div>

      <hr className="mt-6 w-60"></hr>

      {/* Description Text Above Form */}
      <p className="my-6 text-center text-gray-300 text-xl">
        Please describe your iNFT
      </p>

      {/* Form */}
      <form className="w-full max-w-2xl flex flex-col gap-6 bg-gray-800 p-6 rounded-lg shadow-md">
        {/* 1. iNFT Name */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">
            iNFT Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter iNFT name"
            className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* 2. Description (required) */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Describe your iNFT (20-500 chars)"
            minLength={20}
            maxLength={500}
            required
            className="p-2 rounded bg-gray-700 text-white resize-none h-32 focus:outline-none focus:ring-2 focus:ring-violet-500"
          ></textarea>
        </div>

        {/* 3. Traits */}
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
                placeholder="Describe trait (10-200 chars)"
                value={trait.value}
                onChange={(e) => updateTrait(index, "value", e.target.value)}
                className="p-2 rounded bg-gray-700 text-white flex-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                minLength={10}
                maxLength={200}
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

        {/* 4. Image Upload */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">
            Upload Image <span className="text-red-500">*</span>
          </label>
          {!image ? (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-white border border-white w-max cursor-pointer px-2 py-1"
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-gray-300">{image.name}</span>
              <button
                type="button"
                onClick={removeImage}
                className="px-2 py-1 bg-red-500 rounded hover:bg-red-600 cursor-pointer text-sm"
              >
                X
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          Create iNFT
        </button>
      </form>
    </main>
  );
}
