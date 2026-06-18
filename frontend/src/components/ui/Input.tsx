import { forwardRef, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, id, label, ...props },
  ref,
) {
  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={id}>
      {label ? (
        <span className="font-display text-label-caps uppercase tracking-wide text-on-surface-variant">
          {label}
        </span>
      ) : null}
      <input
        ref={ref}
        id={id}
        className={clsx(
          'h-row-height rounded border bg-surface-container-lowest px-3 font-body text-body-md text-on-surface',
          'placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-error' : 'border-outline-variant',
          className,
        )}
        {...props}
      />
      {error ? <span className="font-body text-body-sm text-error">{error}</span> : null}
    </label>
  )
})
