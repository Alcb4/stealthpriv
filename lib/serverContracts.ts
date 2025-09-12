// Server-side contract configuration (for API routes only)
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

// Import ABIs directly from JSON files
import LaunchTokenABI from '../abi/LaunchToken.json'
import ITokenManagerABI from '../abi/ITokenManager.json'
import ITokenManagerLensABI from '../abi/ITokenManagerLens.json'

// Extract just the ABI from the JSON files
const LaunchTokenABI_clean = LaunchTokenABI.abi || LaunchTokenABI
const ITokenManagerABI_clean = ITokenManagerABI.abi || ITokenManagerABI
const ITokenManagerLensABI_clean = ITokenManagerLensABI.abi || ITokenManagerLensABI

// Contract addresses
const CONTRACT_ADDRESSES = {
  ITOKEN_MANAGER: process.env.ITOKEN_MANAGER_ADDRESS || '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c',
  MAV_TOKEN: process.env.MAV_TOKEN_ADDRESS || '0x64b88c73A5DfA78D1713fE1b4c69a22d7E0faAa7',
  LAUNCH_POOL: process.env.LAUNCH_POOL_ADDRESS || '0x61746280aad2d26214905efa69971c7a969ee57d'
}

export { CONTRACT_ADDRESSES }

// Create viem client for server-side use only
// Use custom RPC endpoint with API key for better rate limits
const getRpcUrl = () => {
  // Prioritize Ankr API for event searches (better rate limits)
  const ankrRpcUrl = process.env.ANKR_API_URL
  if (ankrRpcUrl) {
    console.log('✅ Using Ankr RPC endpoint with API key')
    return ankrRpcUrl
  }
  
  // Check for custom RPC URL with API key
  const customRpcUrl = process.env.BASE_RPC_URL
  if (customRpcUrl) {
    console.log('✅ Using custom RPC endpoint with API key')
    return customRpcUrl
  }
  
  // Fallback to public endpoint
  console.log('⚠️ Using public RPC endpoint (limited rate limits)')
  return 'https://mainnet.base.org'
}

// Multiple RPC endpoints for fallback
const rpcEndpoints = [
  process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  'https://base-mainnet.g.alchemy.com/v2/demo', // Alchemy demo endpoint
  'https://base-mainnet.infura.io/v3/demo', // Infura demo endpoint
  'https://rpc.ankr.com/base', // Ankr public endpoint
  'https://mainnet.base.org' // Base public endpoint
].filter(Boolean)

let currentRpcIndex = 0

const getNextRpcUrl = () => {
  const url = rpcEndpoints[currentRpcIndex]
  currentRpcIndex = (currentRpcIndex + 1) % rpcEndpoints.length
  return url
}

export const client = createPublicClient({
  chain: base,
  transport: http(getRpcUrl(), {
    retryCount: 5,
    retryDelay: 2000,
    timeout: 15000
  })
})

// Also create a dedicated client for event searches with Ankr API
export const eventClient = createPublicClient({
  chain: base,
  transport: http(process.env.ANKR_API_URL || 'https://rpc.ankr.com/base', {
    retryCount: 3,
    retryDelay: 1000,
    timeout: 30000
  })
})

// Contract instances using real ABIs from Remix artifacts
export const iTokenManagerContract = {
  address: CONTRACT_ADDRESSES.ITOKEN_MANAGER,
  abi: ITokenManagerABI_clean
}

// Export ABIs for direct use
export { LaunchTokenABI_clean as LaunchTokenABI, ITokenManagerABI_clean as ITokenManagerABI, ITokenManagerLensABI_clean as ITokenManagerLensABI }
