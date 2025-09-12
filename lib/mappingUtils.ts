// Utilities for processing complex contract data structures
import { client, eventClient, iTokenManagerContract, ITokenManagerABI, ITokenManagerLensABI, LaunchTokenABI } from './serverContracts'
import { encodeFunctionData, createPublicClient, http, Log, parseAbiItem } from 'viem'
import { base } from 'viem/chains'

export interface LenderData {
  address: string
  balance: number
  poolPercentage: number
}

export interface TopLendersResult {
  lenders: LenderData[]
  totalLent: number
  totalPoolLiquidity: number
  tokenAddress: string
  lastUpdated: Date
}

// Configuration constants for chunked log fetching
const LOG_CHUNK_SIZE = 3000 // Configurable chunk size (max for Ankr freemium)
const LOOKBACK_MONTHS = 0.1 // Configurable lookback period in months (~3 days)
const BASE_BLOCK_TIME = 2 // Base blockchain block time in seconds

// Contract addresses (configurable via environment variables)
const MAV_TOKEN_ADDRESS = process.env.MAV_TOKEN_ADDRESS || '0x64b88c73A5DfA78D1713fE1b4c69a22d7E0faAa7'
const LAUNCH_POOL_ADDRESS = process.env.LAUNCH_POOL_ADDRESS || '0x61746280aad2d26214905efa69971c7a969ee57d'
const ITOKEN_MANAGER_ADDRESS = process.env.ITOKEN_MANAGER_ADDRESS || '0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c'

// Debug mode (set to false for production)
const DEBUG_MODE = process.env.DEBUG_MODE === 'true'

// Helper function for debug logging
const debugLog = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.log(...args)
  }
}

// Helper function for production logging (always logs)
const log = (...args: any[]) => {
  console.log(...args)
}

// Calculate blocks per month for Base (2 second blocks)
const BLOCKS_PER_MONTH = Math.floor((30 * 24 * 60 * 60) / BASE_BLOCK_TIME) // ~1.3M blocks per month
const LOOKBACK_BLOCKS = LOOKBACK_MONTHS * BLOCKS_PER_MONTH

// RPC endpoints - using ONLY Ankr API to avoid Alchemy 400 errors
const rpcEndpoints = [
  process.env.ANKR_API_URL, // Ankr API with full URL (ONLY endpoint)
].filter(Boolean)

// Fallback to Base public if Ankr is not available
if (rpcEndpoints.length === 0) {
  rpcEndpoints.push('https://mainnet.base.org')
}

let currentRpcIndex = 0

const getNextRpcClient = () => {
  const rpcUrl = rpcEndpoints[currentRpcIndex]
  currentRpcIndex = (currentRpcIndex + 1) % rpcEndpoints.length
  
  // Show which endpoint is being used
  const isAnkr = rpcUrl?.includes('ankr.com')
  const endpointType = isAnkr ? '🚀 ANKR API' : '📡 Public RPC'
  debugLog(`${endpointType}: ${rpcUrl}`)
  
  return createPublicClient({
    chain: base,
    transport: http(rpcUrl, {
      retryCount: 3,
      retryDelay: 1000,
      timeout: 10000
    })
  })
}

/**
 * Fetches event logs over a large block range by splitting it into smaller chunks.
 * This approach respects RPC rate limits and allows for progress tracking.
 * 
 * @param contractAddress The contract address to search for events
 * @param fromBlock The block to start scanning from
 * @param onProgress Callback to update the UI with scanning progress
 * @returns A promise that resolves to an array of all found logs
 */
