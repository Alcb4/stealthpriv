import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

async function quickTest() {
  const contractAddress = '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c' as `0x${string}`
  
  console.log(`Quick test for: ${contractAddress}`)
  
  try {
    // Test a few common function signatures quickly
    const tests = [
      { name: 'totalSupply()', data: '0x18160ddd' },
      { name: 'balanceOf(address)', data: '0x70a08231' + '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'.slice(2).padStart(64, '0') },
      { name: 'owner()', data: '0x8da5cb5b' },
      { name: 'getTotalLent(address)', data: '0x67709fcd' + '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c'.slice(2).padStart(64, '0') },
    ]
    
    for (const test of tests) {
      try {
        const result = await client.call({
          to: contractAddress,
          data: test.data as `0x${string}`
        })
        
        if (result.data && result.data !== '0x' && result.data !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          console.log(`✓ ${test.name}: ${result.data}`)
        }
      } catch (e) {
        // Silently continue
      }
    }
    
    // Try to get events from just the last 10 blocks
    try {
      const currentBlock = await client.getBlockNumber()
      const logs = await client.getLogs({
        address: contractAddress,
        fromBlock: currentBlock - 10n,
        toBlock: 'latest'
      })
      
      console.log(`Found ${logs.length} events in last 10 blocks`)
      
      if (logs.length > 0) {
        const eventSignatures = new Set<string>()
        for (const log of logs) {
          if (log.topics[0]) {
            eventSignatures.add(log.topics[0])
          }
        }
        
        console.log('Event signatures:')
        for (const signature of eventSignatures) {
          console.log(`  ${signature}`)
        }
      }
      
    } catch (error) {
      console.log(`Events error: ${(error as Error).message}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

quickTest().catch(console.error)
