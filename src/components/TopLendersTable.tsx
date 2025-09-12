import { LenderData } from '../../lib/mappingUtils'

interface TopLendersTableProps {
  lenders: LenderData[]
  totalLent: number
  totalPoolLiquidity: number
  tokenAddress: string
  lastUpdated: Date | null
}

export function TopLendersTable({ lenders, totalLent, totalPoolLiquidity, tokenAddress, lastUpdated }: TopLendersTableProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: number | undefined) => {
    if (!balance) return '0 MAV'
    
    // Backend already converts from wei to MAV, so no need to divide by 1e18
    return `${balance.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} MAV`
  }

  const formatTotalLent = (total: number | undefined) => {
    if (!total) return '0 MAV'
    
    // Backend already converts from wei to MAV, so no need to divide by 1e18
    return `${total.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} MAV`
  }

  const formatTotalPoolLiquidity = (total: number | undefined) => {
    if (!total) return '0 MAV'
    
    // Backend already converts from wei to MAV, so no need to divide by 1e18
    return `${total.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} MAV`
  }

  const formatTotalPoolSize = (totalLent: number | undefined, availableLiquidity: number | undefined) => {
    if (!totalLent && !availableLiquidity) return '0 MAV'
    
    // Both values are already in MAV units from the API
    const totalLentMAV = totalLent || 0
    const availableLiquidityMAV = availableLiquidity || 0
    const totalPoolSize = totalLentMAV + availableLiquidityMAV
    
    // Format with commas and up to 2 decimal places, removing trailing zeros
    return `${totalPoolSize.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} MAV`
  }

  return (
    <div className="space-y-4">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        {/* Row 1: Token Address */}
        <div>
          <h3 className="font-semibold text-gray-700">Token Address</h3>
          <p className="text-sm text-gray-600 break-all">{tokenAddress}</p>
        </div>
        
        {/* Row 2: Lending Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <h3 className="font-semibold text-gray-700">Total Lent</h3>
            <p className="text-sm text-gray-600">{formatTotalLent(totalLent)}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Available Liquidity</h3>
            <p className="text-sm text-gray-600">{formatTotalPoolLiquidity(totalPoolLiquidity)}</p>
          </div>
        </div>
        
        {/* Row 3: Pool Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <h3 className="font-semibold text-gray-700">Total Pool Size</h3>
            <p className="text-sm text-gray-600">{formatTotalPoolSize(totalLent, totalPoolLiquidity)}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Last Updated</h3>
            <p className="text-sm text-gray-600">{lastUpdated ? lastUpdated.toISOString().replace('T', ' ').slice(0, 19) : 'Never'}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wallet Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Outstanding Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pool Percentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lenders.map((lender, index) => (
              <tr key={lender.address} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <a
                    href={`https://basescan.org/address/${lender.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {formatAddress(lender.address)}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatBalance(lender.balance)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lender.poolPercentage < 0.01 ? 
                    '<0.01%' : 
                    `${lender.poolPercentage.toFixed(2)}%`
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lenders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No lenders found for this token address.
        </div>
      )}
    </div>
  )
}
