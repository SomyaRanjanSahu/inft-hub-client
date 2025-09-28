import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'viem/chains';

export const config = getDefaultConfig({
  appName: 'personaLink',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '9825199dce782234848cbcd1a34296df',
  chains: [sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
