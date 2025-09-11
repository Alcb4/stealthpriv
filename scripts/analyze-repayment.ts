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

async function analyzeRepaymentTransaction() {
  try {
    const txHash = '0xe963a1ef50a3d02be46f39ebe1af5e2e44826947d92a1a67e6e2102748937753'
    
    console.log('Analyzing repayment transaction:', txHash)
    
    const tx = await client.getTransaction({ hash: txHash as `0x${string}` })
    console.log('Transaction details:', {
      blockNumber: tx.blockNumber,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      gas: tx.gas,
      gasPrice: tx.gasPrice,
      input: tx.input.slice(0, 10) // First 4 bytes (method selector)
    })
    
    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` })
    console.log('Transaction receipt:', {
      blockNumber: receipt.blockNumber,
      status: receipt.status,
      logs: receipt.logs.length
    })
    
    // Get the block to see the timestamp
    const block = await client.getBlock({ blockNumber: tx.blockNumber! })
    console.log('Block details:', {
      number: block.number,
      timestamp: block.timestamp,
      date: new Date(Number(block.timestamp) * 1000)
    })
    
    // Show all the events from this transaction
    console.log('\nEvents from repayment transaction:')
    receipt.logs.forEach((log, i) => {
      console.log(`Event ${i + 1}:`, {
        address: log.address,
        topics: log.topics,
        data: log.data.slice(0, 100) + '...' // Truncate for readability
      })
    })
    
  } catch (error) {
    console.error('Error:', error)
  }
}

analyzeRepaymentTransaction()
