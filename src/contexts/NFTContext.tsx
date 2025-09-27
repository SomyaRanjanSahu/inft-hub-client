'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { MockINFTContract, contractABI } from '../../utils/contract';
import { convertIPFSUrl } from '@/lib/ipfs';

export interface NFTData {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  traits: { key: string; value: string }[];
  owner: string;
  metadataUri: string;
  encryptedUri: string;
  metadataHash: string;
}

interface NFTContextType {
  allNFTs: NFTData[];
  userNFTs: NFTData[];
  loading: boolean;
  refreshNFTs: () => Promise<void>;
  addNFT: (nft: NFTData) => void;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

export const useNFTs = () => {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error('useNFTs must be used within NFTProvider');
  }
  return context;
};

export const NFTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const [allNFTs, setAllNFTs] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(false);

  // Get next token ID to know how many NFTs have been minted
  const { data: nextTokenId, refetch: refetchNextTokenId } = useReadContract({
    address: MockINFTContract as `0x${string}`,
    abi: contractABI,
    functionName: 'getNextTokenId',
  });

  const fetchNFTMetadata = useCallback(async (tokenUri: string, tokenId: string): Promise<{ name: string; description: string; image: string; attributes: { trait_type: string; value: string }[] }> => {
    try {
      // Handle IPFS URLs
      const fetchUrl = convertIPFSUrl(tokenUri);
      
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const metadata = await response.json();
      
      // Handle image IPFS URLs
      const imageUrl = convertIPFSUrl(metadata.image || '');
      
      return {
        name: metadata.name || `iNFT #${tokenId}`,
        description: metadata.description || '',
        image: imageUrl,
        attributes: metadata.attributes || []
      };
    } catch (error) {
      console.error(`Error fetching metadata for token ${tokenId}:`, error);
      return {
        name: `iNFT #${tokenId}`,
        description: 'Failed to load metadata',
        image: '',
        attributes: []
      };
    }
  }, []);

  const refreshNFTs = useCallback(async () => {
    if (!nextTokenId) {
      console.log('NFT Context: No nextTokenId available');
      return;
    }
    
    setLoading(true);
    console.log('NFT Context: Starting to fetch NFTs, nextTokenId:', nextTokenId);
    try {
      const nfts: NFTData[] = [];
      const maxTokenId = Number(nextTokenId) - 1; // nextTokenId is the next ID to be minted, so current max is -1
      console.log('NFT Context: Will fetch tokens from 1 to', maxTokenId);
      
      // Fetch all NFTs (assuming token IDs start from 1)
      for (let i = 1; i <= maxTokenId; i++) {
        try {
          console.log(`NFT Context: Fetching token ${i}`);
          // Get owner of token
          const ownerResponse = await fetch('/api/contract-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              functionName: 'ownerOf',
              args: [i]
            })
          });
          
          if (!ownerResponse.ok) {
            console.log(`NFT Context: Failed to get owner for token ${i}`);
            continue;
          }
          const ownerData = await ownerResponse.json();
          const owner = ownerData.result;
          console.log(`NFT Context: Token ${i} owner:`, owner);

          // Get token URI
          const uriResponse = await fetch('/api/contract-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              functionName: 'tokenURI',
              args: [i]
            })
          });
          
          if (!uriResponse.ok) continue;
          const uriData = await uriResponse.json();
          const tokenUri = uriData.result;

          // Get encrypted URI
          const encryptedUriResponse = await fetch('/api/contract-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              functionName: 'getEncryptedURI',
              args: [i]
            })
          });
          
          const encryptedUriData = encryptedUriResponse.ok ? await encryptedUriResponse.json() : { result: '' };
          const encryptedUri = encryptedUriData.result || '';

          // Get metadata hash
          const hashResponse = await fetch('/api/contract-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              functionName: 'getMetadataHash',
              args: [i]
            })
          });
          
          const hashData = hashResponse.ok ? await hashResponse.json() : { result: '' };
          const metadataHash = hashData.result || '';

          // Fetch metadata
          const metadata = await fetchNFTMetadata(tokenUri, i.toString());
          
          const nft: NFTData = {
            tokenId: i.toString(),
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            traits: metadata.attributes.map((attr: { trait_type: string; value: string }) => ({
              key: attr.trait_type,
              value: attr.value
            })),
            owner,
            metadataUri: tokenUri,
            encryptedUri,
            metadataHash
          };
          
          console.log(`NFT Context: Successfully fetched NFT ${i}:`, nft);
          nfts.push(nft);
        } catch (error) {
          console.error(`NFT Context: Error fetching NFT ${i}:`, error);
        }
      }
      
      console.log('NFT Context: Final NFTs array:', nfts);
      setAllNFTs(nfts);
    } catch (error) {
      console.error('NFT Context: Error refreshing NFTs:', error);
    } finally {
      setLoading(false);
    }
  }, [nextTokenId, fetchNFTMetadata]);

  const addNFT = useCallback(async (nft: NFTData) => {
    setAllNFTs(prev => [...prev, nft]);
    // Also refresh to get the latest state from blockchain
    await refetchNextTokenId();
  }, [refetchNextTokenId]);

  const userNFTs = allNFTs.filter(nft => 
    address && nft.owner.toLowerCase() === address.toLowerCase()
  );

  useEffect(() => {
    if (nextTokenId) {
      refreshNFTs();
    }
  }, [nextTokenId, refreshNFTs]);

  useEffect(() => {
    refetchNextTokenId();
  }, [refetchNextTokenId]);

  return (
    <NFTContext.Provider value={{
      allNFTs,
      userNFTs,
      loading,
      refreshNFTs,
      addNFT
    }}>
      {children}
    </NFTContext.Provider>
  );
};