"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import INFTCard from "../../component/INFTCard";
import { useDisconnect } from "wagmi";

interface Message {
  id: number;
  sender: "me" | "nft";
  text: string;
  timestamp: Date;
}

interface INFT {
  id: number;
  name: string;
  traits: { key: string; value: string }[];
  image?: File | null;
}

export default function AMAChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const myId = Number(searchParams.get("my"));
  const otherId = Number(searchParams.get("other"));
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { disconnect } = useDisconnect();

  // Dummy data
  const infts: INFT[] = [
    { id: 1, name: "AI Dragon", traits: [{ key: "Fire", value: "🔥" }] },
    {
      id: 2,
      name: "Cyber Pikachu",
      traits: [{ key: "Electric", value: "⚡" }],
    },
    { id: 3, name: "Quantum Cat", traits: [{ key: "Stealth", value: "🕶️" }] },
  ];

  const myINFT = infts.find((n) => n.id === myId);
  const otherINFT = infts.find((n) => n.id === otherId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !myINFT || !otherINFT) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: "me",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate reply
    setTimeout(() => {
      const reply: Message = {
        id: messages.length + 2,
        sender: "nft",
        text: `Reply from ${otherINFT.name}: I understood "${input}"`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (!myINFT || !otherINFT) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-xl">
        Loading iNFT chat...
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen bg-gray-900 text-white relative">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700">
        {/* Selected INFT */}
        <div className="flex flex-col items-center">
          <INFTCard
            name={otherINFT.name}
            image={otherINFT.image}
            traits={otherINFT.traits}
          />
          <span className="text-sm text-gray-300 mt-1">{otherINFT.name}</span>
        </div>

        {/* Connection + Disconnect */}
        <div className="flex flex-col items-center mx-4">
          <div className="w-16 h-1 bg-violet-500 rounded mb-1" />
          <span className="text-xs text-gray-400 mb-2">Connected</span>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition text-xs"
          >
            Disconnect
          </button>
        </div>

        {/* My INFT */}
        <div className="flex flex-col items-center">
          <INFTCard
            name={myINFT.name}
            image={myINFT.image}
            traits={myINFT.traits}
          />
          <span className="text-sm text-gray-300 mt-1">{myINFT.name}</span>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-900">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow ${
                msg.sender === "me"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-700 text-white rounded-bl-none"
              }`}
            >
              {msg.text}
              <div className="text-xs text-gray-300 mt-1 text-right">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center px-4 py-3 bg-gray-800 border-t border-gray-700">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 rounded-l-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition"
        >
          Send
        </button>
      </div>
    </main>
  );
}
