import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

// Common function signatures for lending contracts
const commonSignatures = [
  'totalSupply()',
  'totalLent()', 
  'getTotalLent()',
  'getTotalSupply()',
  'balanceOf(address)',
  'getBalance(address)',
  'getLentBalance(address,address)',
  'lentBalance(address,address)',
  'getUserBalance(address)',
  'userBalance(address)',
  'getPoolBalance(address)',
  'poolBalance(address)',
  'getTokenBalance(address,address)',
  'tokenBalance(address,address)',
  'getLenderBalance(address,address)',
  'lenderBalance(address,address)',
  'getDepositBalance(address,address)',
  'depositBalance(address,address)',
  'getStakeBalance(address,address)',
  'stakeBalance(address,address)'
]

async function analyzeContract() {
  const contractAddress = '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c'
  
  console.log('Analyzing contract:', contractAddress)
  console.log('Testing common function signatures...\n')
  
  for (const signature of commonSignatures) {
    try {
      // Create a simple ABI for testing
      const testABI = [{
        type: 'function',
        name: signature.split('(')[0],
        inputs: signature.includes('address') ? 
          (signature.includes('address,address') ? 
            [{ name: 'token', type: 'address' }, { name: 'user', type: 'address' }] :
            [{ name: 'user', type: 'address' }]) : 
          [],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view'
      }]
      
      const result = await (client as any).readContract({
        address: contractAddress as `0x${string}`,
        abi: testABI,
        functionName: signature.split('(')[0],
        args: signature.includes('address') ? 
          (signature.includes('address,address') ? 
            ['0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c', '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c'] :
            ['0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c']) :
          []
      })
      
      console.log(`✅ ${signature}: ${result}`)
    } catch (error) {
      console.log(`❌ ${signature}: ${error.message}`)
    }
  }
  
  // Also try to get events
  console.log('\nTrying to get recent events...')
  try {
    const currentBlock = await client.getBlockNumber()
    const fromBlock = currentBlock - BigInt(1000)
    
    const logs = await client.getLogs({
      address: contractAddress as `0x${string}`,
      fromBlock,
      toBlock: 'latest'
    })
    
    console.log(`Found ${logs.length} recent events`)
    if (logs.length > 0) {
      console.log('Sample event:', logs[0])
    }
  } catch (error) {
    console.log('Error getting events:', error.message)
  }
}

analyzeContract().catch(console.error)
