"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { NFTService, NFTInfo } from '@/lib/nft-service';
import INFTCard from './INFTCard';

interface NFTInfoDisplayProps {
  tokenId?: string | number;
  nftData?: NFTInfo;
  showFullDetails?: boolean;
  className?: string;
}

/**
 * NFTInfoDisplay - A reusable component to display NFT information
 * Can either take a tokenId to fetch data automatically, or accept pre-fetched nftData
 */
export default function NFTInfoDisplay({ 
  tokenId, 
  nftData, 
  showFullDetails = false,
  className = "" 
}: NFTInfoDisplayProps) {
  const [nft, setNft] = useState<NFTInfo | null>(nftData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTData = useCallback(async () => {
    if (!tokenId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const nftInfo = await NFTService.fetchNFTById(tokenId);
      if (nftInfo) {
        setNft(nftInfo);
      } else {
        setError(`NFT with token ID ${tokenId} not found`);
      }
    } catch (err) {
      setError(`Failed to fetch NFT data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    if (tokenId && !nftData) {
      fetchNFTData();
    }
  }, [tokenId, nftData, fetchNFTData]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-2"></div>
          <p className="text-gray-400">Loading NFT data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-500 rounded-lg p-4 ${className}`}>
        <p className="text-red-400">{error}</p>
        {tokenId && (
          <button
            onClick={fetchNFTData}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!nft) {
    return (
      <div className={`bg-gray-800 border border-gray-600 rounded-lg p-4 ${className}`}>
        <p className="text-gray-400">No NFT data available</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      {/* NFT Card */}
      <div className="flex justify-center p-4">
        <div className="w-64">
          <INFTCard 
            name={nft.name}
            image={nft.image}
            traits={nft.traits}
          />
        </div>
      </div>

      {/* Basic Info */}
      <div className="p-4 border-t border-gray-700">
        <h3 className="text-xl font-bold text-white mb-2">{nft.name}</h3>
        <p className="text-sm text-gray-300 mb-2">Token ID: #{nft.tokenId}</p>
        
        {nft.description && (
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-200 mb-1">Description:</h4>
            <p className="text-sm text-gray-400 break-words">
              {nft.description.length > 100 && !showFullDetails
                ? `${nft.description.substring(0, 100)}...`
                : nft.description
              }
            </p>
          </div>
        )}

        {/* Traits */}
        {nft.traits.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-200 mb-2">Traits:</h4>
            <div className="grid grid-cols-2 gap-2">
              {nft.traits.slice(0, showFullDetails ? undefined : 4).map((trait, index) => (
                <div key={index} className="bg-gray-700 p-2 rounded">
                  <div className="text-xs font-medium text-gray-300">{trait.key}</div>
                  <div className="text-xs text-gray-400">{trait.value}</div>
                </div>
              ))}
            </div>
            {!showFullDetails && nft.traits.length > 4 && (
              <p className="text-xs text-gray-500 mt-1">
                +{nft.traits.length - 4} more traits
              </p>
            )}
          </div>
        )}

        {/* Owner Info */}
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-200 mb-1">Owner:</h4>
          <p className="text-xs font-mono text-gray-400 break-all">
            {nft.owner}
          </p>
        </div>

        {/* Full Details (expandable) */}
        {showFullDetails && (
          <div className="space-y-3 border-t border-gray-700 pt-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-200 mb-1">Metadata URI:</h4>
              <p className="text-xs text-gray-400 break-all">{nft.metadataUri}</p>
            </div>
            
            {nft.encryptedUri && (
              <div>
                <h4 className="text-sm font-semibold text-gray-200 mb-1">Encrypted URI:</h4>
                <p className="text-xs text-gray-400 break-all">{nft.encryptedUri}</p>
              </div>
            )}
            
            {nft.metadataHash && (
              <div>
                <h4 className="text-sm font-semibold text-gray-200 mb-1">Metadata Hash:</h4>
                <p className="text-xs font-mono text-gray-400 break-all">{nft.metadataHash}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-700 flex gap-2">
        <button
          onClick={() => {
            const url = nft.metadataUri.startsWith('ipfs://') 
              ? nft.metadataUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
              : nft.metadataUri;
            window.open(url, '_blank');
          }}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        >
          View Metadata
        </button>
        
        <button
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(nft, null, 2));
            alert('NFT data copied to clipboard!');
          }}
          className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
        >
          Copy Data
        </button>
      </div>
    </div>
  );
}

/**
 * Hook to easily fetch NFT data
 */
export function useNFTData(tokenId?: string | number) {
  const [nft, setNft] = useState<NFTInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNFT = useCallback(async (id?: string | number) => {
    const targetId = id || tokenId;
    if (!targetId) return;

    setLoading(true);
    setError(null);
    
    try {
      const nftInfo = await NFTService.fetchNFTById(targetId);
      setNft(nftInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    if (tokenId) {
      fetchNFT();
    }
  }, [tokenId, fetchNFT]);

  return {
    nft,
    loading,
    error,
    refetch: () => fetchNFT(),
    fetchNFT
  };
}