export async function getChunkedLogs(
  contractAddress: string,
  fromBlock: bigint,
  onProgress: (progress: number) => void
): Promise<Log[]> {
  try {
    const latestBlock = await client.getBlockNumber()
    const totalBlocksToScan = latestBlock - fromBlock
    
    console.log(`🔍 Starting chunked log search:`)
    console.log(`  Contract: ${contractAddress}`)
    console.log(`  From block: ${fromBlock.toString()}`)
    console.log(`  To block: ${latestBlock.toString()}`)
    console.log(`  Total blocks: ${totalBlocksToScan.toString()}`)
    console.log(`  Chunk size: ${LOG_CHUNK_SIZE}`)
    console.log(`  Estimated chunks: ${Math.ceil(Number(totalBlocksToScan) / LOG_CHUNK_SIZE)}`)
    
    const allLogs: Log[] = []
    
    let chunkCount = 0
    const totalChunks = Math.ceil(Number(totalBlocksToScan) / LOG_CHUNK_SIZE)
    
    // Use all chunks for full scanning
    const maxChunks = totalChunks
    console.log(`🔍 Full scanning mode: ${maxChunks} chunks`)
    
    for (let currentBlock = fromBlock; currentBlock < latestBlock && chunkCount < maxChunks; currentBlock += BigInt(LOG_CHUNK_SIZE)) {
      const toBlock = currentBlock + BigInt(LOG_CHUNK_SIZE - 1)
      
      // Ensure the `toBlock` does not exceed the latest block
      const effectiveToBlock = toBlock > latestBlock ? latestBlock : toBlock
      chunkCount++

      try {
        debugLog(`🔍 Chunk ${chunkCount}/${maxChunks}: blocks ${currentBlock.toString()} to ${effectiveToBlock.toString()}`)
        
        // Use different RPC client for each chunk to distribute load
        const chunkClient = getNextRpcClient()
        
        // Search for all events from the contract (not just specific events)
        const logs = await chunkClient.getLogs({
          address: contractAddress as `0x${string}`,
          fromBlock: currentBlock,
          toBlock: effectiveToBlock,
        })

        if (logs.length > 0) {
          allLogs.push(...logs)
          console.log(`✅ Chunk ${chunkCount}: Found ${logs.length} events`)
        } else {
          console.log(`📝 Chunk ${chunkCount}: No events found`)
        }
        
        // Calculate and report progress
        const blocksScanned = effectiveToBlock - fromBlock
        const progress = Math.min(100, Math.floor((Number(blocksScanned) / Number(totalBlocksToScan)) * 100))
        onProgress(progress)
        
        // Add small delay between chunks to avoid rate limits
        if (chunkCount < maxChunks) {
          await new Promise(resolve => setTimeout(resolve, 100)) // Reduced delay for faster scanning
        }

      } catch (error) {
        console.error(`❌ Failed to fetch logs for chunk ${chunkCount} [${currentBlock}-${effectiveToBlock}]:`, error)
        // Continue with next chunk instead of failing completely
      }
    }

    onProgress(100) // Final progress update
    console.log(`✅ Chunked log search complete: Found ${allLogs.length} total events`)
    return allLogs
  } catch (error) {
    console.error('❌ Error in getChunkedLogs:', error)
    throw error
  }
}

/**
 * Fetches transactions over a large block range by splitting it into smaller chunks.
 * Uses transaction parsing instead of event logs for better accuracy.
 * @param contractAddress The contract address to search for transactions
 * @param fromBlock The block to start scanning from
 * @param onProgress Callback to update the UI with scanning progress
 * @returns A promise that resolves to an array of all found transactions
 */
