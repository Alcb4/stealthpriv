import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

async function findEventsSimple() {
  const contractAddress = '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c' as `0x${string}`
  
  console.log(`Looking for events for: ${contractAddress}`)
  
  try {
    // Get current block number
    const currentBlock = await client.getBlockNumber()
    console.log(`Current block: ${currentBlock}`)
    
    // Try to get events from the last 100 blocks
    const fromBlock = currentBlock - 100n
    
    try {
      const logs = await client.getLogs({
        address: contractAddress,
        fromBlock,
        toBlock: 'latest'
      })
      
      console.log(`Found ${logs.length} events in last 100 blocks`)
      
      if (logs.length > 0) {
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
        
        // Show sample events
        console.log('\nSample events:')
        for (let i = 0; i < Math.min(3, logs.length); i++) {
          const log = logs[i]
          console.log(`  Block ${log.blockNumber}: ${log.topics[0]} (${log.topics.length} topics)`)
          if (log.data && log.data !== '0x') {
            console.log(`    Data: ${log.data}`)
          }
        }
      } else {
        console.log('No events found in last 100 blocks')
        
        // Try to find the contract's creation block
        console.log('\nTrying to find contract creation block...')
        
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
            
            console.log('Event signatures near creation:')
            for (const signature of eventSignatures) {
              console.log(`  ${signature}`)
            }
          }
          
        } catch (error) {
          console.log(`Error getting events near creation: ${(error as Error).message}`)
        }
      }
      
    } catch (error) {
      console.log(`Error getting events: ${(error as Error).message}`)
    }
    
  } catch (error) {
    console.error('Error finding events:', error)
  }
}

findEventsSimple().catch(console.error)