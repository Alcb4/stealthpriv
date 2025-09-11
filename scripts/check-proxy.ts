import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

async function checkProxy() {
  const contractAddress = '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c'
  
  console.log('Checking if contract is a proxy...')
  
  // Check common proxy storage slots
  const proxySlots = [
    '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', // EIP-1967 implementation
    '0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f3c3', // EIP-1967 admin
    '0x0000000000000000000000000000000000000000000000000000000000000000',   // Slot 0
    '0x0000000000000000000000000000000000000000000000000000000000000001',   // Slot 1
    '0x0000000000000000000000000000000000000000000000000000000000000002',   // Slot 2
  ]
  
  for (const slot of proxySlots) {
    try {
      const value = await client.getStorageAt({
        address: contractAddress as `0x${string}`,
        slot: slot as `0x${string}`
      })
      console.log(`Slot ${slot}: ${value}`)
      
      // If it looks like an address, try to read from it
      if (value && value !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        const address = '0x' + value.slice(-40)
        console.log(`  -> Potential implementation: ${address}`)
      }
    } catch (error) {
      console.log(`Slot ${slot}: Error - ${error.message}`)
    }
  }
  
  // Also try to get the bytecode
  try {
    const bytecode = await client.getBytecode({
      address: contractAddress as `0x${string}`
    })
    console.log(`\nBytecode length: ${bytecode ? bytecode.length : 0}`)
    if (bytecode) {
      console.log(`First 100 chars: ${bytecode.slice(0, 100)}`)
    }
  } catch (error) {
    console.log(`Error getting bytecode: ${error.message}`)
  }
}

checkProxy().catch(console.error)