export async function getChunkedTransactions(
  contractAddress: string,
  fromBlock: bigint,
  onProgress: (progress: number) => void
): Promise<any[]> {
  try {
    const latestBlock = await client.getBlockNumber()
    const totalBlocksToScan = latestBlock - fromBlock
    
    debugLog(`🔍 Starting chunked transaction search:`)
    debugLog(`  Contract: ${contractAddress}`)
    debugLog(`  From block: ${fromBlock.toString()}`)
    debugLog(`  To block: ${latestBlock.toString()}`)
    debugLog(`  Total blocks: ${totalBlocksToScan.toString()}`)
    debugLog(`  Chunk size: ${LOG_CHUNK_SIZE}`)
    debugLog(`  Estimated chunks: ${Math.ceil(Number(totalBlocksToScan) / LOG_CHUNK_SIZE)}`)
    
    const allTransactions: any[] = []
    
    let chunkCount = 0
    const totalChunks = Math.ceil(Number(totalBlocksToScan) / LOG_CHUNK_SIZE)
    
    // Use all chunks for full scanning
    const maxChunks = totalChunks
    console.log(`🔍 Full scanning mode: ${maxChunks} chunks`)
    
    for (let currentBlock = fromBlock; currentBlock < latestBlock && chunkCount < maxChunks; currentBlock += BigInt(LOG_CHUNK_SIZE)) {
      const toBlock = currentBlock + BigInt(LOG_CHUNK_SIZE - 1)
      
      // Ensure the `toBlock` does not exceed the latest block
      const effectiveToBlock = toBlock > latestBlock ? latestBlock : toBlock
      chunkCount++

      try {
        debugLog(`🔍 Chunk ${chunkCount}/${maxChunks}: blocks ${currentBlock.toString()} to ${effectiveToBlock.toString()}`)
        
        // Use different RPC client for each chunk to distribute load
        const chunkClient = getNextRpcClient()
        
        // Use event logs to find transaction hashes, then fetch specific transactions
        const logs = await chunkClient.getLogs({
          address: contractAddress as `0x${string}`,
          fromBlock: currentBlock,
          toBlock: effectiveToBlock,
        })
        
        // Extract unique transaction hashes from logs
        const txHashes = [...new Set(logs.map(log => log.transactionHash))]
        
        // Fetch specific transactions that we know are relevant (limit to avoid overwhelming)
        const chunkTransactions: any[] = []
        const maxTxsPerChunk = 50 // Limit transactions per chunk for performance
        for (const txHash of txHashes.slice(0, maxTxsPerChunk)) {
          try {
            const tx = await chunkClient.getTransaction({ hash: txHash as `0x${string}` })
            if (tx.to?.toLowerCase() === contractAddress.toLowerCase()) {
              // Check if this is a borrow or repay transaction
              const functionSelector = tx.input?.slice(0, 10) || ''
              if (functionSelector === '0x7407572b' || functionSelector === '0xa4b3bdfd' || functionSelector === '0x59b34772') {
                chunkTransactions.push({
                  ...tx,
                  type: functionSelector === '0x59b34772' ? 'repay' : 'borrow'
                })
              }
            }
          } catch (error) {
            console.error(`Failed to fetch transaction ${txHash}:`, error)
          }
        }

        if (chunkTransactions.length > 0) {
          allTransactions.push(...chunkTransactions)
          console.log(`✅ Chunk ${chunkCount}: Found ${chunkTransactions.length} transactions`)
          // Debug: log transaction hashes
          chunkTransactions.forEach(tx => {
            console.log(`  📄 ${tx.type}: ${tx.hash} (${tx.from})`)
          })
        } else {
          console.log(`📝 Chunk ${chunkCount}: No transactions found`)
        }
        
        // Calculate and report progress
        const blocksScanned = effectiveToBlock - fromBlock
        const progress = Math.min(100, Math.floor((Number(blocksScanned) / Number(totalBlocksToScan)) * 100))
        onProgress(progress)
        
        // Add small delay between chunks to avoid rate limits
        if (chunkCount < maxChunks) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

      } catch (error) {
        console.error(`❌ Failed to fetch transactions for chunk ${chunkCount} [${currentBlock}-${effectiveToBlock}]:`, error)
        // Continue with next chunk instead of failing completely
      }
    }

    onProgress(100) // Final progress update
    console.log(`✅ Chunked transaction search complete: Found ${allTransactions.length} total transactions`)
    return allTransactions
  } catch (error) {
    console.error('❌ Error in getChunkedTransactions:', error)
    throw error
  }
}




