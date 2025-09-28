"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
// import INFTCard from "../../component/INFTCard";
import { useDisconnect } from "wagmi";
import { listINFTs, sendChat, INFT, ChatRequest, ChatResponse } from "../../../lib/api";

interface Message {
  id: number;
  sender: "me" | "nft";
  text: string;
  timestamp: Date;
}

export default function AMAChat() {
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { disconnect } = useDisconnect();

  // Use user 1 as requested
  const myId = 6;
  const otherId = 2;

  const [infts, setINFTs] = useState<INFT[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const myINFT = infts.find((n) => n.id === myId);
  const otherINFT = infts.find((n) => n.id === otherId);

  // Load iNFTs from API
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await listINFTs();
        setINFTs(data);
      } catch (err: any) {
        alert(`Error loading iNFTs: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add initial greeting when iNFTs are loaded
  useEffect(() => {
    if (otherINFT && messages.length === 0) {
      const greeting: Message = {
        id: 6,
        sender: "nft",
        text: `Hello! I'm ${otherINFT.name}. Ask me anything!`,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [otherINFT, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || !myINFT || !otherINFT || chatLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "me",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setChatLoading(true);

    try {
      const payload: ChatRequest = { user_id: String(myINFT.id), message: userMessage.text };
      const res: ChatResponse = await sendChat(otherINFT.id, payload);
      const reply: Message = {
        id: Date.now() + 1,
        sender: "nft",
        text: res.reply || "I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: Date.now() + 2,
        sender: "nft",
        text: "Sorry, I'm having technical difficulties. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      alert(`Chat failed: ${err.message || 'Unknown error'}`);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          Loading iNFT chat...
        </div>
      </div>
    );
  }

  if (!myINFT || !otherINFT) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white text-xl">
        <div className="text-center">
          <h2 className="text-2xl mb-4">iNFT Chat Error</h2>
          <p className="text-gray-300 mb-4">No iNFTs found with the specified IDs</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen bg-gray-900 text-white relative">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700">
        {/* Other INFT */}
        {/* <div className="flex flex-col items-center">
          <div className="w-24 h-24">
            <INFTCard name={otherINFT.name} image={otherINFT.image} traits={otherINFT.traits} />
          </div>
          <span className="text-sm text-gray-300 mt-1">{otherINFT.name}</span>
          <span className="text-xs text-gray-500">ID: {otherINFT.id}</span>
        </div> */}
        {/* Connection Status & Controls */}
        <div className="flex flex-col items-center mx-4">
          <div className="w-16 h-1 bg-violet-500 rounded mb-1" />
          <span className="text-xs text-gray-400 mb-2">Connected</span>
          <span className="text-xs text-gray-500 mb-2">User: 1</span>
          <button
            onClick={handleDisconnect}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition text-xs"
          >
            Disconnect
          </button>
        </div>
        {/* My INFT */}
        {/* <div className="flex flex-col items-center">
          <div className="w-24 h-24">
            <INFTCard name={myINFT.name} image={myINFT.image} traits={myINFT.traits} />
          </div>
          <span className="text-sm text-gray-300 mt-1">{myINFT.name}</span>
          <span className="text-xs text-gray-500">ID: {myINFT.id}</span>
        </div> */}
      </div>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-900">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow ${
                msg.sender === "me"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-700 text-white rounded-bl-none"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className="text-xs text-gray-300 mt-1 text-right">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        {/* Loading indicator for chat response */}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white rounded-lg rounded-bl-none px-4 py-2 max-w-xs md:max-w-md">
              <div className="flex items-center space-x-2">
                <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{animationDelay: '0.1s'}}></div>
                <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      {/* Input Section */}
      <div className="flex items-center px-4 py-3 bg-gray-800 border-t border-gray-700">
        <input
          type="text"
          placeholder={`Chat with ${otherINFT.name}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={chatLoading}
          className="flex-1 px-4 py-2 rounded-l-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={chatLoading || !input.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-r-lg transition"
        >
          {chatLoading ? "..." : "Send"}
        </button>
      </div>
    </main>
  );
}


