export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
}

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

export const uploadImageToPinata = async (file: File): Promise<string> => {
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }

  const data: PinataResponse = await response.json();
  return `https://${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`;
};

export const uploadMetadataToPinata = async (metadata: NFTMetadata): Promise<string> => {
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT is not configured');
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    throw new Error(`Failed to upload metadata: ${response.statusText}`);
  }

  const data: PinataResponse = await response.json();
  return `https://${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`;
};