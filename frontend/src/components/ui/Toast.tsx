import { AlertCircle, CheckCircle, X } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import clsx from 'clsx'

type ToastVariant = 'error' | 'success'

type ToastItem = {
  id: number
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  dismiss: (id: number) => void
  error: (message: string) => number
  success: (message: string) => number
  toast: (message: string, variant: ToastVariant) => number
}

const TOAST_DURATION_MS = 4000

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: number) => void
}) {
  const isError = item.variant === 'error'
  const Icon = isError ? AlertCircle : CheckCircle

  return (
    <div
      className={clsx(
        'flex items-start gap-3 rounded border px-4 py-3 shadow-2xl shadow-black/40',
        isError
          ? 'border-error/40 bg-error/10 text-error'
          : 'border-success/40 bg-success-container/70 text-success',
      )}
      role="status"
      aria-live="polite"
    >
      <Icon size={18} strokeWidth={1.8} className="mt-0.5 shrink-0" />
      <p className="flex-1 font-body text-body-sm">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="shrink-0 transition-opacity hover:opacity-80"
        aria-label="Dismiss notification"
      >
        <X size={14} strokeWidth={1.8} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextIdRef = useRef(1)
  const timeoutMapRef = useRef<Map<number, number>>(new Map())

  const dismiss = useCallback((id: number) => {
    const timeoutId = timeoutMapRef.current.get(id)
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
      timeoutMapRef.current.delete(id)
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = nextIdRef.current++

      setToasts((currentToasts) => [...currentToasts, { id, message, variant }])

      const timeoutId = window.setTimeout(() => dismiss(id), TOAST_DURATION_MS)
      timeoutMapRef.current.set(id, timeoutId)

      return id
    },
    [dismiss],
  )

  useEffect(() => {
    return () => {
      timeoutMapRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeoutMapRef.current.clear()
    }
  }, [])

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      dismiss,
      error: (message: string) => toast(message, 'error'),
      success: (message: string) => toast(message, 'success'),
      toast,
    }),
    [dismiss, toast],
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed bottom-24 right-4 z-[120] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3 md:bottom-4">
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastCard item={item} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.')
  }

  return context
}
