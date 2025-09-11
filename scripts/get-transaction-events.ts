import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org', {
    retryCount: 3,
    retryDelay: 1000,
    timeout: 10000
  })
})

async function getTransactionEvents() {
  try {
    const txHash = '0x7a0f3ff298da992c3a67b19dddce7f8b0ea2d571e5568a860701b245ff602ae0'
    
    console.log('Getting transaction events for:', txHash)
    
    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` })
    console.log('Transaction receipt:', {
      blockNumber: receipt.blockNumber,
      status: receipt.status,
      logs: receipt.logs.length
    })
    
    // Show all the events from this transaction
    receipt.logs.forEach((log, i) => {
      console.log(`Event ${i + 1}:`, {
        address: log.address,
        topics: log.topics,
        data: log.data
      })
    })
    
  } catch (error) {
    console.error('Error:', error)
  }
}

getTransactionEvents()
