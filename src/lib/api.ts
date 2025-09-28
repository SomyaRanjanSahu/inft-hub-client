
// frontend/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export interface INFT {
  id: number;
  name: string;
  traits: { key: string; value: string }[];
  image?: string | null;
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

export interface Trait {
  key: string;
  value: string;
}

// export async function createInft(payload: {
//   name: string;
//   owner: string;
//   tag: string;
//   cid: string;
//   traits: string; // JSON string
//   description?: string;
//   nfid: string
// }) {
//   // Create FormData to match backend expectations
//   const formData = new FormData();
//   formData.append('name', payload.name);
//   formData.append('owner', payload.owner);
//   formData.append('tag', payload.tag || 'general'); // provide default if empty
//   formData.append('cid', payload.cid);
//   formData.append('traits', payload.traits);
//   if (payload.description) {
//     formData.append('description', payload.description);
//   }
//   formData.append('nfid', nfid);
//   // Create a dummy file since backend expects it
//   const dummyFile = new File([''], 'dummy.txt', { type: 'text/plain' });
//   formData.append('file', dummyFile);

//   const response = await fetch(`${API_BASE}/create_inft`, {
//     method: 'POST',
//     body: formData, // Use FormData instead of JSON
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`Failed to create iNFT: ${response.status} ${errorText}`);
//   }

//   return response.json();
// }
export async function createInft(payload: {
  name: string;
  owner: string;
  tag: string;
  cid: string;
  traits: string; // JSON string
  description?: string;
  nft_id?: string; // Add NFT token ID
}) {
  // Create FormData to match backend expectations
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('owner', payload.owner);
  formData.append('tag', payload.tag || 'general'); // provide default if empty
  formData.append('cid', payload.cid);
  formData.append('traits', payload.traits);
  if (payload.description) {
    formData.append('description', payload.description);
  }
  if (payload.nft_id) {
    formData.append('nft_id', payload.nft_id);
  }

  // Create a dummy file since backend expects it
  const dummyFile = new File([''], 'dummy.txt', { type: 'text/plain' });
  formData.append('file', dummyFile);

  const response = await fetch(`${API_BASE}/create_inft`, {
    method: 'POST',
    body: formData, // Use FormData instead of JSON
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create iNFT: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Alternative version if you want to modify backend to not require file
export async function createInftNoFile(payload: {
  name: string;
  owner: string;
  tag: string;
  cid: string;
  traits: string;
  description?: string;
}) {
  const response = await fetch(`${API_BASE}/create_inft_no_file`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create iNFT: ${response.status} ${errorText}`);
  }

  return response.json();
}

// ---------- Other APIs ----------
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