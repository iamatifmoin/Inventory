import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'compact'
  icon?: ReactNode
}

export function Button({
  children,
  className,
  disabled,
  icon,
  size = 'default',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded font-body transition duration-150',
        'focus-visible:outline-none focus-visible:ring-0',
        size === 'default' ? 'h-row-height px-4 text-body-md' : 'h-8 px-3 text-body-sm',
        variant === 'primary' &&
          'bg-primary text-on-primary hover:brightness-110 active:brightness-95',
        variant === 'secondary' &&
          'border border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container',
        variant === 'ghost' &&
          'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
        variant === 'destructive' &&
          'border border-error/40 text-error hover:bg-error/10 hover:text-error',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className,
      )}
      {...props}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </button>
  )
}
