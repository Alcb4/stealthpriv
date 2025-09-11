import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

async function checkHistoricalEvents() {
  const contractAddress = '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c'
  
  console.log('Checking historical events...')
  
  try {
    const currentBlock = await client.getBlockNumber()
    
    // Check different time ranges
    const ranges = [
      { name: 'Last 100k blocks', from: currentBlock - BigInt(100000) },
      { name: 'Last 500k blocks', from: currentBlock - BigInt(500000) },
      { name: 'Last 1M blocks', from: currentBlock - BigInt(1000000) },
      { name: 'From block 0', from: BigInt(0) }
    ]
    
    for (const range of ranges) {
      try {
        console.log(`\nChecking ${range.name}...`)
        const logs = await client.getLogs({
          address: contractAddress as `0x${string}`,
          fromBlock: range.from,
          toBlock: 'latest'
        })
        
        console.log(`  Found ${logs.length} events`)
        
        if (logs.length > 0) {
          console.log('  Sample event:')
          const sampleLog = logs[0]
          console.log(`    Block: ${sampleLog.blockNumber}`)
          console.log(`    Topics: ${sampleLog.topics.join(', ')}`)
          console.log(`    Data: ${sampleLog.data}`)
          break
        }
      } catch (error) {
        console.log(`  Error: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkHistoricalEvents().catch(console.error)
