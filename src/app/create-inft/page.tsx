"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { useRouter } from "next/navigation";
import { sepolia } from "viem/chains";
import { uploadImageToPinata, uploadMetadataToPinata, NFTMetadata } from "@/lib/pinata";
import { MockINFTContract, contractABI } from "../../../utils/contract";
import { useNFTs } from "@/contexts/NFTContext";
import INFTCard from "../component/INFTCard";
import { createInft } from "@/lib/api";
import { QuickNFT } from "@/lib/quick-nft";

export default function CreateWalletPage() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const router = useRouter();
  const { refreshNFTs } = useNFTs();

  const [traits, setTraits] = useState([{ key: "", value: "" }]);
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mintError, setMintError] = useState<string | null>(null);

  // New states
  const [isMinting, setIsMinting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Wagmi hooks for minting
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  useEffect(() => {
    if (isTransactionSuccess) {
      setIsMinting(false);
      setShowPopup(true);
      // Refresh NFTs to get the latest data
      refreshNFTs();
    }
  }, [isTransactionSuccess, refreshNFTs]);

  useEffect(() => {
    if (isTransactionLoading) {
      setIsMinting(true);
    }
  }, [isTransactionLoading]);

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

  const testPinataConnection = async () => {
    try {
      // Test with a simple text file
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      console.log('Testing Pinata connection...');
      const result = await uploadImageToPinata(testFile);
      console.log('Pinata test successful:', result);
      alert('Pinata connection successful!');
    } catch (error) {
      console.error('Pinata test failed:', error);
      alert('Pinata connection failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem("walletAddress");
    router.push("/");
  };

  // Track previous tokenId in a variable outside handleSubmit
  let previousTokenId: number | undefined = undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image || !name || !description) {
      alert("Please fill in all required fields");
      return;
    }

    if (!address) {
      alert("Please connect your wallet");
      return;
    }

    // Check if user is on the correct network
    if (chain?.id !== sepolia.id) {
      alert("Please switch to Sepolia Testnet to mint your NFT");
      return;
    }

    // Check if all traits have both key and value
    const validTraits = traits.filter(trait => trait.key.trim() !== "" && trait.value.trim() !== "");
    if (validTraits.length === 0) {
      alert("Please add at least one complete trait (both name and value)");
      return;
    }

    setIsMinting(true);
    setMintError(null);

    try {
      // Upload image to Pinata
      console.log("Uploading image to Pinata...");
      const imageUrl = await uploadImageToPinata(image);
      console.log("Image uploaded:", imageUrl);

      // Prepare metadata
      const metadata: NFTMetadata = {
        name,
        description,
        image: imageUrl,
        attributes: validTraits.map(trait => ({
          trait_type: trait.key,
          value: trait.value
        }))
      };

      // Upload metadata to Pinata
      console.log("Uploading metadata to Pinata...");
      const metadataUri = await uploadMetadataToPinata(metadata);
      console.log("Metadata uploaded:", metadataUri);

      // Create metadata hash (simple hash for demo)
      const metadataString = JSON.stringify(metadata);
      const encoder = new TextEncoder();
      const data = encoder.encode(metadataString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const metadataHash = `0x${hashHex}`;

      console.log("Minting NFT with args:", {
        to: address,
        tokenURI: metadataUri,
        encryptedURI: metadataUri,
        metadataHash
      });

      // Mint the NFT
      writeContract({
        address: MockINFTContract as `0x${string}`,
        abi: contractABI,
        functionName: 'mint',
        args: [
          address,
          metadataUri,
          metadataUri, // Using same URI for encrypted URI (simplified for demo)
          metadataHash
        ]
      });

      try {
        // Prepare payload for backend
        let index: number;
        if (previousTokenId === undefined) {
          index = 13;
        } else {
          index = previousTokenId + 1;
        }
        previousTokenId = index;
        const payload = {
          name,
          owner: address,
          tag: 'general', // You can make this dynamic if needed
          cid: metadataUri,
          traits: JSON.stringify(validTraits), // Convert traits to JSON string
          description,
          inft_id: index // Get the first NFT's ID as token_id
        };

        console.log("Submitting iNFT payload:", payload);

        const inft = await createInft(payload); //for agent
        console.log(`iNFT created successfully! ID: ${inft.inft_id}`);
        
      } catch (err) {
        console.error("Failed to call backend:", err);
        // Don't return here, continue with blockchain minting
        alert(`Backend call failed: ${err}, but continuing with blockchain minting...`);
      }

    } catch (error) {
      console.error('Minting error:', error);
      setMintError(error instanceof Error ? error.message : 'Failed to mint NFT');
      setIsMinting(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen items-center bg-gray-900 text-white py-10 px-4 relative">
      {/* Disconnect Button */}
      <button
        onClick={handleDisconnect}
        className="absolute cursor-pointer top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
      >
        Disconnect Wallet
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

      <hr className="mt-6 w-60" />

      {/* Description Text */}
      <p className="my-6 text-center text-gray-300 text-xl">
        Please describe your iNFT
      </p>

      {/* Debug buttons */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={testPinataConnection}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-sm"
        >
          Test Pinata Connection
        </button>

        <button
          type="button"
          onClick={() => {
            console.log('Current chain:', chain);
            console.log('Contract address:', MockINFTContract);
            if (chain?.id !== sepolia.id) {
              switchChain({ chainId: sepolia.id });
            }
          }}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm"
        >
          Switch to Sepolia Testnet ({chain?.name || 'Unknown'})
        </button>
      </div>

      {/* Error Display */}
      {mintError && (
        <div className="w-full max-w-2xl mb-4 p-4 bg-red-600/20 border border-red-600 rounded-lg">
          <p className="text-red-300 text-center">{mintError}</p>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl flex flex-col gap-6 bg-gray-800 p-6 rounded-lg shadow-md"
      >
        {/* iNFT Name */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">
            iNFT Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter iNFT name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Describe your iNFT (20-500 chars)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={20}
            maxLength={500}
            required
            className="p-2 rounded bg-gray-700 text-white resize-none h-32 focus:outline-none focus:ring-2 focus:ring-violet-500"
          ></textarea>
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
                placeholder="Describe trait (e.g., 'Fire magic, powerful spells')"
                value={trait.value}
                onChange={(e) => updateTrait(index, "value", e.target.value)}
                className="p-2 rounded bg-gray-700 text-white flex-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
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

        {/* Image Upload */}
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

      {/* Loader Overlay */}
      {isMinting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <p className="text-xl text-white animate-pulse">Minting NFT...</p>
        </div>
      )}

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center w-96 shadow-lg">
            <h2 className="text-xl mb-4 text-green-400">
              🎉 Congratulations! Here is your iNFT
            </h2>
            {/* NFT UI */}
            <INFTCard name={name} image={image} traits={traits} />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  // Reset form
                  setName("");
                  setDescription("");
                  setTraits([{ key: "", value: "" }]);
                  setImage(null);
                  setShowPopup(false);
                }}
                className="flex-1 px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 cursor-pointer"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
