interface SearchTimeframeSelectorProps {
  value: number
  onChange: (days: number) => void
  disabled?: boolean
}

export function SearchTimeframeSelector({ value, onChange, disabled = false }: SearchTimeframeSelectorProps) {
  // Simplified options with rounded time estimates (10 seconds per day)
  const options = [
    { days: 1, label: '1 day', estimate: '~10s' },
    { days: 3, label: '3 days', estimate: '~30s' },
    { days: 7, label: '1 week', estimate: '~1m' },
    { days: 14, label: '2 weeks', estimate: '~2m' },
    { days: 30, label: '1 month', estimate: '~5m' }
  ]

  const selectedOption = options.find(opt => opt.days === value) || options[1] // Default to 3 days

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Search Timeframe
      </label>
      
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.days}
            type="button"
            onClick={() => onChange(option.days)}
            disabled={disabled}
            className={`
              px-3 py-1.5 text-sm rounded-md border transition-colors whitespace-nowrap
              ${value === option.days
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {option.label} <span className="text-xs opacity-75">({option.estimate})</span>
          </button>
        ))}
      </div>
      
      <div className="text-xs text-gray-500">
        <p>💡 <strong>Current:</strong> {selectedOption.label} ({selectedOption.estimate}) • Time estimates based on 10 seconds per day</p>
      </div>
    </div>
  )
}
