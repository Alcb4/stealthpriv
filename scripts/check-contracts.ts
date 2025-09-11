import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

async function checkContracts() {
  const contracts = [
    { name: 'Main Contract', address: '0xb7F5cC780B9e391e618323023A392935F44AeACE' },
    { name: 'iTokenManager', address: '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c' }
  ]
  
  for (const contract of contracts) {
    console.log(`\nChecking ${contract.name}: ${contract.address}`)
    
    try {
      // Check if contract exists
      const code = await client.getBytecode({ 
        address: contract.address as `0x${string}` 
      })
      
      if (code && code !== '0x') {
        console.log(`✓ Contract exists with ${code.length} bytes of bytecode`)
        
        // Try to get the contract's balance
        const balance = await client.getBalance({ 
          address: contract.address as `0x${string}` 
        })
        console.log(`  Balance: ${balance.toString()} wei`)
        
        // Try to get storage at slot 0
        const storage0 = await client.getStorageAt({
          address: contract.address as `0x${string}`,
          slot: '0x0'
        })
        console.log(`  Storage slot 0: ${storage0}`)
        
      } else {
        console.log('✗ No bytecode found - contract may not exist')
      }
      
    } catch (error) {
      console.error(`Error checking ${contract.name}:`, error)
    }
  }
}

checkContracts().catch(console.error)
