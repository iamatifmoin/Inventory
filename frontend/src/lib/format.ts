export function formatCurrency(amount: string): string {
  const value = Number.parseFloat(amount)

  return `\u20B9${value.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`
}

export function formatOrderId(id: number): string {
  return `#${id.toString().padStart(5, '0')}`
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