const METHOD_IDS = {
  BORROW_MAV: '0xa4b3bdfd',           // borrowQuote(uint128,uint128)
  BORROW_ETH: '0x7407572b',           // borrowQuoteToEth(address,uint128,uint128)
  REPAY_ETH: '0x59b34772',            // redeemTokenCollateralWithEth(address,uint128,uint128)
  REPAY_MAV: '0xa8b1a5b3'             // redeemTokenCollateral(uint128,uint128,uint128)
}

/**
 * Main function to calculate outstanding debt from blockchain transaction analysis
 * Uses Basescan API to find transactions, then processes them to calculate net balances
 * 
 * @param tokenAddress - The token contract address to analyze
 * @param days - Number of days to search back (default: 400 for full history)
 * @returns TopLendersResult with lenders, totals, and pool data
 */
export async function getOutstandingDebtFromBlockSearch(tokenAddress: string, days?: number): Promise<TopLendersResult> {
  log(`🔍 Starting method-based transaction search for outstanding debt`)
  log(`🔍 Token address: ${tokenAddress}`)
  
  try {
    // Step 1: Find transaction IDs using Basescan API
    const searchResult = await searchTransactionsByContractAndMethods(days)
    const result = searchResult.targetTransactions || []
    
    if (result.length === 0) {
      log(`📊 No transactions found in ${days} days`)
      return {
        lenders: [],
        totalLent: 0,
        totalPoolLiquidity: Number(await getLaunchPoolBalance()) / 1e18,
        tokenAddress,
        lastUpdated: new Date()
      }
    }
    
    log(`📊 Found ${result.length} transactions to process`)
    
    // Step 2: Process transactions and calculate outstanding debt
    log(`🔍 Step 2: Processing ${result.length} transactions...`)
    
    const { eventClient } = await import('./serverContracts')
    const outstandingDebts = new Map<string, bigint>() // wallet -> outstanding MAV debt
    
    for (const tx of result) {
      try {
        // Get full transaction details
        const fullTx = await eventClient.getTransaction({ hash: tx.txHash })
        
        // Get actual MAV amount from transfer events (more accurate than input parameters)
        let actualMAVAmount = await getActualMAVAmountFromEvents(fullTx, tx.from)
        
        // Fallback to input parameter decoding if transfer events fail
        if (!actualMAVAmount) {
          
          const decodedData = await decodeTransactionData(fullTx, tx.methodId)
          if (decodedData) {
            actualMAVAmount = decodedData.amount
        } else {
          continue
          }
        }
        
        const amount = actualMAVAmount
        
        
        const wallet = tx.from.toLowerCase()
        const currentDebt = outstandingDebts.get(wallet) || 0n
        
        // Update debt based on net MAV amount from transfer events
        // Positive amount = borrowed (increases debt), Negative amount = repaid (decreases debt)
        let newDebt = currentDebt + amount
        
        // Apply floor of 0 - no negative balances allowed
        if (newDebt < 0n) {
          console.log(`  🔧 ${wallet}: Flooring negative balance from ${Number(newDebt) / 1e18} to 0 MAV`)
          newDebt = 0n
        }
        
        outstandingDebts.set(wallet, newDebt)
        
        if (amount > 0n) {
          console.log(`  📈 ${wallet}: +${Number(amount) / 1e18} MAV (borrowed) = ${Number(newDebt) / 1e18} MAV`)
        } else if (amount < 0n) {
          console.log(`  📉 ${wallet}: ${Number(amount) / 1e18} MAV (repaid) = ${Number(newDebt) / 1e18} MAV`)
        }
        
  } catch (error) {
        console.error(`❌ Error processing transaction ${tx.txHash}:`, error.message)
      }
    }
    
    // Convert to lenders array (only wallets with outstanding debt > 1 MAV to filter dust)
    const lenders = Array.from(outstandingDebts.entries())
      .filter(([_, debt]) => debt > 1000000000000000000n) // Filter out dust (< 1 MAV)
      .map(([wallet, debt]) => ({
        address: wallet,
        balance: debt, // Use 'balance' to match LenderData interface
        poolPercentage: 0 // Will calculate after we have total
      }))
      .sort((a, b) => Number(b.balance - a.balance)) // Sort by debt amount descending
    
    const totalLent = lenders.reduce((sum, lender) => sum + lender.balance, 0n)
    
    // Convert balances from wei to MAV (divide by 10^18)
    const lendersInMAV = lenders.map(lender => ({
      ...lender,
      balance: Number(lender.balance) / 1e18 // Convert from wei to MAV
    }))
    
    // Calculate percentages
    lendersInMAV.forEach(lender => {
      lender.poolPercentage = totalLent > 0n ? Number((BigInt(Math.floor(lender.balance * 1e18)) * 10000n) / totalLent) / 100 : 0
    })
    
    console.log(`📊 Found ${lenders.length} wallets with outstanding debt`)
    console.log(`📊 Total outstanding debt: ${Number(totalLent) / 1e18} MAV`)
    
    
    return {
      lenders: lendersInMAV,
      totalLent: Number(totalLent) / 1e18, // Convert to MAV
      totalPoolLiquidity: Number(await getLaunchPoolBalance()) / 1e18, // Convert to MAV
      tokenAddress,
      lastUpdated: new Date()
    }
    
    } catch (error) {
    console.error('❌ Error in method-based search:', error)
    throw new Error(`Method-based search failed: ${error.message}`)
  }
}

