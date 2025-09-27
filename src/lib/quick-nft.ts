"use client";

import React from 'react';
import { NFTService, NFTInfo } from '@/lib/nft-service';

/**
 * QuickNFT - Ultra-simple NFT data fetcher
 * 
 * Usage:
 * - QuickNFT.get('1') → Returns NFTInfo object
 * - QuickNFT.getAll() → Returns all NFTs
 * - QuickNFT.getByOwner('0x...') → Returns owner's NFTs
 */
export class QuickNFT {
  /**
   * Get single NFT data
   * @param tokenId - Token ID to fetch
   * @returns Promise<NFTInfo | null>
   * 
   * @example
   * const nft = await QuickNFT.get('1');
   * console.log(nft.name, nft.description, nft.traits);
   */
  static async get(tokenId: string | number): Promise<NFTInfo | null> {
    return await NFTService.fetchNFTById(tokenId);
  }

  /**
   * Get all NFTs
   * @returns Promise<NFTInfo[]>
   * 
   * @example
   * const allNFTs = await QuickNFT.getAll();
   * console.log(`Found ${allNFTs.length} NFTs`);
   */
  static async getAll(): Promise<NFTInfo[]> {
    return await NFTService.fetchAllNFTs();
  }

  /**
   * Get NFTs by owner address
   * @param address - Owner wallet address
   * @returns Promise<NFTInfo[]>
   * 
   * @example
   * const userNFTs = await QuickNFT.getByOwner('0x1234...');
   * console.log(`User owns ${userNFTs.length} NFTs`);
   */
  static async getByOwner(address: string): Promise<NFTInfo[]> {
    return await NFTService.fetchNFTsByOwner(address);
  }

  /**
   * Get multiple NFTs by token IDs
   * @param tokenIds - Array of token IDs
   * @returns Promise<NFTInfo[]>
   * 
   * @example
   * const nfts = await QuickNFT.getMultiple(['1', '2', '3']);
   */
  static async getMultiple(tokenIds: Array<string | number>): Promise<NFTInfo[]> {
    return await NFTService.fetchNFTsByIds(tokenIds);
  }

  /**
   * Print NFT data to console (for debugging)
   * @param tokenId - Token ID to fetch and print
   * 
   * @example
   * await QuickNFT.print('1'); // Logs NFT data to console
   */
  static async print(tokenId: string | number): Promise<void> {
    const nft = await this.get(tokenId);
    if (nft) {
      console.log(`🎨 NFT #${nft.tokenId}: ${nft.name}`);
      console.log(`📝 Description: ${nft.description}`);
      console.log(`🖼️  Image: ${nft.image}`);
      console.log(`👤 Owner: ${nft.owner}`);
      console.log(`🏷️  Traits:`, nft.traits);
      console.log(`📄 Raw Data:`, nft);
    } else {
      console.log(`❌ NFT #${tokenId} not found`);
    }
  }

  /**
   * Create a simple object with just the essential data
   * @param tokenId - Token ID to fetch
   * @returns Promise<SimpleNFT | null>
   * 
   * @example
   * const simple = await QuickNFT.getSimple('1');
   * // Returns: { id: '1', name: 'Hello', image: '...', owner: '0x...' }
   */
  static async getSimple(tokenId: string | number): Promise<{
    id: string;
    name: string;
    image: string;
    owner: string;
    description: string;
  } | null> {
    const nft = await this.get(tokenId);
    if (!nft) return null;

    return {
      id: nft.tokenId,
      name: nft.name,
      image: nft.image,
      owner: nft.owner,
      description: nft.description
    };
  }
}

/**
 * React Hook for quick NFT access
 * @param tokenId - Token ID to fetch
 * @returns { nft, loading, error }
 * 
 * @example
 * function MyComponent() {
 *   const { nft, loading, error } = useQuickNFT('1');
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!nft) return <div>Not found</div>;
 *   
 *   return <div>{nft.name}</div>;
 * }
 */
export function useQuickNFT(tokenId?: string | number) {
  const [nft, setNft] = React.useState<NFTInfo | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!tokenId) return;

    setLoading(true);
    setError(null);

    QuickNFT.get(tokenId)
      .then(result => {
        setNft(result);
        if (!result) {
          setError(`NFT #${tokenId} not found`);
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tokenId]);

  return { nft, loading, error };
}

// Export for global access (can be used from browser console)
if (typeof window !== 'undefined') {
  (window as typeof window & { QuickNFT: typeof QuickNFT }).QuickNFT = QuickNFT;
}