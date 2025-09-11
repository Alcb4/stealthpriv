// Contract addresses and ABI imports for frontend use
import LaunchTokenArtifact from '../abi/LaunchToken.json'
import ITokenManagerArtifact from '../abi/ITokenManager.json'
import ITokenManagerLensArtifact from '../abi/ITokenManagerLens.json'

// Extract ABIs from Remix artifacts (Path A - reproducible steps documented in TECHNOTES.md)
export const LaunchTokenABI = LaunchTokenArtifact.abi
export const ITokenManagerABI = ITokenManagerArtifact.abi
export const ITokenManagerLensABI = ITokenManagerLensArtifact.abi

// Contract addresses
export const CONTRACT_ADDRESSES = {
  MAIN_CONTRACT: '0xb7F5cC780B9e391e618323023A392935F44AeACE',
  ITOKEN_MANAGER: '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c',
  INTERNAL_CONTRACT: '0xb7F5cC780B9e391e618323023A392935F44AeACE',
} as const

// Note: All blockchain interaction is handled server-side via /api/lenders endpoint
// This prevents CORS issues and allows for proper error handling
