import { getDefaultConfig } from '@rainbow-me/rainbowkit';
// @ts-ignore
import { mainnet, polygon, optimism, arbitrum, base } from 'viem/chains';

export const config = getDefaultConfig({
  appName: 'iNFT Hub',
  projectId: 'YOUR_PROJECT_ID', // You'll need to get this from WalletConnect Cloud
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
