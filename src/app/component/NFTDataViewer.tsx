"use client";

import React, { useState } from 'react';
import { QuickNFT, useQuickNFT } from '@/lib/quick-nft';

/**
 * NFT Data Viewer - Shows the exact structure you requested
 */
export default function NFTDataViewer() {
  const [tokenId, setTokenId] = useState('1');
  const [fetchedData, setFetchedData] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(false);

  // Using the hook
  const { nft: hookNFT, loading: hookLoading, error } = useQuickNFT(tokenId);

  const handleQuickFetch = async () => {
    setLoading(true);
    try {
      const data = await QuickNFT.get(tokenId);
      setFetchedData(data);
      
      // Also print to console for debugging
      await QuickNFT.print(tokenId);
    } catch (err) {
      console.error('Error fetching NFT:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAll = async () => {
    setLoading(true);
    try {
      const allNFTs = await QuickNFT.getAll();
      setFetchedData(allNFTs);
      console.log('🎨 All NFTs:', allNFTs);
    } catch (err) {
      console.error('Error fetching all NFTs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchByOwner = async () => {
    const address = prompt('Enter owner address:');
    if (!address) return;

    setLoading(true);
    try {
      const ownerNFTs = await QuickNFT.getByOwner(address);
      setFetchedData(ownerNFTs);
      console.log(`👤 NFTs owned by ${address}:`, ownerNFTs);
    } catch (err) {
      console.error('Error fetching NFTs by owner:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">NFT Data Structure Viewer</h1>
      
      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Fetch NFT Data</h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Token ID"
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
          <button
            onClick={handleQuickFetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Fetch NFT'}
          </button>
          <button
            onClick={handleFetchAll}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Fetch All NFTs
          </button>
          <button
            onClick={handleFetchByOwner}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Fetch by Owner
          </button>
        </div>

        <div className="text-sm text-gray-400">
          <p>💡 <strong>Tip:</strong> Open browser console to see detailed logs!</p>
          <p>🔧 <strong>Global Access:</strong> Use <code>QuickNFT.get(&apos;1&apos;)</code> in console</p>
        </div>
      </div>

      {/* Data Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hook Result */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-400">Using React Hook</h3>
          {hookLoading && <p className="text-gray-400">Loading with hook...</p>}
          {error && <p className="text-red-400">Error: {error}</p>}
          {hookNFT && (
            <div>
              <div className="bg-gray-900 p-4 rounded mb-4">
                <h4 className="font-medium text-green-400 mb-2">Exact Structure You Requested:</h4>
                <pre className="text-xs overflow-auto">
{`{
  tokenId: '${hookNFT.tokenId}',
  name: '${hookNFT.name}',
  description: '${hookNFT.description.substring(0, 50)}${hookNFT.description.length > 50 ? '...' : ''}',
  image: '${hookNFT.image.substring(0, 50)}...',
  traits: Array(${hookNFT.traits.length}),
  owner: '${hookNFT.owner.substring(0, 10)}...',
  metadataUri: '${hookNFT.metadataUri.substring(0, 30)}...',
  encryptedUri: '${hookNFT.encryptedUri?.substring(0, 30) || 'null'}...',
  metadataHash: '${hookNFT.metadataHash?.substring(0, 20) || 'null'}...'
}`}
                </pre>
              </div>
              <pre className="bg-gray-900 p-4 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(hookNFT, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Direct Fetch Result */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-green-400">Direct API Result</h3>
          {fetchedData && (
            <div>
              <div className="bg-gray-700 p-3 rounded mb-4 text-sm">
                <p className="text-yellow-400">📊 Data Type: {Array.isArray(fetchedData) ? `Array[${fetchedData.length}]` : 'Single NFT'}</p>
                {Array.isArray(fetchedData) && (
                  <p className="text-blue-400">🎯 Sample: {fetchedData.length > 0 ? fetchedData[0].name : 'No items'}</p>
                )}
              </div>
              <pre className="bg-gray-900 p-4 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(fetchedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Usage Examples */}
      <div className="bg-gray-800 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold mb-3 text-purple-400">Quick Usage Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-yellow-400 mb-2">JavaScript/TypeScript:</h4>
            <pre className="bg-gray-900 p-3 rounded text-xs">
{`// Get single NFT
const nft = await QuickNFT.get('1');
console.log(nft.name, nft.traits);

// Get all NFTs
const all = await QuickNFT.getAll();

// Get simple format
const simple = await QuickNFT.getSimple('1');
// Returns: { id, name, image, owner, description }`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-400 mb-2">React Hook:</h4>
            <pre className="bg-gray-900 p-3 rounded text-xs">
{`function MyComponent() {
  const { nft, loading, error } = useQuickNFT('1');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{nft?.name}</div>;
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Browser Console Commands */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold mb-3 text-white">🖥️ Browser Console Commands</h3>
        <div className="text-sm space-y-2">
          <p><code className="bg-black/30 px-2 py-1 rounded">QuickNFT.get('1')</code> - Get NFT #1</p>
          <p><code className="bg-black/30 px-2 py-1 rounded">QuickNFT.getAll()</code> - Get all NFTs</p>
          <p><code className="bg-black/30 px-2 py-1 rounded">QuickNFT.print('1')</code> - Print NFT data nicely</p>
          <p><code className="bg-black/30 px-2 py-1 rounded">QuickNFT.getSimple('1')</code> - Get simplified format</p>
        </div>
      </div>
    </div>
  );
}