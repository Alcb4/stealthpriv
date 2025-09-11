import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

async function analyzeEvents() {
  const contracts = [
    '0xb7F5cC780B9e391e618323023A392935F44AeACE',
    '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c'
  ]
  
  for (const contractAddress of contracts) {
    console.log(`\nAnalyzing events for contract: ${contractAddress}`)
    
    try {
      // Get recent events from the last 1000 blocks
      const currentBlock = await client.getBlockNumber()
      const fromBlock = currentBlock - 1000n
      
      const logs = await client.getLogs({
        address: contractAddress as `0x${string}`,
        fromBlock,
        toBlock: 'latest'
      })
      
      console.log(`Found ${logs.length} events in last 1000 blocks`)
      
      // Analyze event signatures
      const eventSignatures = new Set<string>()
      for (const log of logs) {
        if (log.topics[0]) {
          eventSignatures.add(log.topics[0])
        }
      }
      
      console.log('Event signatures found:')
      for (const signature of eventSignatures) {
        console.log(`  ${signature}`)
      }
      
      // Show some sample events
      if (logs.length > 0) {
        console.log('\nSample events:')
        for (let i = 0; i < Math.min(3, logs.length); i++) {
          const log = logs[i]
          console.log(`  Block ${log.blockNumber}: ${log.topics[0]} (${log.topics.length} topics)`)
        }
      }
      
    } catch (error) {
      console.error(`Error analyzing events for ${contractAddress}:`, error)
    }
  }
}

analyzeEvents().catch(console.error)