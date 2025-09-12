interface LoadLendersButtonProps {
  onClick: () => void
  loading: boolean
  disabled?: boolean
}

export function LoadLendersButton({ onClick, loading, disabled }: LoadLendersButtonProps) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Load Top Lenders'}
      </button>
      <p className="text-sm text-gray-600 text-center">
        ⏱️ Processing full historical data may take 1-3 minutes
      </p>
    </div>
  )
}
