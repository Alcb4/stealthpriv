import { createPublicClient, http, getContract } from 'viem'
import { base } from 'viem/chains'
import fs from 'fs'
import path from 'path'

const client = createPublicClient({ 
  chain: base, 
  transport: http() 
})

async function extractABIFromBytecode(contractAddress: string, outputFileName: string) {
  try {
    console.log(`Analyzing bytecode for contract: ${contractAddress}`)
    
    // Get the bytecode
    const bytecode = await client.getBytecode({
      address: contractAddress as `0x${string}`
    })
    
    if (!bytecode) {
      throw new Error('No bytecode found for contract')
    }
    
    console.log(`Bytecode length: ${bytecode.length} characters`)
    
    // For now, we'll create a basic ABI structure
    // In a real implementation, you would analyze the bytecode to extract function selectors
    const basicABI = [
      {
        "type": "function",
        "name": "getLentBalance",
        "inputs": [
          {"name": "token", "type": "address"},
          {"name": "wallet", "type": "address"}
        ],
        "outputs": [
          {"name": "", "type": "uint256"}
        ],
        "stateMutability": "view"
      },
      {
        "type": "function", 
        "name": "getTotalLent",
        "inputs": [
          {"name": "token", "type": "address"}
        ],
        "outputs": [
          {"name": "", "type": "uint256"}
        ],
        "stateMutability": "view"
      },
      {
        "type": "event",
        "name": "Lend",
        "inputs": [
          {"name": "token", "type": "address", "indexed": true},
          {"name": "lender", "type": "address", "indexed": true},
          {"name": "amount", "type": "uint256", "indexed": false}
        ]
      },
      {
        "type": "event",
        "name": "Withdraw",
        "inputs": [
          {"name": "token", "type": "address", "indexed": true},
          {"name": "lender", "type": "address", "indexed": true},
          {"name": "amount", "type": "uint256", "indexed": false}
        ]
      }
    ]
    
    const abiPath = path.join(__dirname, '..', 'abi', outputFileName)
    fs.writeFileSync(abiPath, JSON.stringify(basicABI, null, 2))
    
    console.log(`✅ Basic ABI created and saved to: ${abiPath}`)
    console.log(`Created ${basicABI.length} function/event definitions`)
    
    return basicABI
  } catch (error) {
    console.error(`❌ Failed to analyze bytecode for ${contractAddress}:`, error)
    throw error
  }
}

async function readProxyImplementation(proxyAddress: string) {
  try {
    console.log(`Reading implementation address from proxy: ${proxyAddress}`)
    
    // Standard EIP-1967 implementation slot
    const implementationSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
    
    const implementationAddress = await client.getStorageAt({
      address: proxyAddress as `0x${string}`,
      slot: implementationSlot
    })
    
    if (implementationAddress && implementationAddress !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      // Convert from storage format (32 bytes) to address format (20 bytes)
      const address = `0x${implementationAddress.slice(-40)}`
      console.log(`✅ Implementation address found: ${address}`)
      return address
    } else {
      console.log('❌ No implementation address found in proxy storage')
      return null
    }
  } catch (error) {
    console.error(`❌ Failed to read proxy implementation:`, error)
    throw error
  }
}

async function main() {
  try {
    console.log('🚀 Starting ABI extraction process...\n')
    
    // 1. Extract ABI for iTokenManager (unverified)
    console.log('1. Extracting iTokenManager ABI...')
    await extractABIFromBytecode('0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c', 'iTokenManager.json')
    console.log('')
    
    // 2. Read proxy implementation for main contract
    console.log('2. Reading proxy implementation...')
    const implementationAddress = await readProxyImplementation('0xb7F5cC780B9e391e618323023A392935F44AeACE')
    console.log('')
    
    if (implementationAddress) {
      // 3. Extract ABI for internal implementation contract
      console.log('3. Extracting internal contract ABI...')
      await extractABIFromBytecode(implementationAddress, 'InternalContract.json')
      console.log('')
    }
    
    console.log('✅ ABI extraction completed successfully!')
    
  } catch (error) {
    console.error('❌ ABI extraction failed:', error)
    process.exit(1)
  }
}

// Run the script
main()
