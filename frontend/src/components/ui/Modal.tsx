import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import clsx from 'clsx'

const TRANSITION_MS = 180

type ModalProps = {
  children: ReactNode
  className?: string
  footer?: ReactNode
  onClose: () => void
  open: boolean
  title: string
}

export function Modal({ children, className, footer, onClose, open, title }: ModalProps) {
  const [isMounted, setIsMounted] = useState(open)
  const [isVisible, setIsVisible] = useState(open)

  useEffect(() => {
    if (open) {
      setIsMounted(true)
      const frame = window.requestAnimationFrame(() => setIsVisible(true))

      return () => window.cancelAnimationFrame(frame)
    }

    setIsVisible(false)
    const timeout = window.setTimeout(() => setIsMounted(false), TRANSITION_MS)

    return () => window.clearTimeout(timeout)
  }, [open])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!isMounted) {
    return null
  }

  return createPortal(
    <div
      className={clsx(
        'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200',
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(
          'flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col rounded-lg border border-outline-variant bg-surface-container shadow-2xl shadow-black/40',
          'transition duration-200',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant/40 px-4 py-3">
          <h2 className="font-display text-headline-sm text-on-surface">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant/40 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label={`Close ${title}`}
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-4 py-4">{children}</div>

        {footer ? (
          <div className="flex justify-end gap-2 border-t border-outline-variant/40 px-4 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
