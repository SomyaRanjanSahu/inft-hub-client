"use client";

import React, { useState } from 'react';
import NFTInfoDisplay, { useNFTData } from '../component/NFTInfoDisplay';
import { NFTService, NFTInfo } from '@/lib/nft-service';

export default function NFTDemoPage() {
  const [tokenId, setTokenId] = useState<string>('1');
  const [allNFTs, setAllNFTs] = useState<NFTInfo[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Example of using the hook
  const { nft: hookNFT, loading: hookLoading, error: hookError, refetch } = useNFTData(tokenId);

  const handleFetchAll = async () => {
    setLoading(true);
    try {
      const nfts = await NFTService.fetchAllNFTs();
      setAllNFTs(nfts);
    } catch (error) {
      console.error('Error fetching all NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchByOwner = async () => {
    const address = prompt('Enter owner address:');
    if (!address) return;
    
    setLoading(true);
    try {
      const nfts = await NFTService.fetchNFTsByOwner(address);
      setAllNFTs(nfts);
    } catch (error) {
      console.error('Error fetching NFTs by owner:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">NFT Data Utilities Demo</h1>
        
        {/* Single NFT Fetch */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Fetch Single NFT</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Enter Token ID"
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <button
              onClick={refetch}
              disabled={hookLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {hookLoading ? 'Loading...' : 'Fetch NFT'}
            </button>
          </div>
          
          {hookError && (
            <div className="bg-red-900/20 border border-red-500 rounded p-4 mb-4">
              <p className="text-red-400">Error: {hookError}</p>
            </div>
          )}
          
          {hookNFT && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Component Display */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Component Display:</h3>
                <NFTInfoDisplay nftData={hookNFT} showFullDetails={true} />
              </div>
              
              {/* Raw Data */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Raw Data:</h3>
                <pre className="bg-gray-800 p-4 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(hookNFT, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Batch Operations */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Batch Operations</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={handleFetchAll}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch All NFTs'}
            </button>
            <button
              onClick={handleFetchByOwner}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch NFTs by Owner'}
            </button>
            <button
              onClick={() => setAllNFTs([])}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>
          
          {allNFTs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Found {allNFTs.length} NFTs:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allNFTs.map((nft) => (
                  <NFTInfoDisplay
                    key={nft.tokenId}
                    nftData={nft}
                    showFullDetails={false}
                    className="border border-gray-600"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Usage Examples */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Usage Examples</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-green-400 mb-2">1. Using the Service directly:</h3>
              <pre className="bg-gray-900 p-3 rounded overflow-x-auto text-xs">
{`import { NFTService } from '@/lib/nft-service';

// Fetch single NFT
const nft = await NFTService.fetchNFTById('1');

// Fetch all NFTs
const allNFTs = await NFTService.fetchAllNFTs();

// Fetch NFTs by owner
const ownerNFTs = await NFTService.fetchNFTsByOwner('0x...');`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">2. Using the Component:</h3>
              <pre className="bg-gray-900 p-3 rounded overflow-x-auto text-xs">
{`import NFTInfoDisplay from '@/app/component/NFTInfoDisplay';

// With token ID (auto-fetch)
<NFTInfoDisplay tokenId="1" showFullDetails={true} />

// With pre-fetched data
<NFTInfoDisplay nftData={nftObject} showFullDetails={false} />`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">3. Using the Hook:</h3>
              <pre className="bg-gray-900 p-3 rounded overflow-x-auto text-xs">
{`import { useNFTData } from '@/app/component/NFTInfoDisplay';

function MyComponent() {
  const { nft, loading, error, refetch } = useNFTData('1');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!nft) return <div>No NFT found</div>;
  
  return <div>{nft.name}</div>;
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}