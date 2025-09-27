// Test script to check contract connectivity
import { sepolia } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { MockINFTContract, contractABI } from '../utils/contract.js';

const client = createPublicClient({
  chain: sepolia,
  transport: http()
});

async function testContract() {
  try {
    console.log('Testing contract at:', MockINFTContract);
    
    // Test getNextTokenId
    const nextTokenId = await client.readContract({
      address: MockINFTContract,
      abi: contractABI,
      functionName: 'getNextTokenId',
    });
    console.log('Next Token ID:', nextTokenId);
    
    // Test if we have any tokens
    if (Number(nextTokenId) > 1) {
      console.log('Found', Number(nextTokenId) - 1, 'tokens');
      
      // Test reading first token
      try {
        const owner = await client.readContract({
          address: MockINFTContract,
          abi: contractABI,
          functionName: 'ownerOf',
          args: [1n],
        });
        console.log('Token 1 owner:', owner);
        
        const tokenURI = await client.readContract({
          address: MockINFTContract,
          abi: contractABI,
          functionName: 'tokenURI',
          args: [1n],
        });
        console.log('Token 1 URI:', tokenURI);
      } catch (error) {
        console.log('Error reading token 1:', error.message);
      }
    } else {
      console.log('No tokens found');
    }
    
  } catch (error) {
    console.error('Contract test failed:', error);
  }
}

testContract();