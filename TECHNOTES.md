# Technical Notes - Stealth Co-Founder Challenge

## ABI Extraction Process ✅

### Method: Remix IDE + Compiler Artifacts
1. **Main Contract (0xb7F5cC780B9e391e618323023A392935F44AeACE)**
   - Used Remix IDE Contract Verifier with Sourcify
   - Compiled source code to generate artifacts
   - Extracted ABI from `LaunchToken.json` artifact
   - Saved to `/abi/LaunchToken.json`

2. **iTokenManager (0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c)**
   - Extracted from `ITokenManager.json` artifact in Remix
   - Contains lending contract interface functions
   - Saved to `/abi/ITokenManager.json`

3. **iTokenManagerLens (Lens Contract)**
   - Extracted from `ITokenManagerLens.json` artifact in Remix
   - Contains lens functions for reading lending data
   - Saved to `/abi/ITokenManagerLens.json`

## Implementation Method ✅

### Core Algorithm: Basescan API + Transaction Analysis
- **Data Source**: Real blockchain transactions via Basescan API
- **Transaction Parsing**: Extracts borrower addresses and amounts from transaction input data
- **Transfer Event Analysis**: Gets actual MAV amounts from ERC-20 transfer events
- **Net Balance Calculation**: Borrows (positive) - Repays (negative) = Outstanding debt
- **Zero Floor**: No negative balances (minimum 0 MAV)

### Function Signatures Used
```typescript
const METHOD_IDS = {
  BORROW_MAV: '0xa4b3bdfd',    // borrowQuote(uint128,uint128)
  BORROW_ETH: '0x7407572b',    // borrowQuoteToEth(address,uint128,uint128)
  REPAY_ETH: '0x59b34772',     // redeemTokenCollateralWithEth(address,uint128,uint128)
  REPAY_MAV: '0xa8b1a5b3'      // redeemTokenCollateral(uint128,uint128,uint128)
}
```

### Key Discovery
**Transaction sender (`tx.from`) is the borrower address**, not addresses from input data.

### Data Flow
1. **Basescan API**: Fetch transaction hashes for target methods
2. **Transaction Analysis**: Parse input data to extract amounts
3. **Transfer Events**: Get actual MAV amounts from transaction receipts
4. **Balance Calculation**: Aggregate net balances per user
5. **Pool Data**: Fetch Launch Pool MAV balance dynamically
6. **Results**: Return top 10 lenders with formatted data

## Architecture

### Frontend
- **Next.js Pages Router**: API routes for server-side blockchain calls
- **wagmi + viem**: Wallet connection and Base Mainnet integration
- **TypeScript**: Type safety and development experience

### Backend
- **API Route**: `/api/lenders` handles blockchain data fetching
- **Basescan API**: Efficient transaction discovery
- **viem**: Blockchain interaction and contract calls
- **Error Handling**: Graceful degradation with proper error messages

### Data Structures
```typescript
interface LenderData {
  address: string
  balance: number        // MAV amount (converted from wei)
  poolPercentage: number
}

interface TopLendersResult {
  lenders: LenderData[]
  totalLent: number      // Total outstanding debt in MAV
  totalPoolLiquidity: number  // Available liquidity in MAV
  tokenAddress: string
  lastUpdated: Date
}
```

## Security & Configuration

### Environment Variables
- `ANKR_API_URL`: RPC endpoint with API key
- `ETHERSCAN_API_KEY`: Basescan API key
- `MAV_TOKEN_ADDRESS`: MAV token contract address
- `LAUNCH_POOL_ADDRESS`: Launch Pool contract address
- `ITOKEN_MANAGER_ADDRESS`: iTokenManager contract address
- `DEBUG_MODE`: Enable/disable debug logging

### Security Measures
- ✅ **No hardcoded API keys**: All sensitive data in environment variables
- ✅ **Input validation**: Ethereum address format validation
- ✅ **Error handling**: Comprehensive error management
- ✅ **Rate limiting**: Built-in retry logic for API calls
- ✅ **Timeout protection**: 180-second timeout for API calls

## Performance Optimizations

### Chunked Processing
- **Block chunks**: 3000 blocks per chunk (Ankr API limit)
- **Transaction limits**: Max 50 transactions per chunk
- **Progress tracking**: Real-time progress updates
- **RPC rotation**: Multiple endpoint fallbacks

### Data Filtering
- **Dust filtering**: Excludes balances < 1 MAV
- **Method filtering**: Only processes borrow/repay transactions
- **Address validation**: Skips contract addresses

## Challenge Compliance ✅

- ✅ **Real Contract Interaction**: Reads from unverified iTokenManager contract
- ✅ **Non-trivial Data Structures**: Complex transaction parsing and balance calculation
- ✅ **Live Blockchain Data**: No mock data, all real transaction analysis
- ✅ **ABI Documentation**: Complete extraction process documented
- ✅ **Production Ready**: Clean code, proper error handling, security measures

## Tools Used

- **Remix IDE**: ABI extraction from compiler artifacts
- **viem**: Blockchain interactions and contract calls
- **wagmi**: Wallet connection and Base Mainnet integration
- **Next.js**: Full-stack framework with API routes
- **TypeScript**: Type safety and development experience
- **Basescan API**: Efficient transaction discovery