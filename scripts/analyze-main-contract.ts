import { createPublicClient, http, formatUnits } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

async function analyzeMainContract() {
  const contractAddress = '0xb7F5cC780B9e391e618323023A392935F44AeACE' as `0x${string}`
  
  console.log('Analyzing main contract:', contractAddress)
  
  try {
    // Get contract bytecode
    const bytecode = await client.getBytecode({ address: contractAddress })
    console.log('Bytecode length:', bytecode?.length || 0)
    
    // Try to read storage slots to find implementation address
    console.log('\nChecking common proxy storage slots:')
    
    // EIP-1967 implementation slot
    const implementationSlot = await client.getStorageAt({
      address: contractAddress,
      slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
    })
    console.log('EIP-1967 implementation slot:', implementationSlot)
    
    // EIP-1967 admin slot
    const adminSlot = await client.getStorageAt({
      address: contractAddress,
      slot: '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'
    })
    console.log('EIP-1967 admin slot:', adminSlot)
    
    // OpenZeppelin proxy implementation slot
    const ozImplementationSlot = await client.getStorageAt({
      address: contractAddress,
      slot: '0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f3c3'
    })
    console.log('OpenZeppelin implementation slot:', ozImplementationSlot)
    
    // Try to call common functions
    console.log('\nTrying common function calls:')
    
    // Try owner() function
    try {
      const owner = await client.call({
        to: contractAddress,
        data: '0x8da5cb5b' // owner()
      })
      console.log('owner() result:', owner.data)
    } catch (e) {
      console.log('owner() failed:', (e as Error).message)
    }
    
    // Try implementation() function
    try {
      const implementation = await client.call({
        to: contractAddress,
        data: '0x5c60da1b' // implementation()
      })
      console.log('implementation() result:', implementation.data)
    } catch (e) {
      console.log('implementation() failed:', (e as Error).message)
    }
    
    // Try getImplementation() function
    try {
      const getImplementation = await client.call({
        to: contractAddress,
        data: '0x5c60da1b' // getImplementation()
      })
      console.log('getImplementation() result:', getImplementation.data)
    } catch (e) {
      console.log('getImplementation() failed:', (e as Error).message)
    }
    
  } catch (error) {
    console.error('Error analyzing contract:', error)
  }
}

analyzeMainContract().catch(console.error)