// Helper function to get available liquidity (total MAV supply)
async function getLaunchPoolBalance(): Promise<bigint> {
  try {
    // Import eventClient for this function
    const { eventClient } = await import('./serverContracts')
    
    // Try to get the total supply of the Launch Token (MAV) which represents available liquidity
    const totalSupply = await eventClient.readContract({
      address: MAV_TOKEN_ADDRESS as `0x${string}`,
      abi: LaunchTokenABI,
      functionName: 'totalSupply'
    })
    console.log(`📊 Available liquidity (total MAV supply): ${Number(totalSupply) / 1e18} MAV`)
    return totalSupply as bigint
  } catch (error) {
    console.log(`⚠️  Launch token totalSupply not available, using default liquidity`)
    console.log(`📊 Using default available liquidity: 329,568.8 MAV`)
    return 329568801605593620299305n // Default pool size from previous runs
  }
}

// Helper function to get actual MAV amount from transfer events
async function getActualMAVAmountFromEvents(tx: any, userAddress: string): Promise<bigint | null> {
  try {
    // Get transaction receipt to access events
    const receipt = await eventClient.getTransactionReceipt({ hash: tx.hash })
    
    // MAV token address
    const mavTokenAddress = MAV_TOKEN_ADDRESS
    
    
    // Look for Transfer events where MAV is sent TO the user (borrowing)
    const mavToUser = receipt.logs.filter(log => {
      // Check if this is a Transfer event from MAV token
      const isMAVTransfer = log.address.toLowerCase() === MAV_TOKEN_ADDRESS.toLowerCase() &&
                           log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      
      if (!isMAVTransfer) return false
      
      // Check if MAV is sent TO the user
      const to = log.topics[2] ? '0x' + log.topics[2].slice(26) : '' // Remove padding
      const isToUser = to.toLowerCase() === userAddress.toLowerCase()
      
      // DEBUG: Log for test wallet
      
      return isToUser
    })
    
    // Look for Transfer events where MAV is sent FROM the user (repaying)
    const mavFromUser = receipt.logs.filter(log => {
      // Check if this is a Transfer event from MAV token
      const isMAVTransfer = log.address.toLowerCase() === MAV_TOKEN_ADDRESS.toLowerCase() &&
                           log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      
      if (!isMAVTransfer) return false
      
      // Check if MAV is sent FROM the user
      const from = log.topics[1] ? '0x' + log.topics[1].slice(26) : '' // Remove padding
      return from.toLowerCase() === userAddress.toLowerCase()
    })
    
    // Calculate net MAV amount (borrowed - repaid)
    let netMAVAmount = 0n
    
    // Add MAV received (borrowing)
    for (const event of mavToUser) {
      const amount = BigInt(event.data)
      netMAVAmount += amount
    }
    
    // Subtract MAV sent (repaying)
    for (const event of mavFromUser) {
      const amount = BigInt(event.data)
      netMAVAmount -= amount
    }
    
    
    // Return the net amount (positive = borrowed, negative = repaid)
    return netMAVAmount
    
  } catch (error) {
    console.error('❌ Error getting MAV amount from events:', error)
    return null
  }
}

