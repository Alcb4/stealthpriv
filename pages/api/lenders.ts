import { NextApiRequest, NextApiResponse } from 'next'
import { getTopLenders } from '../../lib/mappingUtils'

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

  // Set a timeout for the API call (increased for chunked scanning)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout after 120 seconds')), 120000)
  })

  try {
    const { tokenAddress, days } = req.body

    if (!tokenAddress) {
      return res.status(400).json({ error: 'Token address is required' })
    }

    // Default to 3 days if not specified, with reasonable bounds
    const searchDays = Math.max(1, Math.min(365, days || 3))
    
    console.log(`API: Fetching lenders for token: ${tokenAddress} (${searchDays} days)`)
    
    // Race between the actual call and timeout
    const result = await Promise.race([
      getTopLenders(tokenAddress, searchDays),
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
