import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

// Common function signatures for lending contracts
const functionSignatures = {
  'getTotalLent(address)': '0x67709fcd',
  'getLentBalance(address,address)': '0x12345678', // placeholder
  'totalLent(address)': '0x12345679', // placeholder
  'lentBalance(address,address)': '0x1234567a', // placeholder
  'balanceOf(address)': '0x70a08231',
  'totalSupply()': '0x18160ddd',
  'owner()': '0x8da5cb5b',
  'implementation()': '0x5c60da1b',
  'getImplementation()': '0x5c60da1b',
  'admin()': '0xf851a440',
  'getAdmin()': '0xf851a440'
}

async function testFunctionSignatures() {
  const contracts = [
    '0xb7F5cC780B9e391e618323023A392935F44AeACE',
    '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c'
  ]
  
  for (const contractAddress of contracts) {
    console.log(`\nTesting contract: ${contractAddress}`)
    
    for (const [functionName, signature] of Object.entries(functionSignatures)) {
      try {
        const result = await client.call({
          to: contractAddress as `0x${string}`,
          data: signature as `0x${string}`
        })
        
        if (result.data && result.data !== '0x') {
          console.log(`✓ ${functionName}: ${result.data}`)
        }
      } catch (e) {
        // Silently continue - most will fail
      }
    }
  }
}

testFunctionSignatures().catch(console.error)
