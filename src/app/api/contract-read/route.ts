import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { MockINFTContract, contractABI } from '../../../../utils/contract';

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

export async function POST(request: NextRequest) {
  try {
    const { functionName, args = [] } = await request.json();

    const result = await publicClient.readContract({
      address: MockINFTContract as `0x${string}`,
      abi: contractABI,
      functionName,
      args
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Contract read error:', error);
    return NextResponse.json(
      { error: 'Failed to read from contract' },
      { status: 500 }
    );
  }
}