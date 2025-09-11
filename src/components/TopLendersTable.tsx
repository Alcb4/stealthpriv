import { LenderData } from '../../lib/mappingUtils'

interface TopLendersTableProps {
  lenders: LenderData[]
  totalLent: bigint
  totalPoolLiquidity: bigint
  tokenAddress: string
  lastUpdated: Date | null
}

export function TopLendersTable({ lenders, totalLent, totalPoolLiquidity, tokenAddress, lastUpdated }: TopLendersTableProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: bigint) => {
    const balanceStr = balance.toString()
    // Convert wei to MAV (1 MAV = 10^18 wei)
    const mav = Number(balanceStr) / 1e18
    // Format with up to 2 decimal places, removing trailing zeros
    return `${mav.toFixed(2).replace(/\.?0+$/, '')} MAV`
  }

  const formatTotalLent = (total: bigint) => {
    const totalStr = total.toString()
    // Convert wei to MAV (1 MAV = 10^18 wei)
    const mav = Number(totalStr) / 1e18
    // Format with up to 2 decimal places, removing trailing zeros
    return `${mav.toFixed(2).replace(/\.?0+$/, '')} MAV`
  }

  const formatTotalPoolLiquidity = (total: bigint) => {
    const totalStr = total.toString()
    // Convert wei to MAV (1 MAV = 10^18 wei)
    const mav = Number(totalStr) / 1e18
    // Format with up to 2 decimal places, removing trailing zeros
    return `${mav.toFixed(2).replace(/\.?0+$/, '')} MAV`
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-semibold text-gray-700">Token Address</h3>
          <p className="text-sm text-gray-600 break-all">{tokenAddress}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700">Total Lent</h3>
          <p className="text-sm text-gray-600">{formatTotalLent(totalLent)}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700">Total Pool Size</h3>
          <p className="text-sm text-gray-600">{formatTotalPoolLiquidity(totalPoolLiquidity)}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700">Last Updated</h3>
          <p className="text-sm text-gray-600">{lastUpdated ? lastUpdated.toISOString().replace('T', ' ').slice(0, 19) : 'Never'}</p>
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
