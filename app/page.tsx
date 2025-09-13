'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { TokenInput } from '../src/components/TokenInput'
import { LoadLendersButton } from '../src/components/LoadLendersButton'
import { TopLendersTable } from '../src/components/TopLendersTable'
import { Loading } from '../src/components/Loading'
import { Error } from '../src/components/Error'
import { LenderData } from '../lib/mappingUtils'

// Import constants for display
const LOG_CHUNK_SIZE = 3000 // Should match the constant in mappingUtils.ts

export default function HomePage() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [tokenAddress, setTokenAddress] = useState('')
  const [lenders, setLenders] = useState<LenderData[]>([])
  const [totalLent, setTotalLent] = useState<number>(0)
  const [totalPoolLiquidity, setTotalPoolLiquidity] = useState<number>(0)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')


  const handleLoadLenders = async () => {
    if (!tokenAddress.trim()) {
      setErrorMessage('Please enter a token address')
      return
    }

    // Basic validation for Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress.trim())) {
      setErrorMessage('Please enter a valid Ethereum address')
      return
    }

    setLoading(true)
    setProgress(0)
    setErrorMessage('')

    // Simulate progress updates while the API call is running
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev === null) return null
        if (prev >= 95) return prev // Don't go to 100% until we're done
        const increment = Math.floor(Math.random() * 15) + 1 // Random increment between 1-15%
        return Math.min(prev + increment, 95) // Cap at 95% until completion
      })
    }, 1000) // Update every second

    try {
      console.log('Loading lenders for token:', tokenAddress)
      
      // Call our API route to get live blockchain data (no CORS issues)
      const response = await fetch('/api/lenders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tokenAddress: tokenAddress.trim()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMsg: string = errorData.error || 'Failed to fetch lenders data'
        throw errorMsg
      }

          const result = await response.json()
          setLenders(result.lenders)
          setTotalLent(result.totalLent) // Already in MAV from API
          setTotalPoolLiquidity(result.totalPoolLiquidity) // Already in MAV from API
          setLastUpdated(new Date(result.lastUpdated || new Date().toISOString()))

      console.log('Successfully loaded LIVE lenders data')
    } catch (error) {
      console.error('Error loading lenders:', error)
      const errorMessage = typeof error === 'string' ? error : 'Failed to load lenders data'
      setErrorMessage(errorMessage)
    } finally {
      clearInterval(progressInterval)
      setProgress(100) // Show 100% briefly before hiding
      setTimeout(() => {
        setLoading(false)
        setProgress(null)
      }, 500) // Wait 500ms to show 100% completion
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Stealth Co-Founder Challenge
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Connection (Optional)</h2>
          
          {account.status === 'connected' ? (
            <div className="space-y-2">
              <p className="text-green-600">✅ Connected: {account.address}</p>
              <p className="text-sm text-gray-600">Chain ID: {account.chainId}</p>
              <button
                onClick={() => disconnect()}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">Connect your wallet for additional features (search works without wallet)</p>
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  disabled={status === 'pending'}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {status === 'pending' ? 'Connecting...' : `Connect ${connector.name}`}
                </button>
              ))}
              {error && <p className="text-red-500 text-sm">{error.message}</p>}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Top Lenders Analysis</h2>
          
          {account.status !== 'connected' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>No wallet required!</strong> You can search for lending data without connecting a wallet. 
                All data is read from the public blockchain.
              </p>
            </div>
          )}
            
            <div className="space-y-4">
              <TokenInput
                value={tokenAddress}
                onChange={setTokenAddress}
                placeholder="Enter token address (e.g., 0x...)"
              />
              
              
              <LoadLendersButton
                onClick={handleLoadLenders}
                loading={loading}
                disabled={!tokenAddress.trim()}
              />
              
              {loading && (
                <div className="space-y-4">
                  <Loading />
                  {progress !== null && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">Scanning blockchain...</span>
                        <span className="text-sm text-blue-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        {progress < 20 ? "Fetching transaction history from blockchain..." :
                         progress < 60 ? "Processing transactions and calculating debt..." :
                         progress < 90 ? "Finalizing calculations..." :
                         "Almost done..."}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {errorMessage && <Error message={errorMessage} />}
              
              {lenders.length > 0 ? (
                <TopLendersTable
                  lenders={lenders}
                  totalLent={totalLent}
                  totalPoolLiquidity={totalPoolLiquidity}
                  tokenAddress={tokenAddress}
                  lastUpdated={lastUpdated}
                />
              ) : (
                !loading && !errorMessage && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          No Lending Activity Found
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            No recent lending activity was found for this token address. 
                            The analyzed transaction appears to be a quote/query rather than an actual lending transaction.
                          </p>
                          <p className="mt-2">
                            <strong>Last analyzed:</strong> {lastUpdated ? lastUpdated.toISOString().replace('T', ' ').slice(0, 19) : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
      </div>
    </div>
  )
}