// Helper function to decode transaction data based on method ID
async function decodeTransactionData(tx: any, methodId: string): Promise<{ amount: bigint } | null> {
  try {
    // MAV token has 18 decimals, so we need to account for this
    const MAV_DECIMALS = 18n
    const DECIMAL_FACTOR = 10n ** MAV_DECIMALS
    
    // For now, we'll extract amounts from the input data
    // This is a simplified approach - in production you'd want proper ABI decoding
    
    if (methodId === METHOD_IDS.BORROW_MAV) {
      // borrowQuote(uint128,uint128) - first parameter is maxQuoteBorrowed (actual amount requested)
      const amountHex = tx.input.slice(10, 74) // Skip method ID, get first 32 bytes
      const rawAmount = BigInt('0x' + amountHex)
      const amount = rawAmount / DECIMAL_FACTOR // Convert from wei to MAV
      return { amount }
    } else if (methodId === METHOD_IDS.BORROW_ETH) {
      // borrowQuoteToEth(address,uint128,uint128) - second parameter is tokenBorrowAmount
      const amountHex = tx.input.slice(74, 138) // Skip method ID + address, get second 32 bytes
      const rawAmount = BigInt('0x' + amountHex)
      const amount = rawAmount / DECIMAL_FACTOR // Convert from wei to MAV
      return { amount }
    } else if (methodId === METHOD_IDS.REPAY_ETH) {
      // redeemTokenCollateralWithEth(address,uint128,uint128) - second parameter is maxRedeemTokenAmount
      const amountHex = tx.input.slice(74, 138) // Skip method ID + address, get second 32 bytes
      const rawAmount = BigInt('0x' + amountHex)
      const amount = rawAmount / DECIMAL_FACTOR // Convert from wei to MAV
      return { amount }
    } else if (methodId === METHOD_IDS.REPAY_MAV) {
      // redeemTokenCollateral(uint128,uint128,uint128) - first parameter is maxRedeemTokenAmount
      const amountHex = tx.input.slice(10, 74) // Skip method ID, get first 32 bytes
      const rawAmount = BigInt('0x' + amountHex)
      const amount = rawAmount / DECIMAL_FACTOR // Convert from wei to MAV
      return { amount }
    }
    
    return null
    } catch (error) {
    console.error('❌ Error decoding transaction data:', error)
    return null
  }
}export async function searchTransactionsByContractAndMethods(days?: number, fromBlock?: string | null): Promise<{targetTransactions: any[], methodCounts: Record<string, number>}> {
  console.log(`🔍 Step 1: Searching for transactions using Basescan API`)
  
  try {
    const BASESCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '' // Using existing env var, fallback to no key
    const TARGET_METHOD_IDS = Object.values(METHOD_IDS)
    const OFFSET = 200 // Transactions per page
    
    console.log(`🎯 Target method IDs:`, TARGET_METHOD_IDS)
    console.log(`🔍 Using Basescan API with offset: ${OFFSET}`)
    
    let allTransactions: any[] = []
    let page = 1
    let hasMore = true
    
    // Get transactions (incremental or full historical)
    if (fromBlock) {
      console.log(`📊 Fetching incremental transactions from block ${fromBlock}`)
    } else {
      console.log(`📊 Fetching ALL historical transactions for debt calculation`)
    }
    
    // Paginated fetch with retry for rate limits
    while (hasMore) {
      let retries = 0
      let data: any
      let success = false
      
      while (retries < 3 && !success) {
        const startBlock = fromBlock || '0'
        const url = `https://api.etherscan.io/v2/api?chainid=8453&module=account&action=txlist&address=${ITOKEN_MANAGER_ADDRESS}&startblock=${startBlock}&endblock=99999999&page=${page}&offset=${OFFSET}&sort=asc${BASESCAN_API_KEY ? `&apikey=${BASESCAN_API_KEY}` : ''}`
        
        try {
          console.log(`🔍 Fetching page ${page} (${OFFSET} transactions per page)`)
          const res = await fetch(url)
          data = await res.json()
          
          if (data.status === '1') {
            success = true
            break
          }
          
          // Handle status "0" responses
          if (data.status === '0') {
            if (data.message && data.message.includes('rate limit')) {
              console.log(`⏳ Rate limited, waiting ${1000 * (retries + 1)}ms...`)
              await new Promise(r => setTimeout(r, 1000 * (retries + 1))) // Exponential backoff
              retries++
            } else if (data.message && data.message.includes('No transactions found')) {
              console.log(`📊 No more transactions found, stopping pagination`)
              hasMore = false
              break
            } else {
              console.error(`❌ API error:`, data.message)
              retries++
              if (retries < 3) {
                await new Promise(r => setTimeout(r, 1000))
              }
            }
          } else {
            console.error(`❌ Unexpected API response:`, data)
            retries++
            if (retries < 3) {
              await new Promise(r => setTimeout(r, 1000))
            }
          }
        } catch (e) {
          console.error(`❌ Network error (attempt ${retries + 1}):`, e.message)
          retries++
          if (retries < 3) {
            await new Promise(r => setTimeout(r, 1000))
          }
        }
      }
      
      if (!success) {
        if (hasMore === false) {
          // We intentionally stopped due to "No transactions found"
          break
        }
        console.error(`❌ API fetch failed after retries:`, data?.message)
        throw new Error('Basescan API fetch failed after retries')
      }
      
      const results = data.result || []
      console.log(`📊 Page ${page}: Found ${results.length} transactions`)
      
      // Check if result is not an array (rare error case)
      if (!Array.isArray(results)) {
        console.error(`❌ API returned non-array result:`, results)
        throw new Error('API returned invalid data format')
      }
      
      if (results.length === 0) {
        console.log(`📊 No more transactions found, stopping pagination`)
        hasMore = false
        break
      }
      
      // Filter for our target methods
      let pageTargetCount = 0
      results.forEach((tx: any) => {
        if (tx.isError === '1' || tx.to?.toLowerCase() !== ITOKEN_MANAGER_ADDRESS.toLowerCase()) return
        
        const methodId = tx.input ? tx.input.slice(0, 10) : ''
        if (!TARGET_METHOD_IDS.includes(methodId)) return
        
        allTransactions.push({
          txHash: tx.hash,
          from: tx.from,
          methodId: methodId,
          blockNumber: tx.blockNumber,
          inputLength: tx.input.length,
          timestamp: tx.timeStamp
        })
        pageTargetCount++
      })
      
      console.log(`  🎯 Found ${pageTargetCount} target method transactions on page ${page}`)
      
      // Check if we should continue to next page
      hasMore = results.length === OFFSET
      page++
      
      if (hasMore) {
        console.log(`📊 Moving to page ${page}...`)
      } else {
        console.log(`📊 Last page reached (${results.length} < ${OFFSET})`)
      }
    }
    
    console.log(`📊 Total target method transactions found: ${allTransactions.length}`)
    
    // Group by method type for analysis
    const methodCounts = allTransactions.reduce((acc, tx) => {
      acc[tx.methodId] = (acc[tx.methodId] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log(`📊 Method breakdown:`, methodCounts)
    
    return {
      targetTransactions: allTransactions,
      methodCounts
    }
    
  } catch (error) {
    console.error('❌ Error in Step 1:', error)
    console.log(`🔄 Falling back to chunked approach...`)
    
    // Fallback to chunked approach
    return await searchTransactionsByChunkedApproach(days)
  }
}

// Fallback: Chunked approach for when Basescan API is not available
async function searchTransactionsByChunkedApproach(days: number = 30): Promise<{targetTransactions: any[], methodCounts: Record<string, number>}> {
  console.log(`🔍 Fallback: Using chunked approach for ${days} days`)
  
  try {
    const { eventClient } = await import('./serverContracts')
    const TARGET_METHOD_IDS = Object.values(METHOD_IDS)
    const iTokenManagerAddress = ITOKEN_MANAGER_ADDRESS
    
    // Calculate block range
    const currentBlock = await eventClient.getBlockNumber()
    const blocksPerDay = 7200 // Approximate blocks per day on Base
    const startBlock = currentBlock - BigInt(days * blocksPerDay)
    
    console.log(`📊 Searching blocks ${startBlock} to ${currentBlock} (${days} days)`)
    
    const CHUNK_SIZE = 1000 // Smaller chunks for better performance
    let allTransactions: any[] = []
    let currentBlockNum = startBlock
    
    while (currentBlockNum < currentBlock) {
      const endBlock = currentBlockNum + BigInt(CHUNK_SIZE)
      const actualEndBlock = endBlock > currentBlock ? currentBlock : endBlock
      
      console.log(`🔍 Searching blocks ${currentBlockNum} to ${actualEndBlock}`)
      
      try {
        const logs = await eventClient.getLogs({
          address: ITOKEN_MANAGER_ADDRESS as `0x${string}`,
          fromBlock: currentBlockNum,
          toBlock: actualEndBlock
        })
        
        console.log(`  📊 Found ${logs.length} logs in chunk`)
        
        // Get unique transaction hashes
        const uniqueTxHashes = [...new Set(logs.map(log => log.transactionHash))]
        console.log(`  📊 Unique transactions in chunk: ${uniqueTxHashes.length}`)
        
        // Fetch transaction details for unique hashes
        for (const txHash of uniqueTxHashes) {
          try {
            const tx = await eventClient.getTransaction({ hash: txHash })
            
            if (tx.to?.toLowerCase() !== ITOKEN_MANAGER_ADDRESS.toLowerCase()) continue
            
            const methodId = tx.input.slice(0, 10)
            if (!TARGET_METHOD_IDS.includes(methodId)) continue
            
            allTransactions.push({
              txHash: tx.hash,
              from: tx.from,
              methodId: methodId,
              blockNumber: tx.blockNumber.toString(), // Convert BigInt to string
              inputLength: tx.input.length
            })
            
            console.log(`    🎯 Found target method: ${methodId} from ${tx.from}`)
          } catch (txError) {
            console.error(`    ❌ Error fetching transaction ${txHash}:`, txError.message)
          }
        }
        
        console.log(`  📊 Chunk complete: ${allTransactions.length} target transactions found so far`)
        
      } catch (chunkError) {
        console.error(`❌ Error in chunk ${currentBlockNum}-${actualEndBlock}:`, chunkError.message)
        // Continue with next chunk
      }
      
      currentBlockNum = actualEndBlock + 1n
    }
    
    console.log(`📊 Total target method transactions found: ${allTransactions.length}`)
    
    // Group by method type for analysis
    const methodCounts = allTransactions.reduce((acc, tx) => {
      acc[tx.methodId] = (acc[tx.methodId] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log(`📊 Method breakdown:`, methodCounts)
    
            return {
      targetTransactions: allTransactions,
      methodCounts
    }

  } catch (error) {
    console.error('❌ Error in chunked approach:', error)
    throw new Error(`Chunked approach failed: ${error.message}`)
  }
}

// Method-based transaction search for outstanding debt calculation
