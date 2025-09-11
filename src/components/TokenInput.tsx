interface TokenInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TokenInput({ value, onChange, placeholder }: TokenInputProps) {
  return (
    <div>
      <label htmlFor="token-address" className="block text-sm font-medium text-gray-700 mb-2">
        Token Address
      </label>
      <input
        id="token-address"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}
