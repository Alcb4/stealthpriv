import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

async function analyzeBytecode() {
  const contractAddress = '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c' as `0x${string}`
  
  console.log(`Analyzing bytecode for: ${contractAddress}`)
  
  try {
    const bytecode = await client.getBytecode({ address: contractAddress })
    
    if (!bytecode || bytecode === '0x') {
      console.log('No bytecode found')
      return
    }
    
    console.log(`Bytecode length: ${bytecode.length} characters`)
    console.log(`Bytecode length: ${(bytecode.length - 2) / 2} bytes`)
    
    // Look for function selectors in the bytecode
    // Function selectors are 4 bytes (8 hex characters) at the beginning of function calls
    const functionSelectors = new Set<string>()
    
    // Common function selectors to look for
    const commonSelectors = [
      '0x18160ddd', // totalSupply()
      '0x70a08231', // balanceOf(address)
      '0x313ce567', // decimals()
      '0x95d89b41', // symbol()
      '0x06fdde03', // name()
      '0x8da5cb5b', // owner()
      '0x5c60da1b', // implementation()
      '0xf851a440', // admin()
      '0x67709fcd', // getTotalLent(address) - our current guess
    ]
    
    console.log('\nLooking for common function selectors in bytecode:')
    for (const selector of commonSelectors) {
      if (bytecode.includes(selector)) {
        console.log(`✓ Found: ${selector}`)
        functionSelectors.add(selector)
      }
    }
    
    // Try to find any 4-byte patterns that might be function selectors
    console.log('\nLooking for 4-byte patterns that might be function selectors:')
    const patterns = new Set<string>()
    
    for (let i = 2; i < bytecode.length - 8; i += 2) {
      const pattern = bytecode.slice(i, i + 8)
      if (pattern.match(/^[0-9a-f]{8}$/)) {
        patterns.add(pattern)
      }
    }
    
    console.log(`Found ${patterns.size} unique 4-byte patterns`)
    
    // Show first 20 patterns
    const patternArray = Array.from(patterns).slice(0, 20)
    for (const pattern of patternArray) {
      console.log(`  ${pattern}`)
    }
    
  } catch (error) {
    console.error('Error analyzing bytecode:', error)
  }
}

analyzeBytecode().catch(console.error)
