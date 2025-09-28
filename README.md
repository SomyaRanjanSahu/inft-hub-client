# iNFT Hub - Intelligent NFTs

A Next.js application for creating and managing Intelligent NFTs (iNFTs) with AI traits, built with wagmi, viem, and IPFS storage.

## Features

- 🔗 **Web3 Integration**: Connect wallet using RainbowKit and wagmi
- 🖼️ **NFT Minting**: Mint NFTs with custom traits and metadata
- 📁 **IPFS Storage**: Decentralized file storage using Pinata
- 🎨 **Dynamic UI**: Beautiful NFT cards with trait visualization
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔍 **NFT Gallery**: View all your minted NFTs in a dashboard

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Web3**: wagmi, viem, RainbowKit
- **Storage**: IPFS via Pinata
- **Contract**: ERC-721 based Intelligent NFT contract

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd inft-hub-client
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Pinata IPFS Configuration
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=your_pinata_gateway_url

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 3. Get Required API Keys

#### Pinata (IPFS Storage)
1. Sign up at [Pinata.cloud](https://pinata.cloud/)
2. Go to [API Keys](https://app.pinata.cloud/developers/api-keys)
3. Click "New Key" and configure:
   - **Admin**: Enable if you want full access
   - **Permissions**: At minimum, enable:
     - ✅ `pinFileToIPFS` (Required for image uploads)
     - ✅ `pinJSONToIPFS` (Required for metadata uploads)
   - **Name**: Give it a descriptive name like "iNFT Hub API Key"
4. Copy the JWT token to `NEXT_PUBLIC_PINATA_JWT`
5. Use your gateway URL (usually `gateway.pinata.cloud`) for `NEXT_PUBLIC_PINATA_GATEWAY`

**⚠️ Important**: The JWT token is only shown once. Save it immediately!

#### WalletConnect
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID to `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### 4. Contract Configuration

The contract is already configured in `utils/contract.ts`. Make sure the:
- Contract address matches your deployed INFT contract
- ABI is up to date with your contract

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Smart Contract

The application works with an ERC-721 based Intelligent NFT contract that includes:

- **Mint Function**: Creates new NFTs with metadata and traits
- **IPFS Integration**: Stores metadata and images on IPFS
- **Trait System**: Supports custom attributes for AI interaction
- **Authorization**: Owner-based permissions for NFT usage

### Contract Functions Used

- `mint(to, tokenURI, encryptedURI, metadataHash)` - Mint new NFTs
- `tokenURI(tokenId)` - Get metadata URI for an NFT
- `ownerOf(tokenId)` - Get owner of an NFT
- `balanceOf(owner)` - Get NFT count for an address
- `totalSupply()` - Get total minted NFTs

## Usage

### Creating an iNFT

1. **Connect Wallet**: Click "Connect Wallet" on the home page
2. **Fill Details**: 
   - Enter NFT name and description
   - Add 1-5 traits with descriptions
   - Upload an image file
3. **Mint**: Click "Create iNFT" and approve the transaction
4. **Success**: View your minted NFT in the popup

### Viewing NFTs

1. **Dashboard**: Navigate to "View My iNFTs" from the home page
2. **Gallery**: See all your minted NFTs with their traits
3. **Details**: Each NFT shows name, image, and trait badges

## File Structure

```
src/
├── app/
│   ├── component/
│   │   └── INFTCard.tsx          # NFT display component
│   ├── create-inft/
│   │   └── page.tsx              # NFT creation form
│   ├── dashboard/
│   │   └── page.tsx              # NFT gallery
│   ├── api/
│   │   └── contract-read/
│   │       └── route.ts          # Contract reading API
│   └── page.tsx                  # Home page
├── lib/
│   ├── hooks/
│   │   ├── useMintINFT.ts        # Minting hook
│   │   └── useNFTs.ts            # NFT fetching hooks
│   ├── ipfs.ts                   # IPFS utilities
│   └── wagmi.ts                  # Web3 configuration
├── components/
│   └── providers.tsx             # Web3 providers
└── utils/
    └── contract.ts               # Contract ABI and address
```

## Features Explained

### IPFS Integration
- Images and metadata are stored on IPFS via Pinata
- Metadata follows ERC-721 standard with custom attributes
- Images are retrieved using IPFS gateways

### Web3 Integration
- Uses wagmi hooks for contract interactions
- RainbowKit for wallet connection
- Support for multiple chains (Mainnet, Sepolia, Polygon, etc.)

### NFT Traits System
- Each NFT can have 1-5 custom traits
- Traits are stored as ERC-721 attributes
- Visual representation with color-coded badges

## Troubleshooting

### Common Issues

1. **Transaction Fails**: Ensure you have enough ETH for gas fees
2. **IPFS Upload Fails**: Check your Pinata API credentials
3. **NFTs Not Loading**: Verify contract address and network
4. **Wallet Connection Issues**: Check WalletConnect Project ID

### Error Messages

#### IPFS/Pinata Errors
- **"NO_SCOPES_FOUND"**: Your Pinata API key lacks required permissions
  - Solution: Create a new API key with `pinFileToIPFS` and `pinJSONToIPFS` permissions
- **"Authentication failed"**: Invalid or expired Pinata JWT token
  - Solution: Generate a new API key from Pinata dashboard
- **"Upload limit exceeded"**: You've reached your Pinata account limits
  - Solution: Upgrade your Pinata plan or delete unused files

#### Web3 Errors
- **"Contract read error"**: Verify contract address and ABI
- **"Transaction reverted"**: Check contract permissions and parameters
- **"Insufficient funds"**: Ensure you have enough ETH for gas fees

#### Connection Errors
- **"Wallet connection failed"**: Check WalletConnect Project ID
- **"Network mismatch"**: Switch to the correct network in your wallet

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request