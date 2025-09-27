/**
 * Utility functions for handling IPFS URLs and image sources
 */

/**
 * Convert IPFS URLs to a supported gateway URL
 */
export function convertIPFSUrl(url: string): string {
  if (!url) return '';
  
  // If it's already a supported gateway URL, return as is
  if (url.includes('gateway.pinata.cloud') || 
      url.includes('mypinata.cloud') || 
      url.includes('ipfs.io') || 
      url.includes('cloudflare-ipfs.com') ||
      url.includes('dweb.link')) {
    return url;
  }
  
  // Convert ipfs:// URLs to gateway URL
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  }
  
  // If it's already an HTTP/HTTPS URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Assume it's an IPFS hash and prepend gateway
  return `https://gateway.pinata.cloud/ipfs/${url}`;
}

/**
 * Check if a URL is from a configured image host
 */
export function isConfiguredImageHost(url: string): boolean {
  const configuredHosts = [
    'gateway.pinata.cloud',
    'bronze-occasional-caterpillar-540.mypinata.cloud',
    'ipfs.io',
    'cloudflare-ipfs.com',
    'dweb.link'
  ];
  
  return configuredHosts.some(host => url.includes(host));
}

/**
 * Get a fallback URL if the original URL is not from a configured host
 */
export function getSafeImageUrl(url: string): string {
  if (!url) return '';
  
  // Convert IPFS URLs to supported gateway
  const convertedUrl = convertIPFSUrl(url);
  
  // If still not a configured host, try to extract IPFS hash and use Pinata
  if (!isConfiguredImageHost(convertedUrl)) {
    // Try to extract IPFS hash from various URL formats
    const ipfsHashMatch = convertedUrl.match(/\b(Qm[1-9A-HJ-NP-Za-km-z]{44}|ba[A-Za-z2-7]{56})\b/);
    if (ipfsHashMatch) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsHashMatch[0]}`;
    }
  }
  
  return convertedUrl;
}