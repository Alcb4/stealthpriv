import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

async function analyzeStorage() {
  const contractAddress = '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c' as `0x${string}`
  
  console.log(`Analyzing storage for: ${contractAddress}`)
  
  try {
    // Check first 20 storage slots
    console.log('Checking first 20 storage slots:')
    for (let i = 0; i < 20; i++) {
      try {
        const value = await client.getStorageAt({
          address: contractAddress,
          slot: `0x${i.toString(16)}`
        })
        
        if (value && value !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          console.log(`  Slot ${i}: ${value}`)
        }
      } catch (error) {
        console.log(`  Slot ${i}: error`)
      }
    }
    
    // Check some common storage patterns
    console.log('\nChecking common storage patterns:')
    
    // Check for mappings (common in lending contracts)
    // Mapping(address => uint256) would be at keccak256(abi.encode(key, slot))
    const commonKeys = [
      '0x0000000000000000000000000000000000000000000000000000000000000000', // zero address
      '0x0000000000000000000000000000000000000000000000000000000000000001', // one
      '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c', // contract address
      '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // sample address
    ]
    
    for (const key of commonKeys) {
      try {
        // Try different base slots for mappings
        for (let baseSlot = 0; baseSlot < 10; baseSlot++) {
          const mappingSlot = `0x${baseSlot.toString(16)}` as `0x${string}`
          const value = await client.getStorageAt({
            address: contractAddress,
            slot: mappingSlot
          })
          
          if (value && value !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
            console.log(`  Mapping slot ${baseSlot} with key ${key}: ${value}`)
          }
        }
      } catch (error) {
        // Silently continue
      }
    }
    
  } catch (error) {
    console.error('Error analyzing storage:', error)
  }
}

analyzeStorage().catch(console.error)
