interface LoadLendersButtonProps {
  onClick: () => void
  loading: boolean
  disabled?: boolean
}

export function LoadLendersButton({ onClick, loading, disabled }: LoadLendersButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Loading...' : 'Load Top Lenders'}
    </button>
  )
}
