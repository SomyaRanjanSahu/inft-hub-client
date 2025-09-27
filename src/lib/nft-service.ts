import { convertIPFSUrl } from '@/lib/ipfs';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface NFTInfo {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  traits: Array<{
    key: string;
    value: string;
  }>;
  owner: string;
  metadataUri: string;
  encryptedUri?: string;
  metadataHash?: string;
}

export class NFTService {
  /**
   * Fetch NFT data by token ID
   */
  static async fetchNFTById(tokenId: string | number): Promise<NFTInfo | null> {
    try {
      const id = typeof tokenId === 'string' ? parseInt(tokenId) : tokenId;
      
      // Get owner
      const ownerResponse = await fetch('/api/contract-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionName: 'ownerOf',
          args: [id]
        })
      });
      
      if (!ownerResponse.ok) {
        throw new Error(`Failed to fetch owner for token ${id}`);
      }
      
      const ownerData = await ownerResponse.json();
      const owner = ownerData.result;

      // Get token URI
      const uriResponse = await fetch('/api/contract-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionName: 'tokenURI',
          args: [id]
        })
      });
      
      if (!uriResponse.ok) {
        throw new Error(`Failed to fetch URI for token ${id}`);
      }
      
      const uriData = await uriResponse.json();
      const tokenUri = uriData.result;

      // Get encrypted URI (optional)
      let encryptedUri = '';
      try {
        const encryptedUriResponse = await fetch('/api/contract-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            functionName: 'getEncryptedURI',
            args: [id]
          })
        });
        
        if (encryptedUriResponse.ok) {
          const encryptedUriData = await encryptedUriResponse.json();
          encryptedUri = encryptedUriData.result || '';
        }
      } catch (error) {
        console.warn(`Failed to fetch encrypted URI for token ${id}:`, error);
      }

      // Get metadata hash (optional)
      let metadataHash = '';
      try {
        const hashResponse = await fetch('/api/contract-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            functionName: 'getMetadataHash',
            args: [id]
          })
        });
        
        if (hashResponse.ok) {
          const hashData = await hashResponse.json();
          metadataHash = hashData.result || '';
        }
      } catch (error) {
        console.warn(`Failed to fetch metadata hash for token ${id}:`, error);
      }

      // Fetch metadata from IPFS
      const metadata = await this.fetchMetadata(tokenUri, id.toString());
      
      return {
        tokenId: id.toString(),
        name: metadata.name,
        description: metadata.description,
        image: convertIPFSUrl(metadata.image),
        traits: metadata.attributes.map(attr => ({
          key: attr.trait_type,
          value: attr.value
        })),
        owner,
        metadataUri: tokenUri,
        encryptedUri,
        metadataHash
      };
      
    } catch (error) {
      console.error(`Error fetching NFT ${tokenId}:`, error);
      return null;
    }
  }

  /**
   * Fetch multiple NFTs by token IDs
   */
  static async fetchNFTsByIds(tokenIds: Array<string | number>): Promise<NFTInfo[]> {
    const promises = tokenIds.map(id => this.fetchNFTById(id));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<NFTInfo> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  /**
   * Fetch all NFTs (gets next token ID and fetches all)
   */
  static async fetchAllNFTs(): Promise<NFTInfo[]> {
    try {
      // Get next token ID to know how many NFTs exist
      const nextTokenIdResponse = await fetch('/api/contract-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionName: 'getNextTokenId',
          args: []
        })
      });
      
      if (!nextTokenIdResponse.ok) {
        throw new Error('Failed to fetch next token ID');
      }
      
      const nextTokenIdData = await nextTokenIdResponse.json();
      const nextTokenId = parseInt(nextTokenIdData.result);
      
      if (nextTokenId <= 1) {
        return []; // No NFTs minted yet
      }
      
      // Create array of token IDs from 1 to nextTokenId-1
      const tokenIds = Array.from({ length: nextTokenId - 1 }, (_, i) => i + 1);
      
      return await this.fetchNFTsByIds(tokenIds);
      
    } catch (error) {
      console.error('Error fetching all NFTs:', error);
      return [];
    }
  }

  /**
   * Fetch NFTs owned by a specific address
   */
  static async fetchNFTsByOwner(ownerAddress: string): Promise<NFTInfo[]> {
    const allNFTs = await this.fetchAllNFTs();
    return allNFTs.filter(nft => 
      nft.owner.toLowerCase() === ownerAddress.toLowerCase()
    );
  }

  /**
   * Fetch metadata from IPFS URL
   */
  private static async fetchMetadata(tokenUri: string, tokenId: string): Promise<NFTMetadata> {
    try {
      const fetchUrl = convertIPFSUrl(tokenUri);
      
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const metadata = await response.json();
      
      return {
        name: metadata.name || `iNFT #${tokenId}`,
        description: metadata.description || '',
        image: metadata.image || '',
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
  }

  /**
   * Create NFT info object from raw data (utility function)
   */
  static createNFTInfo(data: {
    tokenId: string;
    name: string;
    description: string;
    image: string;
    traits: Array<{ key: string; value: string }>;
    owner: string;
    metadataUri: string;
    encryptedUri?: string;
    metadataHash?: string;
  }): NFTInfo {
    return {
      tokenId: data.tokenId,
      name: data.name,
      description: data.description,
      image: convertIPFSUrl(data.image),
      traits: data.traits,
      owner: data.owner,
      metadataUri: data.metadataUri,
      encryptedUri: data.encryptedUri,
      metadataHash: data.metadataHash
    };
  }
}