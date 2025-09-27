# NFT Data Utilities - Easy NFT Fetching & Display

## Overview

I've created a comprehensive NFT data management system that makes it easy to fetch and display NFT information. The system consists of:

1. **NFTService** - A service class for fetching NFT data
2. **NFTInfoDisplay** - A reusable component for displaying NFT information
3. **useNFTData** - A React hook for managing NFT state

## Files Structure

```
src/
├── lib/
│   ├── nft-service.ts        # Core NFT fetching service
│   └── ipfs.ts              # IPFS URL utilities
├── app/
│   ├── component/
│   │   └── NFTInfoDisplay.tsx # Reusable NFT display component
│   └── nft-demo/
│       └── page.tsx         # Demo page showing all features
```

## 🚀 Quick Start

### 1. Using NFTService (Direct API)

```typescript
import { NFTService } from '@/lib/nft-service';

// Fetch single NFT
const nft = await NFTService.fetchNFTById('1');
console.log(nft);
// Output: { tokenId: '1', name: 'Hello', description: '...', image: '...', traits: [...], owner: '0x...', ... }

// Fetch all NFTs
const allNFTs = await NFTService.fetchAllNFTs();

// Fetch NFTs by owner
const userNFTs = await NFTService.fetchNFTsByOwner('0x1234...');

// Fetch multiple specific NFTs
const specificNFTs = await NFTService.fetchNFTsByIds(['1', '2', '3']);
```

### 2. Using NFTInfoDisplay Component

```tsx
import NFTInfoDisplay from '@/app/component/NFTInfoDisplay';

// Auto-fetch by token ID
<NFTInfoDisplay tokenId="1" showFullDetails={true} />

// Using pre-fetched data
<NFTInfoDisplay nftData={nftObject} showFullDetails={false} />

// With custom styling
<NFTInfoDisplay 
  tokenId="1" 
  className="border border-blue-500" 
  showFullDetails={true} 
/>
```

### 3. Using useNFTData Hook

```tsx
import { useNFTData } from '@/app/component/NFTInfoDisplay';

function MyComponent() {
  const { nft, loading, error, refetch, fetchNFT } = useNFTData('1');
  
  if (loading) return <div>Loading NFT...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!nft) return <div>NFT not found</div>;
  
  return (
    <div>
      <h1>{nft.name}</h1>
      <p>{nft.description}</p>
      <button onClick={refetch}>Refresh</button>
      <button onClick={() => fetchNFT('2')}>Load NFT #2</button>
    </div>
  );
}
```

## 📋 NFT Data Structure

```typescript
interface NFTInfo {
  tokenId: string;           // "1"
  name: string;             // "Hello"
  description: string;      // Full description text
  image: string;           // IPFS URL converted to gateway URL
  traits: Array<{          // Parsed attributes
    key: string;           // trait_type
    value: string;         // trait value
  }>;
  owner: string;           // Owner wallet address
  metadataUri: string;     // Original metadata URI
  encryptedUri?: string;   // Optional encrypted URI
  metadataHash?: string;   // Optional metadata hash
}
```

## 🎯 Key Features

### ✅ **Smart IPFS Handling**
- Automatically converts `ipfs://` URLs to working gateway URLs
- Supports multiple IPFS gateways (Pinata, IPFS.io, Cloudflare, etc.)
- Handles both direct IPFS hashes and full URLs

### ✅ **Error Handling**
- Graceful fallbacks for failed API calls
- Detailed error messages
- Retry mechanisms built-in

### ✅ **Performance Optimized**
- Batch fetching for multiple NFTs
- Efficient caching with React hooks
- Loading states and progress indicators

### ✅ **Flexible Display Options**
- Compact view (basic info + limited traits)
- Full detail view (all metadata, URIs, hashes)
- Customizable styling
- Built-in action buttons (View Metadata, Copy Data)

## 🔧 Component Props

### NFTInfoDisplay Props
```typescript
interface NFTInfoDisplayProps {
  tokenId?: string | number;    // Auto-fetch by token ID
  nftData?: NFTInfo;           // Use pre-fetched data
  showFullDetails?: boolean;   // Show all metadata (default: false)
  className?: string;          // Custom CSS classes
}
```

### useNFTData Hook Returns
```typescript
{
  nft: NFTInfo | null;        // Current NFT data
  loading: boolean;           // Loading state
  error: string | null;       // Error message
  refetch: () => void;        // Refetch current NFT
  fetchNFT: (id) => void;     // Fetch different NFT
}
```

## 🎨 Usage Examples

### Example 1: Simple NFT Display
```tsx
// Just show an NFT card with basic info
<NFTInfoDisplay tokenId="1" />
```

### Example 2: Full NFT Details Modal
```tsx
// Show complete NFT information
<NFTInfoDisplay 
  tokenId="1" 
  showFullDetails={true}
  className="max-w-md mx-auto"
/>
```

### Example 3: NFT Gallery
```tsx
function NFTGallery() {
  const [nfts, setNFTs] = useState([]);
  
  useEffect(() => {
    NFTService.fetchAllNFTs().then(setNFTs);
  }, []);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {nfts.map(nft => (
        <NFTInfoDisplay 
          key={nft.tokenId}
          nftData={nft}
          showFullDetails={false}
        />
      ))}
    </div>
  );
}
```

### Example 4: Owner Dashboard
```tsx
function OwnerDashboard({ address }) {
  const [userNFTs, setUserNFTs] = useState([]);
  
  useEffect(() => {
    if (address) {
      NFTService.fetchNFTsByOwner(address).then(setUserNFTs);
    }
  }, [address]);
  
  return (
    <div>
      <h2>Your NFTs ({userNFTs.length})</h2>
      {userNFTs.map(nft => (
        <NFTInfoDisplay 
          key={nft.tokenId}
          nftData={nft}
          showFullDetails={true}
        />
      ))}
    </div>
  );
}
```

## 🚀 Demo Page

Visit `/nft-demo` to see all features in action:
- Single NFT fetching with token ID input
- Batch operations (fetch all, fetch by owner)
- Live data display with both component and raw JSON
- Interactive examples and code snippets

## 🔄 Integration with Existing Code

The new utilities are designed to integrate seamlessly with your existing NFTContext:

```tsx
// Replace complex context usage
const { allNFTs, loading } = useNFTs();

// With simple service calls
const [nfts, setNFTs] = useState([]);
useEffect(() => {
  NFTService.fetchAllNFTs().then(setNFTs);
}, []);
```

## 🎯 Benefits

1. **Simplified Data Fetching**: One-line calls to get NFT data
2. **Consistent Data Structure**: Standardized NFTInfo interface
3. **Better Error Handling**: Graceful failures with meaningful messages
4. **Reusable Components**: Drop-in NFT display components
5. **Performance**: Optimized fetching and caching
6. **Maintainable**: Clean separation of concerns
7. **Type Safe**: Full TypeScript support

## 🔗 Navigation

- **Dashboard**: Added "NFT Utils Demo" button to main dashboard
- **Manage Page**: Added "NFT Utils Demo" button to manage page
- **Direct Access**: Visit `/nft-demo` directly

This system makes it incredibly easy to work with NFT data throughout your application!