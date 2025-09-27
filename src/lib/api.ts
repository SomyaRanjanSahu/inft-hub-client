import { NFTData } from "@/contexts/NFTContext";

// frontend/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export interface INFT {
  id: number;
  name: string;
  traits: { key: string; value: string }[];
  image?: string | null; // backend returns cid, you can resolve to URL if needed
  owner?: string;
  tag?: string;
  score?: number;
  created_at?: string;
}

export interface ChatRequest {
  user_id?: string;
  message: string;
}

export interface ChatResponse {
  reply: string;
}


// ---------- iNFT APIs ----------
export async function listINFTs(): Promise<INFT[]> {
  const res = await fetch(`${API_BASE}/list_infts`);
  if (!res.ok) throw new Error("Failed to load iNFTs");
  return res.json();
}

export async function sendChat(inftId: number, payload: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat/${inftId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}

export interface Trait {
  key: string;
  value: string;
}

export async function createInft(
  name: string,
  wallet: string,
  description: string,
  cid: string,
  traits: Trait[]
) {
  const response = await fetch("http://localhost:8000/create_inft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      wallet,
      description,
      cid,
      traits: JSON.stringify(traits),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create iNFT: ${response.statusText}`);
  }

  return response.json();
}

export async function submitFeedback(inftId: number, rating: number, comment: string) {
  const formData = new FormData();
  formData.append("rating", rating.toString());
  formData.append("comment", comment);

  const res = await fetch(`${API_BASE}/feedback/${inftId}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Feedback failed");
  return res.json();
}

export async function rentTransfer(sourceInft: number, targetInft: number) {
  const formData = new FormData();
  formData.append("source_inft", sourceInft.toString());
  formData.append("target_inft", targetInft.toString());

  const res = await fetch(`${API_BASE}/rent_transfer`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Rent transfer failed");
  return res.json();
}
