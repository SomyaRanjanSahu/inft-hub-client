"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleConnectWallet = () => {
    router.push("/create-inft");
  };

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-gray-900">
      <p className="text-white text-2xl mb-4">Welcome to iNFT Hub</p>
      <button
        onClick={handleConnectWallet}
        className="cursor-pointer px-6 py-3 bg-violet-600 text-white rounded-lg shadow-md hover:bg-violet-800 transition"
      >
        Connect Wallet
      </button>
      <p className="text-gray-400 mt-3">Made with ❤️ by Team Compiler</p>
    </main>
  );
}
