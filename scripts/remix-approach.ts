import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

async function remixApproach() {
  console.log('Attempting Remix-style approach to find contract functions')
  
  const contracts = [
    { name: 'Main Contract', address: '0xb7F5cC780B9e391e618323023A392935F44AeACE' },
    { name: 'iTokenManager', address: '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c' }
  ]
  
  for (const contract of contracts) {
    console.log(`\nAnalyzing ${contract.name}: ${contract.address}`)
    
    try {
      // Get bytecode
      const bytecode = await client.getBytecode({ 
        address: contract.address as `0x${string}` 
      })
      
      if (!bytecode || bytecode === '0x') {
        console.log('No bytecode found')
        continue
      }
      
      console.log(`Bytecode length: ${(bytecode.length - 2) / 2} bytes`)
      
      // Try to find function selectors by looking for common patterns
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
        '0x12345678', // placeholder
        '0x12345679', // placeholder
        '0x1234567a', // placeholder
        '0x1234567b', // placeholder
        '0x1234567c', // placeholder
        '0x1234567d', // placeholder
        '0x1234567e', // placeholder
        '0x1234567f', // placeholder
        '0x12345680', // placeholder
      ]
      
      console.log('Looking for function selectors in bytecode:')
      const foundSelectors: string[] = []
      
      for (const selector of commonSelectors) {
        if (bytecode.includes(selector)) {
          console.log(`  ✓ Found: ${selector}`)
          foundSelectors.push(selector)
        }
      }
      
      if (foundSelectors.length === 0) {
        console.log('  No common selectors found')
        
        // Try to find any 4-byte patterns that might be function selectors
        console.log('Looking for 4-byte patterns that might be function selectors:')
        const patterns = new Set<string>()
        
        for (let i = 2; i < bytecode.length - 8; i += 2) {
          const pattern = bytecode.slice(i, i + 8)
          if (pattern.match(/^[0-9a-f]{8}$/)) {
            patterns.add(pattern)
          }
        }
        
        console.log(`  Found ${patterns.size} unique 4-byte patterns`)
        
        // Show first 10 patterns
        const patternArray = Array.from(patterns).slice(0, 10)
        for (const pattern of patternArray) {
          console.log(`    ${pattern}`)
        }
      }
      
      // Try to call the found selectors
      if (foundSelectors.length > 0) {
        console.log('\nTesting found selectors:')
        for (const selector of foundSelectors) {
          try {
            const result = await client.call({
              to: contract.address as `0x${string}`,
              data: selector as `0x${string}`
            })
            
            if (result.data && result.data !== '0x' && result.data !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
              console.log(`  ✓ ${selector}: ${result.data}`)
            }
          } catch (e) {
            // Silently continue
          }
        }
      }
      
    } catch (error) {
      console.error(`Error analyzing ${contract.name}:`, error)
    }
  }
}

remixApproach().catch(console.error)
