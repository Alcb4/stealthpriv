import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

// Common lending contract function signatures
const lendingFunctions = {
  // Standard ERC20-like functions
  'totalSupply()': '0x18160ddd',
  'balanceOf(address)': '0x70a08231',
  'decimals()': '0x313ce567',
  'symbol()': '0x95d89b41',
  'name()': '0x06fdde03',
  
  // Lending-specific functions (common patterns)
  'getTotalLent(address)': '0x67709fcd',
  'totalLent(address)': '0x12345678', // placeholder
  'getLentBalance(address,address)': '0x12345679', // placeholder
  'lentBalance(address,address)': '0x1234567a', // placeholder
  'getUserLentBalance(address,address)': '0x1234567b', // placeholder
  'userLentBalance(address,address)': '0x1234567c', // placeholder
  
  // Alternative patterns
  'lent(address,address)': '0x1234567d', // placeholder
  'lentAmount(address,address)': '0x1234567e', // placeholder
  'getLent(address,address)': '0x1234567f', // placeholder
  
  // Admin functions
  'owner()': '0x8da5cb5b',
  'admin()': '0xf851a440',
  'implementation()': '0x5c60da1b'
}

async function findLendingFunctions() {
  const contractAddress = '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c' as `0x${string}`
  
  console.log(`Testing lending functions on: ${contractAddress}`)
  
  const workingFunctions: string[] = []
  
  for (const [functionName, signature] of Object.entries(lendingFunctions)) {
    try {
      const result = await client.call({
        to: contractAddress,
        data: signature as `0x${string}`
      })
      
      if (result.data && result.data !== '0x' && result.data !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        console.log(`✓ ${functionName}: ${result.data}`)
        workingFunctions.push(functionName)
      }
    } catch (e) {
      // Silently continue
    }
  }
  
  console.log(`\nFound ${workingFunctions.length} working functions:`)
  workingFunctions.forEach(func => console.log(`  - ${func}`))
  
  // Try to call functions with parameters
  if (workingFunctions.includes('balanceOf(address)')) {
    console.log('\nTesting balanceOf with sample addresses:')
    const sampleAddresses = [
      '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c',
      '0xb7F5cC780B9e391e618323023A392935F44AeACE'
    ]
    
    for (const addr of sampleAddresses) {
      try {
        const result = await client.call({
          to: contractAddress,
          data: `0x70a08231${addr.slice(2).padStart(64, '0')}`
        })
        console.log(`  balanceOf(${addr}): ${result.data}`)
      } catch (e) {
        console.log(`  balanceOf(${addr}): failed`)
      }
    }
  }
}

findLendingFunctions().catch(console.error)
