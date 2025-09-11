import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

async function testParameterCombinations() {
  const contractAddress = '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c' as `0x${string}`
  
  console.log(`Testing parameter combinations for: ${contractAddress}`)
  
  // Test different function signatures with different parameter combinations
  const testCases = [
    // Single address parameter
    { name: 'getTotalLent(address)', data: '0x67709fcd' + '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c'.slice(2).padStart(64, '0') },
    { name: 'totalLent(address)', data: '0x12345678' + '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c'.slice(2).padStart(64, '0') },
    
    // Two address parameters (user, token)
    { name: 'getLentBalance(address,address)', data: '0x12345679' + '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'.slice(2).padStart(64, '0') + '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c'.slice(2).padStart(64, '0') },
    
    // Try with different token addresses
    { name: 'getTotalLent(ETH)', data: '0x67709fcd' + '0x0000000000000000000000000000000000000000'.padStart(64, '0') },
    { name: 'getTotalLent(WETH)', data: '0x67709fcd' + '0x4200000000000000000000000000000000000006'.slice(2).padStart(64, '0') },
    
    // Try with different user addresses
    { name: 'getLentBalance(user1,ETH)', data: '0x12345679' + '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'.slice(2).padStart(64, '0') + '0x0000000000000000000000000000000000000000'.padStart(64, '0') },
  ]
  
  for (const testCase of testCases) {
    try {
      const result = await client.call({
        to: contractAddress,
        data: testCase.data as `0x${string}`
      })
      
      if (result.data && result.data !== '0x' && result.data !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        console.log(`✓ ${testCase.name}: ${result.data}`)
      }
    } catch (e) {
      // Silently continue
    }
  }
  
  // Try to find the actual function signature by testing different 4-byte selectors
  console.log('\nTesting different 4-byte selectors:')
  
  const selectors = [
    '0x67709fcd', // getTotalLent(address) - our current guess
    '0x12345678', // placeholder
    '0x12345679', // placeholder
    '0x1234567a', // placeholder
    '0x1234567b', // placeholder
    '0x1234567c', // placeholder
    '0x1234567d', // placeholder
    '0x1234567e', // placeholder
    '0x1234567f', // placeholder
    '0x12345680', // placeholder
  ]
  
  for (const selector of selectors) {
    try {
      const result = await client.call({
        to: contractAddress,
        data: selector as `0x${string}`
      })
      
      if (result.data && result.data !== '0x' && result.data !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        console.log(`✓ ${selector}: ${result.data}`)
      }
    } catch (e) {
      // Silently continue
    }
  }
}

testParameterCombinations().catch(console.error)
