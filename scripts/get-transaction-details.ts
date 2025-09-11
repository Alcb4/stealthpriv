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

async function getTransactionDetails() {
  try {
    const txHash = '0x7a0f3ff298da992c3a67b19dddce7f8b0ea2d571e5568a860701b245ff602ae0'
    
    console.log('Getting transaction details for:', txHash)
    
    const tx = await client.getTransaction({ hash: txHash as `0x${string}` })
    console.log('Transaction details:', {
      blockNumber: tx.blockNumber,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      gas: tx.gas,
      gasPrice: tx.gasPrice
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
    
  } catch (error) {
    console.error('Error:', error)
  }
}

getTransactionDetails()
