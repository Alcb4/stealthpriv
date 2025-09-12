import { NextApiRequest, NextApiResponse } from 'next'
import { getOutstandingDebtFromBlockSearch } from '../../lib/mappingUtils'

// Helper function to serialize BigInt values for JSON
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'bigint') return obj.toString()
  if (obj instanceof Date) return obj.toISOString()
  if (Array.isArray(obj)) return obj.map(serializeBigInt)
  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value)
    }
    return serialized
  }
  return obj
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Set a timeout for the API call (increased for full historical data scanning)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout after 180 seconds')), 180000)
  })

  try {
    const { tokenAddress } = req.body

    if (!tokenAddress) {
      return res.status(400).json({ error: 'Token address is required' })
    }
    
    console.log(`API: Fetching lenders for token: ${tokenAddress} (all historical data)`)
    
    // Use the new block search algorithm for outstanding debt calculation
    // Use 400 days to capture ALL historical data from contract deployment
    const result = await Promise.race([
      getOutstandingDebtFromBlockSearch(tokenAddress, 400),
      timeoutPromise
    ]) as any
    
    console.log(`API: Found ${result.lenders.length} lenders`)
    
    // Serialize BigInt values before sending JSON response
    const serializedResult = serializeBigInt(result)
    res.status(200).json(serializedResult)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch lenders data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
