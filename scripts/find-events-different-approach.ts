import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

async function findEventsDifferentApproach() {
  const contractAddress = '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c' as `0x${string}`
  
  console.log(`Looking for events with different approach for: ${contractAddress}`)
  
  try {
    // Get current block number
    const currentBlock = await client.getBlockNumber()
    console.log(`Current block: ${currentBlock}`)
    
    // Try to get events from specific blocks
    const blockRanges = [
      { name: 'Last 100 blocks', from: currentBlock - 100n, to: currentBlock },
      { name: 'Last 500 blocks', from: currentBlock - 500n, to: currentBlock },
      { name: 'Last 1000 blocks', from: currentBlock - 1000n, to: currentBlock },
    ]
    
    for (const range of blockRanges) {
      console.log(`\nChecking ${range.name}:`)
      
      try {
        const logs = await client.getLogs({
          address: contractAddress,
          fromBlock: range.from,
          toBlock: range.to
        })
        
        console.log(`  Found ${logs.length} events`)
        
        if (logs.length > 0) {
          // Analyze event signatures
          const eventSignatures = new Set<string>()
          for (const log of logs) {
            if (log.topics[0]) {
              eventSignatures.add(log.topics[0])
            }
          }
          
          console.log(`  Event signatures:`)
          for (const signature of eventSignatures) {
            console.log(`    ${signature}`)
          }
          
          // Show sample events
          console.log(`  Sample events:`)
          for (let i = 0; i < Math.min(3, logs.length); i++) {
            const log = logs[i]
            console.log(`    Block ${log.blockNumber}: ${log.topics[0]} (${log.topics.length} topics)`)
            if (log.data && log.data !== '0x') {
              console.log(`      Data: ${log.data}`)
            }
          }
          
          break // Found events, no need to check larger ranges
        }
        
      } catch (error) {
        console.log(`  Error: ${(error as Error).message}`)
      }
    }
    
    // If no events found, try to find the contract's creation block
    console.log('\nTrying to find contract creation block...')
    
    // Try to find the contract's creation block by checking if it exists in older blocks
    let creationBlock = currentBlock
    let step = 1000n
    
    while (step > 0n) {
      try {
        const testBlock = creationBlock - step
        const code = await client.getBytecode({ 
          address: contractAddress,
          blockNumber: testBlock
        })
        
        if (code && code !== '0x') {
          creationBlock = testBlock
        } else {
          step = step / 2n
        }
      } catch (error) {
        step = step / 2n
      }
    }
    
    console.log(`Contract creation block: ${creationBlock}`)
    
    // Try to get events from the creation block
    try {
      const logs = await client.getLogs({
        address: contractAddress,
        fromBlock: creationBlock,
        toBlock: creationBlock + 100n
      })
      
      console.log(`Found ${logs.length} events near creation block`)
      
      if (logs.length > 0) {
        const eventSignatures = new Set<string>()
        for (const log of logs) {
          if (log.topics[0]) {
            eventSignatures.add(log.topics[0])
          }
        }
        
        console.log(`Event signatures near creation:`)
        for (const signature of eventSignatures) {
          console.log(`  ${signature}`)
        }
      }
      
    } catch (error) {
      console.log(`Error getting events near creation: ${(error as Error).message}`)
    }
    
  } catch (error) {
    console.error('Error finding events:', error)
  }
}

findEventsDifferentApproach().catch(console.error)
