import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-600">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
          'placeholder:text-slate-400',
          'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : '',
          className,
        ].join(' ')}
        {...rest}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
