// Server-side contract configuration (for API routes only)
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

// Import ABIs from the centralized contracts file
import { LaunchTokenABI, ITokenManagerABI, ITokenManagerLensABI, CONTRACT_ADDRESSES } from './contracts'

// Use the centralized contract addresses
export { CONTRACT_ADDRESSES }

// Create viem client for server-side use only
// Use custom RPC endpoint with API key for better rate limits
const getRpcUrl = () => {
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

// Contract instances using real ABIs from Remix artifacts
export const iTokenManagerContract = {
  address: CONTRACT_ADDRESSES.ITOKEN_MANAGER,
  abi: ITokenManagerABI
}

// Export ABIs for direct use
export { LaunchTokenABI, ITokenManagerABI, ITokenManagerLensABI }
